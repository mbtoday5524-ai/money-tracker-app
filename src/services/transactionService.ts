import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Transaction, UserSettings, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const syncUserProfile = async (userId: string, profile: { email: string | null, displayName: string | null, photoURL: string | null }) => {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, path));
    const data = snap.exists() ? snap.data() : {};
    
    const dataToSave = {
      ...profile,
      active: data.active ?? false,
      lastLogin: serverTimestamp(),
    };
    Object.keys(dataToSave).forEach(key => {
      if ((dataToSave as any)[key] === undefined) {
        delete (dataToSave as any)[key];
      }
    });

    await setDoc(doc(db, path), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getAllUsers = async (): Promise<any[]> => {
  const path = `users`;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateUserActivation = async (userId: string, active: boolean) => {
  const pathStatus = `users/${userId}/account/status`;
  const pathUser = `users/${userId}`;
  try {
    await Promise.all([
      setDoc(doc(db, pathStatus), { active, updatedAt: serverTimestamp() }, { merge: true }),
      setDoc(doc(db, pathUser), { active }, { merge: true })
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathStatus);
  }
};

export const validateActivationCode = async (userId: string, code: string): Promise<boolean> => {
  try {
    const settings = await getGlobalSettings();
    if (!settings.masterActivationCode) return false;
    
    if (code === settings.masterActivationCode) {
      await updateUserActivation(userId, true);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error validating activation code:", error);
    return false;
  }
};

export const getAllGlobalTransactions = async (): Promise<Transaction[]> => {
  try {
    const users = await getAllUsers();
    let allTx: Transaction[] = [];
    
    for (const user of users) {
      const q = query(
        collection(db, `users/${user.uid}/transactions`),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      const userTxs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      allTx = [...allTx, ...userTxs];
    }
    
    return allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching global transactions:", error);
    return [];
  }
};

export const getGlobalSettings = async (): Promise<any> => {
  const path = `settings/global`;
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? snap.data() : {};
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return {};
  }
};

export const saveGlobalSettings = async (settings: any) => {
  const path = `settings/global`;
  try {
    const dataToSave = { ...settings };
    Object.keys(dataToSave).forEach(key => {
      if (dataToSave[key] === undefined) {
        delete dataToSave[key];
      }
    });
    await setDoc(doc(db, path), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const saveUserSettings = async (userId: string, settings: Omit<UserSettings, 'updatedAt'>) => {
  const path = `users/${userId}/settings/info`;
  try {
    const dataToSave = {
      ...settings,
      updatedAt: serverTimestamp(),
    };
    Object.keys(dataToSave).forEach(key => {
      if ((dataToSave as any)[key] === undefined) {
        delete (dataToSave as any)[key];
      }
    });

    await setDoc(doc(db, path), dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const path = `users/${userId}/settings/info`;
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? (snap.data() as UserSettings) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const checkActivation = async (userId: string): Promise<boolean> => {
  const path = `users/${userId}/account/status`;
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? !!snap.data().active : false;
  } catch (error) {
    // If the doc doesn't exist, it's not activated
    return false;
  }
};

export const addTransaction = async (userId: string, tx: Omit<Transaction, 'createdAt' | 'userId' | 'id'>) => {
  const path = `users/${userId}/transactions`;
  try {
    const newDoc = doc(collection(db, path));
    
    // Remove undefined values
    const dataToSave = {
      ...tx,
      userId,
      createdAt: serverTimestamp(),
    };
    Object.keys(dataToSave).forEach(key => {
      if ((dataToSave as any)[key] === undefined) {
        delete (dataToSave as any)[key];
      }
    });

    await setDoc(newDoc, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const path = `users/${userId}/transactions`;
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteTransaction = async (userId: string, txId: string) => {
  const path = `users/${userId}/transactions/${txId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
