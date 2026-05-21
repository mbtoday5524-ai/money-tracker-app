import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Settings2, ArrowRight, CreditCard, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserSettings } from '../types';

interface SetupModalProps {
  onStart: (settings: Omit<UserSettings, 'updatedAt'>) => void | Promise<void>;
  onClose?: () => void;
  language: 'MM' | 'EN';
  currentSettings?: UserSettings | null;
  userId?: string;
}

export default function SetupModal({ onStart, onClose, language, currentSettings, userId }: SetupModalProps) {
  const [kbz, setKbz] = useState(currentSettings?.kbzInitial?.toString() || '');
  const [wave, setWave] = useState(currentSettings?.waveInitial?.toString() || '');
  const [aya, setAya] = useState(currentSettings?.ayaInitial?.toString() || '');
  const [cash, setCash] = useState(currentSettings?.cashInitial?.toString() || '');
  const [uab, setUab] = useState(currentSettings?.uabInitial?.toString() || '');
  const [trueMoney, setTrueMoney] = useState(currentSettings?.trueInitial?.toString() || '');
  
  const [kbzEnabled, setKbzEnabled] = useState(currentSettings?.kbzEnabled ?? true);
  const [waveEnabled, setWaveEnabled] = useState(currentSettings?.waveEnabled ?? true);
  const [ayaEnabled, setAyaEnabled] = useState(currentSettings?.ayaEnabled ?? true);
  const [cashEnabled, setCashEnabled] = useState(currentSettings?.cashEnabled ?? true);
  const [uabEnabled, setUabEnabled] = useState(currentSettings?.uabEnabled ?? true);
  const [trueEnabled, setTrueEnabled] = useState(currentSettings?.trueEnabled ?? true);

  const [percentIn, setPercentIn] = useState(currentSettings?.percentIn?.toString() || '0');
  const [percentOut, setPercentOut] = useState(currentSettings?.percentOut?.toString() || '0');
  
  const [kbzPhone, setKbzPhone] = useState(currentSettings?.kbzPhone || '');
  const [wavePhone, setWavePhone] = useState(currentSettings?.wavePhone || '');
  const [ayaPhone, setAyaPhone] = useState(currentSettings?.ayaPhone || '');
  const [uabPhone, setUabPhone] = useState(currentSettings?.uabPhone || '');
  const [truePhone, setTruePhone] = useState(currentSettings?.truePhone || '');
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(currentSettings?.notificationsEnabled || false);
  const [notificationEmail, setNotificationEmail] = useState(currentSettings?.notificationEmail || '');
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(currentSettings?.lowBalanceThreshold?.toString() || '100000');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveStatus === 'saving') return;
    setSaveStatus('saving');
    try {
      await onStart({
        kbzInitial: Number(kbz) || 0,
        waveInitial: Number(wave) || 0,
        ayaInitial: Number(aya) || 0,
        cashInitial: Number(cash) || 0,
        uabInitial: Number(uab) || 0,
        trueInitial: Number(trueMoney) || 0,
        kbzEnabled,
        waveEnabled,
        ayaEnabled,
        cashEnabled,
        uabEnabled,
        trueEnabled,
        percentIn: Number(percentIn) || 0,
        percentOut: Number(percentOut) || 0,
        kbzPhone,
        wavePhone,
        ayaPhone,
        uabPhone,
        truePhone,
        notificationsEnabled,
        notificationEmail,
        lowBalanceThreshold: Number(lowBalanceThreshold) || 100000
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#0f172a] rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl w-full max-w-[600px] overflow-hidden border border-white/20 dark:border-slate-800 relative my-auto transition-colors"
      >
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 lg:right-6 lg:top-6 z-20 w-8 h-8 lg:w-10 lg:h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
          >
            <X size={18} />
          </button>
        )}

        <div className="bg-indigo-600 p-5 lg:p-10 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 lg:w-48 lg:h-48 bg-white/10 rounded-full -mr-16 lg:-mr-24 -mt-16 lg:-mt-24 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 lg:gap-4 mb-1 lg:mb-3">
              <div className="w-8 h-8 lg:w-14 lg:h-14 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Settings2 size={18} className="lg:w-7 lg:h-7" />
              </div>
              <h2 className="text-lg lg:text-3xl font-black tracking-tight">{language === 'MM' ? 'ပြင်ဆင်သတ်မှတ်ခြင်း' : 'Advanced Setup'}</h2>
            </div>
            <p className="text-indigo-100 text-[8px] lg:text-sm font-bold opacity-90 tracking-wide">{language === 'MM' ? 'လက်ကျန်ငွေ၊ ဖုန်းနံပါတ်နှင့် Logo URL များကို ဖြည့်သွင်းပါ။' : 'Update your balances, phone numbers, and logo URLs.'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 lg:p-10 space-y-6 lg:space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* KBZ Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">KBZ Pay Config</h3>
              <button 
                type="button"
                onClick={() => setKbzEnabled(!kbzEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${kbzEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${kbzEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            <div className={`transition-all duration-300 space-y-4 ${!kbzEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'လက်ကျန်' : 'Balance'}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={kbz}
                    onChange={(e) => setKbz(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={kbzPhone}
                    onChange={(e) => setKbzPhone(e.target.value)}
                    placeholder="09422***789"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wave Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Wave Pay Config</h3>
              <button 
                type="button"
                onClick={() => setWaveEnabled(!waveEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${waveEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${waveEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            <div className={`transition-all duration-300 space-y-4 ${!waveEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'လက်ကျန်' : 'Balance'}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={wave}
                    onChange={(e) => setWave(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-amber-500 outline-none font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={wavePhone}
                    onChange={(e) => setWavePhone(e.target.value)}
                    placeholder="09422***789"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-amber-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AYA Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">AYA Pay Config</h3>
              <button 
                type="button"
                onClick={() => setAyaEnabled(!ayaEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${ayaEnabled ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${ayaEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            <div className={`transition-all duration-300 space-y-4 ${!ayaEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'လက်ကျန်' : 'Balance'}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={aya}
                    onChange={(e) => setAya(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-red-500 outline-none font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={ayaPhone}
                    onChange={(e) => setAyaPhone(e.target.value)}
                    placeholder="09422***789"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-red-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* UAB Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">UAB Pay Config</h3>
              <button 
                type="button"
                onClick={() => setUabEnabled(!uabEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${uabEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${uabEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            <div className={`transition-all duration-300 space-y-4 ${!uabEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'လက်ကျန်' : 'Balance'}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={uab}
                    onChange={(e) => setUab(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={uabPhone}
                    onChange={(e) => setUabPhone(e.target.value)}
                    placeholder="09422***789"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* True Money Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">True Money Config</h3>
              <button 
                type="button"
                onClick={() => setTrueEnabled(!trueEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${trueEnabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${trueEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            <div className={`transition-all duration-300 space-y-4 ${!trueEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'လက်ကျန်' : 'Balance'}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={trueMoney}
                    onChange={(e) => setTrueMoney(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-orange-500 outline-none font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={truePhone}
                    onChange={(e) => setTruePhone(e.target.value)}
                    placeholder="09422***789"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-orange-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cash & Percentage Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Cash Config</h3>
              <button 
                type="button"
                onClick={() => setCashEnabled(!cashEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${cashEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all ${cashEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            <div className={`transition-all duration-300 ${!cashEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'လက်ဝယ်ရှိငွေ' : 'Cash Initial'}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'သွင်း %' : 'In %'}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={percentIn}
                  onChange={(e) => setPercentIn(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-semibold text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{language === 'MM' ? 'ထုတ် %' : 'Out %'}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={percentOut}
                  onChange={(e) => setPercentOut(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-semibold text-center"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Email Notifications</h3>
              <button 
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {notificationsEnabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email for Notifications</label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-rose-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Low Balance Threshold</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={lowBalanceThreshold}
                    onChange={(e) => setLowBalanceThreshold(e.target.value)}
                    placeholder="100000"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-rose-500 outline-none font-semibold"
                  />
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight px-1">Alert when a wallet balance drops below this amount.</p>
                </div>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className={`w-full h-14 lg:h-16 rounded-xl lg:rounded-[1.25rem] font-black flex items-center justify-center transition-all duration-350 shadow-xl text-lg tracking-tight relative overflow-hidden select-none ${
              saveStatus === 'saving'
                ? 'bg-indigo-500 text-white/80 cursor-not-allowed scale-[0.98]'
                : saveStatus === 'saved'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-emerald-500/20'
                : saveStatus === 'error'
                ? 'bg-rose-600 text-white shadow-rose-500/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 hover:shadow-indigo-500/10 group'
            }`}
          >
            <AnimatePresence mode="wait">
              {saveStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-3 lg:gap-4"
                >
                  {language === 'MM' ? 'ပြင်ဆင်မှု သိမ်းဆည်းရန်' : 'Save Changes'}
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </motion.div>
              )}

              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-3"
                >
                  <Loader2 size={20} className="animate-spin" />
                  <span>{language === 'MM' ? 'သိမ်းဆည်းနေပါသည်...' : 'Saving Changes...'}</span>
                </motion.div>
              )}

              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle2 size={22} className="text-white" />
                  </motion.div>
                  <span className="font-extrabold tracking-wide">
                    {language === 'MM' ? 'အချက်အလက်များကို သိမ်းဆည်းပြီးပါပြီ!' : 'Settings Saved!'}
                  </span>
                </motion.div>
              )}

              {saveStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-3"
                >
                  <AlertTriangle size={20} />
                  <span>
                    {language === 'MM' ? 'သိမ်းဆည်းရန် မအောင်မြင်ပါ' : 'Failed to Save'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
