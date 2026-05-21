import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './lib/firebase';
import { onSnapshotsInSync } from 'firebase/firestore';
import { 
  getUserSettings, 
  saveUserSettings, 
  getTransactions, 
  addTransaction as apiAddTx, 
  deleteTransaction as apiDeleteTx,
  checkActivation,
  syncUserProfile,
  getAllGlobalTransactions,
  getGlobalSettings
} from './services/transactionService';
import { UserSettings, GlobalSettings, Transaction, TransactionType } from './types';
import AuthStatus from './components/AuthStatus';
import SetupModal from './components/SetupModal';
import BalanceCards from './components/BalanceCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Summary from './components/Summary';
import AccessDenied from './components/AccessDenied';
import AdminPanel from './components/AdminPanel';
import FinancialReports from './components/FinancialReports';
import LoginPage from './components/LoginPage';
import AccountActivation from './components/AccountActivation';
import { 
  Wallet, 
  Loader2, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Languages,
  Menu,
  X,
  Moon,
  Sun,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_TRANSACTION = 'NEW_TRANSACTION',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  ADMIN = 'ADMIN',
  REPORTS = 'REPORTS'
}

export default function App() {
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [globalTransactions, setGlobalTransactions] = useState<Transaction[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isActivated, setIsActivated] = useState<boolean | null>(null);
  const [showActivation, setShowActivation] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [syncState, setSyncState] = useState<'synced' | 'syncing'>('synced');

  // Handle connection state and syncing state in real-time
  useEffect(() => {
    if (!user) return;

    const handleSyncing = () => {
      setSyncState('syncing');
    };

    const handleSynced = () => {
      if (navigator.onLine) {
        setSyncState('synced');
      }
    };

    const handleOnline = () => {
      // Handled by onSnapshotsInSync
    };

    const handleOffline = () => {
      setSyncState('syncing');
    };

    window.addEventListener('firestore-syncing', handleSyncing);
    window.addEventListener('firestore-synced', handleSynced);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setSyncState('syncing');
    }

    // Subscribe to Firestore's snapshot-in-sync events to know when local writes sync to cloud
    const unsubscribe = onSnapshotsInSync(db, () => {
      if (navigator.onLine) {
        setSyncState('synced');
        window.dispatchEvent(new CustomEvent('firestore-synced'));
      } else {
        setSyncState('syncing');
      }
    });

    return () => {
      window.removeEventListener('firestore-syncing', handleSyncing);
      window.removeEventListener('firestore-synced', handleSynced);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [user]);


  const checkStatus = async () => {
    if (!user || refreshing) return;
    setRefreshing(true);
    try {
      const activated = await checkActivation(user.uid);
      const adminCheck = user.email === 'mbtoday5524@gmail.com';
      setIsAdmin(adminCheck);
      const finalActive = activated || adminCheck;
      
      // Always fetch global settings to show contact info even if not activated
      const gs = await getGlobalSettings();
      setGlobalSettings(gs);
      
      if (finalActive && !isActivated) {
        // Just got activated!
        const [s, t] = await Promise.all([
          getUserSettings(user.uid),
          getTransactions(user.uid)
        ]);
        setSettings(s);
        setTransactions(t);
        
        if (adminCheck) {
          const gt = await getAllGlobalTransactions();
          setGlobalTransactions(gt);
        }
      }
      setIsActivated(finalActive);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  const sendNotification = async (type: string, data: any) => {
    if (!settings?.notificationsEnabled || !settings?.notificationEmail) return;

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: settings.notificationEmail,
          type,
          data
        })
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const currentViewRef = useRef<View>(currentView);
  
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);
  const [showSetupOverlay, setShowSetupOverlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [language, setLanguage] = useState<'MM' | 'EN'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language');
      if (stored === 'MM' || stored === 'EN') {
        return stored;
      }
    }
    return 'EN';
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Sync language to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Sync theme to body class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fire off background profile sync
          const syncPromise = syncUserProfile(user.uid, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
          
          // Fetch critical access and settings in parallel
          const [activated, gs] = await Promise.all([
            checkActivation(user.uid),
            getGlobalSettings()
          ]);
          
          const adminCheck = user.email === 'mbtoday5524@gmail.com';
          setIsAdmin(adminCheck);
          setGlobalSettings(gs);
          
          const finalActive = activated || adminCheck;
          setIsActivated(finalActive);
          
          if (finalActive) {
            // Fetch user-specific data in parallel
            const [s, t] = await Promise.all([
              getUserSettings(user.uid),
              getTransactions(user.uid)
            ]);
            setSettings(s);
            setTransactions(t);
            
            if (adminCheck) {
              const gt = await getAllGlobalTransactions();
              setGlobalTransactions(gt);
            }
          }
          await syncPromise;
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          setInitialFetchDone(true);
        }
      };
      fetchData();
    } else {
      setSettings(null);
      setIsActivated(null);
      setTransactions([]);
      setInitialFetchDone(false);
    }
  }, [user]);

  // Auto-refresh activation status when on AccessDenied screen
  useEffect(() => {
    let interval: any;
    if (user && isActivated === false) {
      interval = setInterval(() => {
        checkStatus();
      }, 30000); // Check every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, isActivated]);

  const handleStart = async (newSettings: Omit<UserSettings, 'updatedAt'>) => {
    if (!user) return;
    setLoading(true);
    try {
      await saveUserSettings(user.uid, newSettings);
      const s = await getUserSettings(user.uid);
      // Wait briefly so the user can experience the nice success check animation in the SetupModal
      await new Promise(resolve => setTimeout(resolve, 1100));
      setSettings(s);
      setShowSetupOverlay(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (txData: Omit<Transaction, 'createdAt' | 'userId' | 'id'>) => {
    if (!user) return;
    
    // Create a local optimistic version
    const tempId = Math.random().toString(36).substring(7);
    const newTx: Transaction = {
      ...txData,
      id: tempId,
      userId: user.uid,
      createdAt: new Date()
    };

    // Update state immediately for perceived performance
    setTransactions(prev => [newTx, ...prev]);
    setCurrentView(View.DASHBOARD);

    try {
      await apiAddTx(user.uid, txData);
      
      // Optionally re-fetch to ensure sync, but in background
      const t = await getTransactions(user.uid);
      setTransactions(t);

      // Send notification
      if (settings?.notificationsEnabled) {
        sendNotification('NEW_TRANSACTION', txData);
        
        // Check for low balance after addition
        const currentBalance = calculatedBalances[txData.category.toLowerCase() as keyof typeof calculatedBalances];
        if (currentBalance < (settings.lowBalanceThreshold || 0)) {
          sendNotification('LOW_BALANCE', {
            wallet: txData.category,
            balance: currentBalance,
            threshold: settings.lowBalanceThreshold
          });
        }
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
      // Rollback on error
      setTransactions(prev => prev.filter(tx => tx.id !== tempId));
      alert('Failed to save transaction. Please check your connection and try again.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    
    // Optimistic delete
    const previousTransactions = [...transactions];
    setTransactions(prev => prev.filter(tx => tx.id !== id));

    try {
      await apiDeleteTx(user.uid, id);
    } catch (err) {
      console.error('Delete failed:', err);
      // Rollback
      setTransactions(previousTransactions);
      alert('Failed to delete transaction.');
    }
  };

  // Calculations
  const calculatedBalances = useMemo(() => {
    if (!settings) return { kbz: 0, wave: 0, aya: 0, uab: 0, trueMoney: 0, cash: 0 };
    
    let kbzDelta = 0;
    let waveDelta = 0;
    let ayaDelta = 0;
    let uabDelta = 0;
    let trueDelta = 0;
    let cashDelta = 0;

    transactions.forEach(tx => {
        const isWalletFee = tx.feePaymentMethod === 'Wallet';
        const feeAmt = tx.fee || 0;

        if (tx.category === 'KBZ') {
            if (tx.type === TransactionType.IN) {
                kbzDelta -= tx.amount;
                cashDelta += tx.amount;
            } else {
                kbzDelta += tx.amount;
                cashDelta -= tx.amount;
            }
            if (isWalletFee) {
                kbzDelta += feeAmt;
            } else {
                cashDelta += feeAmt;
            }
        } else if (tx.category === 'Wave') {
            if (tx.type === TransactionType.IN) {
                waveDelta -= tx.amount;
                cashDelta += tx.amount;
            } else {
                waveDelta += tx.amount;
                cashDelta -= tx.amount;
            }
            if (isWalletFee) {
                waveDelta += feeAmt;
            } else {
                cashDelta += feeAmt;
            }
        } else if (tx.category === 'AYAPay') {
            if (tx.type === TransactionType.IN) {
                ayaDelta -= tx.amount;
                cashDelta += tx.amount;
            } else {
                ayaDelta += tx.amount;
                cashDelta -= tx.amount;
            }
            if (isWalletFee) {
                ayaDelta += feeAmt;
            } else {
                cashDelta += feeAmt;
            }
        } else if (tx.category === 'UABPay') {
            if (tx.type === TransactionType.IN) {
                uabDelta -= tx.amount;
                cashDelta += tx.amount;
            } else {
                uabDelta += tx.amount;
                cashDelta -= tx.amount;
            }
            if (isWalletFee) {
                uabDelta += feeAmt;
            } else {
                cashDelta += feeAmt;
            }
        } else if (tx.category === 'TrueMoney') {
            if (tx.type === TransactionType.IN) {
                trueDelta -= tx.amount;
                cashDelta += tx.amount;
            } else {
                trueDelta += tx.amount;
                cashDelta -= tx.amount;
            }
            if (isWalletFee) {
                trueDelta += feeAmt;
            } else {
                cashDelta += feeAmt;
            }
        } else if (tx.category === 'Cash') {
            if (tx.type === TransactionType.IN) {
                cashDelta += tx.amount;
            } else {
                cashDelta -= tx.amount;
            }
            cashDelta += feeAmt;
        }
    });

    return {
        kbz: (settings.kbzInitial || 0) + kbzDelta,
        wave: (settings.waveInitial || 0) + waveDelta,
        aya: (settings.ayaInitial || 0) + ayaDelta,
        uab: (settings.uabInitial || 0) + uabDelta,
        trueMoney: (settings.trueInitial || 0) + trueDelta,
        cash: (settings.cashInitial || 0) + cashDelta
    };
  }, [settings, transactions]);

  const stats = useMemo(() => {
    const res = {
      kbzIn: 0, kbzOut: 0,
      waveIn: 0, waveOut: 0,
      ayaIn: 0, ayaOut: 0,
      uabIn: 0, uabOut: 0,
      trueIn: 0, trueOut: 0,
    };

    transactions.forEach(tx => {
      if (tx.category === 'KBZ') {
        if (tx.type === TransactionType.IN) res.kbzIn += tx.amount;
        else res.kbzOut += tx.amount;
      } else if (tx.category === 'Wave') {
        if (tx.type === TransactionType.IN) res.waveIn += tx.amount;
        else res.waveOut += tx.amount;
      } else if (tx.category === 'AYAPay') {
        if (tx.type === TransactionType.IN) res.ayaIn += tx.amount;
        else res.ayaOut += tx.amount;
      } else if (tx.category === 'UABPay') {
        if (tx.type === TransactionType.IN) res.uabIn += tx.amount;
        else res.uabOut += tx.amount;
      } else if (tx.category === 'TrueMoney') {
        if (tx.type === TransactionType.IN) res.trueIn += tx.amount;
        else res.trueOut += tx.amount;
      }
    });

    return res;
  }, [transactions]);

  const totalFee = useMemo(() => transactions.reduce((sum, tx) => sum + tx.fee, 0), [transactions]);

  if (authLoading || (user && isActivated === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">
        {/* Dynamic deep neon blue spatial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,176,255,0.12)_0%,rgba(13,110,253,0.04)_45%,transparent_70%)] blur-2xl pointer-events-none" />
        
        {/* Ambient subtle starry particle glow points */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-[25%] left-[20%] w-1.5 h-1.5 rounded-full bg-cyan-400 blur-[1px] animate-pulse" />
          <div className="absolute bottom-[30%] right-[25%] w-1 h-1 rounded-full bg-blue-400 blur-[1.5px] animate-pulse duration-1000" />
          <div className="absolute top-[60%] right-[15%] w-2 h-2 rounded-full bg-cyan-500/50 blur-[2px] animate-pulse duration-700" />
          <div className="absolute bottom-[15%] left-[35%] w-1 h-1 rounded-full bg-blue-300 blur-[0.5px] animate-pulse duration-1500" />
        </div>

        <div className="flex flex-col items-center gap-8 relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Spinning Neon Blue Halo outer ring */}
            <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite]" />
            
            {/* Pulsing high energy Cyan/Blue Neon Glow Ring */}
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-[#00b0ff] opacity-40 blur-xl animate-pulse" />
            
            {/* Thin sharp bright Cyan accent ring */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 opacity-90" />
            
            {/* Main Round Logo Container */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,176,255,0.3)] relative z-10 overflow-hidden bg-black border-2 border-cyan-400/30">
              <img 
                src="/logo.png" 
                alt="Z Money Tracker Logo" 
                className="w-full h-full object-cover scale-[1.01]" 
              />
            </div>
            
            {/* Spinning loader badge matching logo neon vibe */}
            <div className="absolute -bottom-1 -right-1 bg-black border-2 border-cyan-400 rounded-full p-2.5 shadow-[0_0_20px_rgba(0,176,255,0.5)] z-20">
              <Loader2 className="animate-spin text-cyan-400" size={24} />
            </div>
          </motion.div>
          
          <div className="flex flex-col items-center gap-2 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-sans font-black text-xl tracking-[0.2em] bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,176,255,0.2)]"
            >
              Z MONEY TRACKER
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] text-cyan-400/80 font-mono font-black uppercase tracking-[0.4em] pl-[0.4em] animate-pulse"
            >
              Initializing System..
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: View }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-indigo-600 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <Icon size={20} />
      <span className="font-bold text-[15px] tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-[#020617] overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-300" lang={language === 'MM' ? 'my' : 'en'}>
      {!user ? (
        <LoginPage language={language} setLanguage={setLanguage} />
      ) : isActivated === false ? (
        showActivation ? (
          <AccountActivation 
            userId={user.uid}
            globalSettings={globalSettings || {}}
            language={language}
            onBack={() => setShowActivation(false)}
            onActivated={checkStatus}
          />
        ) : (
          <AccessDenied 
            userId={user.uid} 
            globalSettings={globalSettings || {}} 
            language={language} 
            onRefresh={checkStatus}
            onSignOut={() => auth.signOut()}
            refreshing={refreshing}
            onGoToActivation={() => setShowActivation(true)}
          />
        )
      ) : (
        <>
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Left Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 w-72 bg-[#0F172A] flex flex-col p-6 flex-shrink-0 z-50 transition-transform duration-300 transform
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* App Logo */}
            <div className="flex items-center justify-between mb-10 px-2 lg:block">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-black/30 border border-slate-700/50">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">Z Money Tracker</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 p-2 mt-2">
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              <NavItem icon={LayoutDashboard} label={language === 'MM' ? 'ပင်မစာမျက်နှာ' : 'Dashboard'} view={View.DASHBOARD} />
              <NavItem icon={PlusCircle} label={language === 'MM' ? 'စာရင်းသစ်သွင်းရန်' : 'New Record'} view={View.NEW_TRANSACTION} />
              <NavItem icon={History} label={language === 'MM' ? 'လုပ်ငန်းမှတ်တမ်း' : 'Transactions'} view={View.HISTORY} />
              <NavItem icon={TrendingUp} label={language === 'MM' ? 'အစီရင်ခံစာ' : 'Reports'} view={View.REPORTS} />
              
              {isAdmin && (
                <button
                  onClick={() => {
                    setCurrentView(View.ADMIN);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentView === View.ADMIN 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
                  }`}
                >
                  <ShieldCheck size={20} />
                  <span className="font-bold text-[15px] tracking-tight">Admin Panel</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentView(View.SETTINGS);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === View.SETTINGS 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings size={20} />
                <span className="font-bold text-[15px] tracking-tight">{language === 'MM' ? 'ဆက်တင်များ' : 'Settings'}</span>
              </button>
            </nav>

            {/* Bottom Sidebar Info */}
            <div className="space-y-3 pt-4 border-t border-slate-800/50">
               <div className="px-2 space-y-1 pb-1">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())}</p>
                 <p className="text-sm font-bold text-slate-300">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
               </div>
               <div className="px-2 pt-2 border-t border-slate-800/20 flex flex-col gap-1.5">
                 <p className="text-[10px] text-slate-400 font-bold tracking-wide">
                   Developer <span className="text-yellow-500 dark:text-yellow-400 font-black">ZIN KO KO AUNG</span>
                 </p>
                 {user && (
                   <div className="flex items-center gap-1.5 select-none" id="connection-status-indicator">
                     <span 
                       className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                         syncState === 'syncing' ? 'bg-amber-500 ring-2 ring-amber-400/20 animate-pulse' : 'bg-emerald-500 ring-2 ring-emerald-500/20'
                       }`} 
                     />
                     <span className="text-[9px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400 font-mono">
                       {syncState === 'syncing' ? 'Syncing...' : 'Synced'}
                     </span>
                   </div>
                 )}
               </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#020617] transition-colors duration-300">
            {/* Content Header */}
            <header className="h-12 lg:h-14 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20 transition-colors">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg shrink-0"
                >
                  <Menu size={18} />
                </button>
                <div className="flex items-center gap-2.5">
                  <h2 className={`font-black text-slate-900 dark:text-white tracking-tight font-display ${language === 'MM' ? 'text-sm lg:text-lg leading-relaxed' : 'text-sm lg:text-xl'}`}>
                    {currentView === View.DASHBOARD && (language === 'MM' ? 'ပင်မစာမျက်နှာ' : 'Dashboard')}
                    {currentView === View.NEW_TRANSACTION && (language === 'MM' ? 'စာရင်းသစ်သွင်းရန်' : 'New Transaction')}
                    {currentView === View.HISTORY && (language === 'MM' ? 'လုပ်ငန်းမှတ်တမ်း' : 'History')}
                    {currentView === View.SETTINGS && (language === 'MM' ? 'ဆက်တင်များ' : 'Settings')}
                    {currentView === View.REPORTS && (language === 'MM' ? 'ဘဏ္ဍာရေး အစီရင်ခံစာ' : 'Financial Reports')}
                    {currentView === View.ADMIN && 'Admin Control Panel'}
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-2 lg:gap-4">
                 {/* Language Toggle in Header */}
                 <button
                    onClick={() => setLanguage(prev => prev === 'MM' ? 'EN' : 'MM')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1e293b] rounded-xl transition-all mr-1 border border-slate-200 dark:border-slate-800 active:scale-95"
                    title={language === 'MM' ? 'Switch to English' : 'မြန်မာဘာသာသို့ပြောင်းရန်'}
                 >
                    <Languages size={15} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs font-bold leading-none">
                      {language === 'MM' ? 'EN' : 'မြန်မာ'}
                    </span>
                 </button>

                 <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all mr-1"
                    aria-label="Toggle Dark Mode"
                 >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                 </button>
                 <div className="hidden sm:flex flex-col items-end">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Active</span>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                 </div>
                 <div className="hidden sm:block w-px h-6 lg:h-8 bg-slate-200 dark:bg-slate-800 mx-1 lg:mx-2"></div>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowUserDropdown(!showUserDropdown);
                        setShowSignOutConfirm(false);
                      }}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-slate-400 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:scale-[1.04] transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      aria-label="User Profile Menu"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-xs">{user.email?.charAt(0).toUpperCase()}</span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <>
                          {/* Overlay background to catch clicks outside */}
                          <div 
                            className="fixed inset-0 z-35 cursor-default" 
                            onClick={() => {
                              setShowUserDropdown(false);
                              setShowSignOutConfirm(false);
                            }} 
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            transition={{ type: "spring", damping: 18, stiffness: 155 }}
                            className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden z-40 select-none animate-in fade-in"
                          >
                            {!showSignOutConfirm ? (
                              <div className="p-1">
                                {/* Profile Info Header */}
                                <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                    {user.photoURL ? (
                                      <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center font-bold text-sm text-slate-500">{user.email?.charAt(0).toUpperCase()}</div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user.displayName || 'User'}</p>
                                    <p className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 truncate font-bold mt-0.5">{user.email}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">ID:</span>
                                      <p className="text-[9px] font-mono font-medium text-slate-500 dark:text-slate-400 truncate select-all bg-slate-50 dark:bg-slate-800/50 px-1 rounded-sm">{user.uid}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Group */}
                                <div className="p-1.5 space-y-1">
                                  <button
                                    onClick={() => setShowSignOutConfirm(true)}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-[0.98] transition-all text-xs font-bold font-display"
                                  >
                                    <LogOut size={15} />
                                    <span>{language === 'MM' ? 'အကောင့်ထွက်ရန်' : 'Sign Out'}</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 space-y-4">
                                <div className="text-center space-y-1">
                                  <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-2">
                                    <LogOut size={18} />
                                  </div>
                                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{language === 'MM' ? 'အကောင့်ထွက်ရန် သေချာပါသလား' : 'Sign Out Confirmation'}</h4>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                    {language === 'MM' 
                                      ? 'အကောင့်ထဲမှ သေချာပေါက် ထွက်ချင်ပါသလား။' 
                                      : 'Are you sure you want to sign out?'}
                                  </p>
                                </div>

                                <div className="flex gap-2 text-xs">
                                  <button
                                    onClick={() => setShowSignOutConfirm(false)}
                                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors active:scale-95"
                                  >
                                    {language === 'MM' ? 'မထွက်တော့ပါ' : 'Cancel'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      auth.signOut();
                                      setShowUserDropdown(false);
                                      setShowSignOutConfirm(false);
                                    }}
                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-600/10 active:scale-95"
                                  >
                                    {language === 'MM' ? 'ထွက်မည်' : 'Yes, Exit'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
              </div>
            </header>

            {/* Viewport content */}
            <div className={`flex-1 p-2 sm:p-4 lg:p-5 lg:pt-2 scroll-smooth ${currentView === View.HISTORY ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={currentView === View.HISTORY ? 'flex-1 flex flex-col min-h-0 overflow-hidden' : 'space-y-4 lg:space-y-6'}
                >
                  {currentView === View.DASHBOARD && (
                    <>
                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
                        <BalanceCards 
                          kbz={calculatedBalances.kbz} wave={calculatedBalances.wave}
                          aya={calculatedBalances.aya} cash={calculatedBalances.cash}
                          uab={calculatedBalances.uab} trueMoney={calculatedBalances.trueMoney}
                          kbzEnabled={settings?.kbzEnabled ?? true}
                          waveEnabled={settings?.waveEnabled ?? true}
                          ayaEnabled={settings?.ayaEnabled ?? true}
                          uabEnabled={settings?.uabEnabled ?? true}
                          trueEnabled={settings?.trueEnabled ?? true}
                          cashEnabled={settings?.cashEnabled ?? true}
                          language={language}
                          kbzPhone={settings?.kbzPhone} wavePhone={settings?.wavePhone}
                          ayaPhone={settings?.ayaPhone} uabPhone={settings?.uabPhone}
                          truePhone={settings?.truePhone}
                          kbzLogoUrl={globalSettings?.kbzLogoUrl} waveLogoUrl={globalSettings?.waveLogoUrl}
                          ayaLogoUrl={globalSettings?.ayaLogoUrl} cashLogoUrl={globalSettings?.cashLogoUrl}
                          uabLogoUrl={globalSettings?.uabLogoUrl} trueLogoUrl={globalSettings?.trueLogoUrl}
                        />
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
                        {/* Recent Transactions Table */}
                        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                              {language === 'MM' ? 'နောက်ဆုံးမှတ်တမ်းများ' : 'Recent Transactions'}
                            </h3>
                            <button 
                              onClick={() => setCurrentView(View.HISTORY)}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
                            >
                              {language === 'MM' ? 'အားလုံးကြည့်ရန်' : 'View All'}
                              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                          <div className="min-h-[400px]">
                            <TransactionList 
                               transactions={transactions.slice(0, 10)} 
                               onDelete={handleDeleteTransaction}
                               language={language}
                               kbzLogoUrl={globalSettings?.kbzLogoUrl}
                               waveLogoUrl={globalSettings?.waveLogoUrl}
                               ayaLogoUrl={globalSettings?.ayaLogoUrl}
                               uabLogoUrl={globalSettings?.uabLogoUrl}
                               trueLogoUrl={globalSettings?.trueLogoUrl}
                               cashLogoUrl={globalSettings?.cashLogoUrl}
                            />
                          </div>
                        </div>

                        {/* Summary / Stats Card */}
                        <div className="space-y-4 lg:space-y-6 lg:sticky lg:top-0">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">
                            {language === 'MM' ? 'စာရင်းချုပ်' : 'Current Ledger'}
                          </h3>
                          <Summary 
                             kbzIn={stats.kbzIn}
                             kbzOut={stats.kbzOut}
                             waveIn={stats.waveIn}
                             waveOut={stats.waveOut}
                             ayaIn={stats.ayaIn}
                             ayaOut={stats.ayaOut}
                             uabIn={stats.uabIn}
                             uabOut={stats.uabOut}
                             trueIn={stats.trueIn}
                             trueOut={stats.trueOut}
                             kbzEnabled={settings?.kbzEnabled ?? true}
                             waveEnabled={settings?.waveEnabled ?? true}
                             ayaEnabled={settings?.ayaEnabled ?? true}
                             uabEnabled={settings?.uabEnabled ?? true}
                             trueEnabled={settings?.trueEnabled ?? true}
                             cashEnabled={settings?.cashEnabled ?? true}
                             totalFee={totalFee}
                             language={language}
                             kbzLogoUrl={globalSettings?.kbzLogoUrl}
                             waveLogoUrl={globalSettings?.waveLogoUrl}
                             ayaLogoUrl={globalSettings?.ayaLogoUrl}
                             cashLogoUrl={globalSettings?.cashLogoUrl}
                             uabLogoUrl={globalSettings?.uabLogoUrl}
                             trueLogoUrl={globalSettings?.trueLogoUrl}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {currentView === View.NEW_TRANSACTION && (
                    <div className="max-w-4xl mx-auto lg:mx-0">
                      <div className="bg-white dark:bg-[#0f172a] p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sleek-shadow space-y-4 lg:space-y-6 transition-colors">
                        <div>
                           <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">
                             {language === 'MM' ? 'ဝန်ဆောင်မှုသစ် စာရင်းသွင်းရန်' : 'Add New Service Entry'}
                           </h3>
                           <p className="text-slate-500 dark:text-slate-400 font-medium text-xs lg:text-sm mt-1">
                             {language === 'MM' ? 'ဝန်ဆောင်မှုအမျိုးအစားနှင့် ငွေပမာဏကို မှန်ကန်စွာ ဖြည့်သွင်းပါ။' : 'Please select the service type and enter the amount.'}
                           </p>
                        </div>
                        <TransactionForm 
                          onAdd={handleAddTransaction}
                          percentIn={settings?.percentIn || 0}
                          percentOut={settings?.percentOut || 0}
                          language={language}
                          kbzLogoUrl={globalSettings?.kbzLogoUrl}
                          waveLogoUrl={globalSettings?.waveLogoUrl}
                          ayaLogoUrl={globalSettings?.ayaLogoUrl}
                          uabLogoUrl={globalSettings?.uabLogoUrl}
                          trueLogoUrl={globalSettings?.trueLogoUrl}
                          cashLogoUrl={globalSettings?.cashLogoUrl}
                          kbzEnabled={settings?.kbzEnabled ?? true}
                          waveEnabled={settings?.waveEnabled ?? true}
                          ayaEnabled={settings?.ayaEnabled ?? true}
                          uabEnabled={settings?.uabEnabled ?? true}
                          trueEnabled={settings?.trueEnabled ?? true}
                          cashEnabled={settings?.cashEnabled ?? true}
                        />
                      </div>
                    </div>
                  )}

                  {currentView === View.HISTORY && (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                      <TransactionList 
                        transactions={transactions}
                        onDelete={handleDeleteTransaction}
                        language={language}
                        kbzLogoUrl={globalSettings?.kbzLogoUrl}
                        waveLogoUrl={globalSettings?.waveLogoUrl}
                        ayaLogoUrl={globalSettings?.ayaLogoUrl}
                        uabLogoUrl={globalSettings?.uabLogoUrl}
                        trueLogoUrl={globalSettings?.trueLogoUrl}
                        cashLogoUrl={globalSettings?.cashLogoUrl}
                      />
                    </div>
                  )}

                  {currentView === View.SETTINGS && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl">
                       <div className="bg-white dark:bg-[#0f172a] p-10 rounded-2xl border border-slate-200 dark:border-slate-800 sleek-shadow space-y-6 transition-colors">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                                <Settings size={18} />
                             </div>
                             {language === 'MM' ? 'ကနဦး လက်ကျန်ငွေ သတ်မှတ်ချက်များ' : 'Initial Account Setup'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'MM' ? 'လက်ကျန်ငွေများနှင့် ကော်မရှင်နှုန်းထားများကို ဤနေရာတွင် ပြင်ဆင်နိုင်ပါသည်။' : 'You can adjust initial balances and service percentages here.'}
                          </p>
                          <button 
                            onClick={() => setShowSetupOverlay(true)}
                            className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                          >
                            {language === 'MM' ? 'ဖောင်ဖွင့်ရန်' : 'Open Setup Form'}
                          </button>
                       </div>
                       
                        <div className="space-y-8">
                           <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 sleek-shadow space-y-6 transition-colors">
                              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                    {language === 'MM' ? 'အကောင့် အချက်အလက်များ' : 'Account Details'}
                                 </h3>
                                 <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded text-[9px] font-black uppercase tracking-widest">
                                    Premium Active
                                 </span>
                              </div>

                              <div className="space-y-4">
                                 <div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none mb-1.5">
                                       {language === 'MM' ? 'အီးမေးလ်' : 'Email Address'}
                                    </p>
                                    <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono break-all bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/40 dark:border-indigo-900/30 shadow-inner">
                                       {user?.email || 'N/A'}
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none mb-1.5">
                                       {language === 'MM' ? 'အကောင့် ID' : 'Account ID'}
                                    </p>
                                    <div className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 font-mono break-all bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/40 dark:border-amber-900/30 shadow-inner">
                                       {user?.uid || 'N/A'}
                                    </div>
                                 </div>
                              </div>
                              

                           </div>
                           
                           <div className="bg-rose-50 dark:bg-rose-950/15 p-8 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-4">
                              <h3 className="text-sm font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest">Danger Zone</h3>
                              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">{language === 'MM' ? 'စနစ်မှ ထွက်ခွာလိုလျှင် အောက်ပါခလုတ်ကို နှိပ်ပါ။' : 'Click the button below if you wish to sign out.'}</p>
                              <button 
                                onClick={() => auth.signOut()}
                                className="w-full h-11 bg-rose-600 dark:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 dark:hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 dark:shadow-none"
                              >
                                 <LogOut size={16} />
                                 {language === 'MM' ? 'စနစ်မှထွက်ရန်' : 'Sign Out Account'}
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                  {currentView === View.ADMIN && isAdmin && (
                    <AdminPanel 
                      language={language}
                      globalSettings={globalSettings || {}}
                      onUpdateGlobalSettings={setGlobalSettings}
                    />
                  )}

                  {currentView === View.REPORTS && (
                    <FinancialReports 
                      transactions={isAdmin ? globalTransactions : transactions} 
                      language={language} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </>
      )}

      {/* Modals & Loaders */}
      {user && initialFetchDone && isActivated && !settings && (
        <SetupModal onStart={handleStart} language={language} currentSettings={settings} userId={user.uid} />
      )}
      
      {showSetupOverlay && (
        <SetupModal 
          onStart={handleStart} 
          onClose={() => setShowSetupOverlay(false)} 
          language={language}
          currentSettings={settings}
          userId={user?.uid}
        />
      )}
      

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-10 right-10 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-indigo-400"
          >
             <Loader2 className="animate-spin" size={18} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-1">Processing..</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
