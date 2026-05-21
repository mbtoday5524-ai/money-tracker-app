export enum TransactionType {
  IN = 'in',
  OUT = 'out',
}

export interface Transaction {
  id?: string;
  date: string;
  category: string;
  type: TransactionType;
  amount: number;
  fee: number;
  phoneNumber?: string;
  feePaymentMethod?: 'Cash' | 'Wallet';
  createdAt: any;
  userId: string;
}

export interface GlobalSettings {
  kbzLogoUrl?: string;
  waveLogoUrl?: string;
  ayaLogoUrl?: string;
  cashLogoUrl?: string;
  uabLogoUrl?: string;
  trueLogoUrl?: string;
  adminMessenger?: string;
  adminTelegram?: string;
  adminViber?: string;
  adminPhone?: string;
  adminContactNote?: string;
  adminContactNoteMM?: string;
  masterActivationCode?: string;
  restrictedLogoUrl?: string;
  messengerIconUrl?: string;
  telegramIconUrl?: string;
  viberIconUrl?: string;
}

export interface UserSettings {
  kbzInitial: number;
  waveInitial: number;
  ayaInitial: number;
  cashInitial: number;
  uabInitial: number;
  trueInitial: number;
  kbzEnabled: boolean;
  waveEnabled: boolean;
  ayaEnabled: boolean;
  cashEnabled: boolean;
  uabEnabled: boolean;
  trueEnabled: boolean;
  kbzPhone?: string;
  wavePhone?: string;
  ayaPhone?: string;
  uabPhone?: string;
  truePhone?: string;
  kbzLogoUrl?: string;
  waveLogoUrl?: string;
  ayaLogoUrl?: string;
  cashLogoUrl?: string;
  uabLogoUrl?: string;
  trueLogoUrl?: string;
  percentIn: number;
  percentOut: number;
  notificationsEnabled: boolean;
  notificationEmail?: string;
  lowBalanceThreshold: number;
  updatedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
