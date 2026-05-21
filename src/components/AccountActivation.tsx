import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Key, Copy, Check, Phone, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { GlobalSettings } from '../types';
import { validateActivationCode } from '../services/transactionService';

interface AccountActivationProps {
  userId: string;
  globalSettings?: GlobalSettings;
  language: 'MM' | 'EN';
  onBack: () => void;
  onActivated: () => void;
}

export default function AccountActivation({ 
  userId, 
  globalSettings = {}, 
  language, 
  onBack,
  onActivated
}: AccountActivationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID:', err);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const success = await validateActivationCode(userId, code.trim());
      if (success) {
        onActivated();
      } else {
        setError(language === 'MM' ? 'အသက်သွင်းကုဒ် မှားယွင်းနေပါသည်။' : 'Invalid activation code. Please try again.');
      }
    } catch (err) {
      setError(language === 'MM' ? 'အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့သည်။' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPhoneUrl = () => {
    const value = globalSettings.adminPhone;
    if (!value) return null;
    return `tel:${value}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#030712] relative overflow-y-auto scroll-smooth">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-indigo-500/10 md:bg-indigo-500/15 rounded-full blur-[120px] md:blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-blue-500/10 md:bg-blue-500/15 rounded-full blur-[120px] md:blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pt-10 pb-20 md:p-12 md:pt-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-[400px] w-full bg-white/[0.04] backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl flex flex-col gap-6 relative overflow-hidden"
        >
          {/* Top highlight gradient */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="p-2 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest">
              Activation Screen
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>

          <div className="text-center space-y-3">
            {globalSettings.restrictedLogoUrl ? (
              <div className="mx-auto w-24 h-24 p-2 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden flex items-center justify-center">
                <img src={globalSettings.restrictedLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain rounded-[1.5rem]" />
              </div>
            ) : (
              <div className="mx-auto w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <ShieldCheck size={32} />
              </div>
            )}
            <h2 className={`text-white font-bold tracking-tight ${language === 'MM' ? 'text-2xl' : 'text-xl'}`}>
              {language === 'MM' ? 'အကောင့်အသက်သွင်းရန်' : 'Account Activation'}
            </h2>
            <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed px-2">
              {language === 'MM' 
                ? 'သင်၏ ဝယ်ယူမှုမှ ရရှိသော အသက်သွင်းကုဒ်ကို အောက်တွင် ဖြည့်သွင်းပါ။' 
                : 'Enter the activation code you received from your purchase to activate your account.'}
            </p>
          </div>

          <form onSubmit={handleActivate} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                {language === 'MM' ? 'သင်၏ သီးသန့် ID (Copy ကူးပါ)' : 'Your Unique User ID (Copy This)'}
              </label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                <div className="flex-1 truncate font-mono text-[11px] md:text-xs font-bold text-indigo-400/90 pl-3">
                  {userId}
                </div>
                <button 
                  type="button"
                  onClick={handleCopy}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                {language === 'MM' ? 'အသက်သွင်းကုဒ် ဖြည့်သွင်းရန်' : 'Enter Activation Code'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Key size={16} />
                </div>
                <input 
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-rose-500 text-[10px] font-bold mt-1 ml-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full h-12 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              <span>{language === 'MM' ? 'အခုပဲ အသက်သွင်းမည်' : 'Activate Now'}</span>
            </motion.button>
          </form>

          {/* Contact Admin Information */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex items-center justify-center gap-3 opacity-30">
              <div className="h-px w-6 bg-slate-500" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                {language === 'MM' ? 'ကုဒ်မရရှိသေးပါက' : 'Need a code?'}
              </p>
              <div className="h-px w-6 bg-slate-500" />
            </div>

            <div className="text-center space-y-4">
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed px-4">
                {language === 'MM' 
                  ? 'အသက်သွင်းကုဒ် ဝယ်ယူရန် သို့မဟုတ် စုံစမ်းရန်အတွက် အောက်ပါ Admin ထံသို့ ဆက်သွယ်နိုင်ပါသည်။'
                  : 'Contact the administrator below to purchase an activation code or for any inquiries.'}
              </p>

              {globalSettings.adminPhone && (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin Contact</div>
                  <a 
                    href={`tel:${globalSettings.adminPhone}`}
                    className="text-lg font-black text-indigo-400 flex items-center gap-2"
                  >
                    <Phone size={18} fill="currentColor" />
                    {globalSettings.adminPhone}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.a 
                  whileTap={{ scale: 0.97 }}
                  href={globalSettings.adminMessenger ? (globalSettings.adminMessenger.startsWith('http') ? globalSettings.adminMessenger : `https://m.me/${globalSettings.adminMessenger}`) : 'https://m.me/zinkokoaung'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-300 text-[11px]"
                >
                  {globalSettings.messengerIconUrl ? (
                    <img src={globalSettings.messengerIconUrl} className="w-4 h-4 object-cover rounded-full bg-white" alt="" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#0084FF]"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.51 3.32 7.39V22l2.74-1.51c1.24.34 2.56.53 3.94.53 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.18 12.82l-2.41-2.57-4.7 2.57 5.17-5.48 2.41 2.57 4.7-2.57-5.17 5.48z"/></svg>
                  )}
                  <span>Messenger</span>
                </motion.a>

                <motion.a 
                  whileTap={{ scale: 0.97 }}
                  href={globalSettings.adminTelegram ? (globalSettings.adminTelegram.startsWith('http') ? globalSettings.adminTelegram : `https://t.me/${globalSettings.adminTelegram}`) : '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-300 text-[11px]"
                >
                  {globalSettings.telegramIconUrl ? (
                    <img src={globalSettings.telegramIconUrl} className="w-4 h-4 object-cover rounded-full bg-white" alt="" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#229ED9]"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.18l-1.92 9.06c-.14.64-.52.8-.1.45l-2.92-2.15-1.41 1.36c-.15.15-.28.28-.58.28l.21-3.01 5.48-4.95c.24-.21-.05-.33-.37-.12l-6.77 4.26-2.92-.91c-.64-.2-.65-.64.13-.94l11.41-4.4c.53-.19 1 .13.8.91z"/></svg>
                  )}
                  <span>Telegram</span>
                </motion.a>

                {globalSettings.adminViber && (
                  <motion.a 
                    whileTap={{ scale: 0.97 }}
                    href={globalSettings.adminViber ? (globalSettings.adminViber.startsWith('viber') ? globalSettings.adminViber : `viber://chat?number=%2B${globalSettings.adminViber.replace(/[^0-9]/g, '').startsWith('09') ? '959' + globalSettings.adminViber.replace(/[^0-9]/g, '').substring(2) : globalSettings.adminViber.replace(/[^0-9]/g, '')}`) : '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-300 text-[11px]"
                  >
                    {globalSettings.viberIconUrl ? (
                      <img src={globalSettings.viberIconUrl} className="w-4 h-4 object-cover rounded-full bg-white" alt="" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#7360F2]"><path d="M18.11 17.1c-.56-.28-1.5-.66-1.92-.54-.42.12-.72.64-1.03 1-.95-.3-1.83-.8-2.57-1.54-.74-.74-1.24-1.62-1.54-2.57.36-.31.88-.61 1-1.03.12-.42-.26-1.36-.54-1.92-.22-.44-.94-1.92-1.28-1.96-.34-.04-.73.44-.94.66-.98.96-1.47 2.13-1.47 3.52 0 3.8 3.52 7.32 7.32 7.32 1.39 0 2.56-.49 3.52-1.47.22-.21.7-.6.66-.94-.04-.34-1.52-1.06-1.96-1.28l.23-.23zM22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10h6a4 4 0 0 0 4-4v-6z"/></svg>
                    )}
                    <span>Viber</span>
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 text-center text-[8px] md:text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          Developed By <span className="text-indigo-500/70">Zin Ko Ko Aung</span>
        </div>
      </main>
    </div>
  );
}
