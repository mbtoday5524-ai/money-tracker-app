import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import AuthStatus from './AuthStatus';
import { KBZLogo, WaveLogo, AYALogo } from './Logos';

interface LoginPageProps {
  language: 'MM' | 'EN';
  setLanguage: (lang: 'MM' | 'EN') => void;
}

export default function LoginPage({ language, setLanguage }: LoginPageProps) {
  const features = [
    {
      mm: 'နေ့စဉ် ငွေအဝင်/အထွက် စာရင်းများကို စနစ်တကျ မှတ်တမ်းတင်နိုင်ခြင်း',
      en: 'Systematically record daily cash-in and cash-out transactions'
    },
    {
      mm: 'KPay, Wave, AYA Pay စသည့် Mobile Banking များအတွက် သီးသန့်စာရင်းကိုင်ပေးခြင်း',
      en: 'Specialized ledger for KPay, Wave, and AYA Pay transfers'
    },
    {
      mm: 'မိမိလုပ်ငန်းစာရင်းများကို ဖုန်းတစ်လုံးရှိရုံဖြင့် အချိန်မရွေး လွယ်ကူစွာ စီမံခန့်ခွဲနိုင်ခြင်း',
      en: 'Easily manage business records anytime with just your smartphone'
    }
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#030712] relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-indigo-500/10 md:bg-indigo-500/15 rounded-full blur-[120px] md:blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-blue-500/10 md:bg-blue-500/15 rounded-full blur-[120px] md:blur-[160px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-center border-b border-white/5 backdrop-blur-md shrink-0">
        <div className="w-full max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet className="text-white" size={18} />
            </div>
            <span className="text-white font-bold text-sm tracking-tight whitespace-nowrap">Z Money Tracker</span>
          </div>
          
          <button 
            onClick={() => setLanguage(language === 'MM' ? 'EN' : 'MM')}
            className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 shrink-0"
          >
            <Globe size={13} />
            {language === 'MM' ? 'English' : 'မြန်မာ'}
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 md:gap-20 py-2 md:py-0">
          {/* Left Column: Branding & Features */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[320px] md:max-w-none md:flex-1 flex flex-col gap-4 md:gap-10 justify-center"
          >
            <div className="text-center md:text-left space-y-4 md:space-y-6">
              {/* Payment Systems Icons */}
              <div className="flex items-center justify-center md:justify-start gap-5">
                <motion.div whileHover={{ scale: 1.05 }} className="p-0.5 md:p-1 bg-white/5 rounded-xl border border-white/10 shadow-2xl">
                  <KBZLogo className="w-12 h-12 md:w-16 md:h-16 rounded-lg" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="p-0.5 md:p-1 bg-white/5 rounded-xl border border-white/10 shadow-2xl">
                  <WaveLogo className="w-12 h-12 md:w-16 md:h-16 rounded-lg" />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="p-0.5 md:p-1 bg-white/5 rounded-xl border border-white/10 shadow-2xl">
                  <AYALogo className="w-12 h-12 md:w-16 md:h-16 rounded-lg" />
                </motion.div>
              </div>

              <div className="space-y-2 md:space-y-4">
                <h1 className={`text-white font-bold tracking-tight hidden md:block ${language === 'MM' ? 'text-2xl leading-snug' : 'text-3xl'}`}>
                  {language === 'MM' ? 'လုပ်ငန်းစာရင်းများကို စနစ်တကျ စီမံခန့်ခွဲပါ' : 'Manage Business Professionally'}
                </h1>
                <p className={`text-slate-400 text-xs md:text-sm font-medium px-4 md:px-0 pt-1 ${language === 'MM' ? 'leading-relaxed' : 'leading-tight'}`}>
                  {language === 'MM' 
                    ? 'သင်၏လုပ်ငန်းငွေစာရင်းများကို စနစ်တကျ စီမံခန့်ခွဲလိုက်ပါ။' 
                    : 'Manage your business finances professionally and securely.'}
                </p>
              </div>
            </div>

            {/* Quick Info / Features */}
            <div className="flex flex-col gap-2.5 md:gap-4">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex gap-3 md:gap-4 items-center bg-white/[0.03] p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/[0.08] shadow-sm hover:bg-white/[0.05] transition-colors"
                >
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 md:w-5 md:h-5" />
                  <p className={`text-slate-300 text-[11.5px] md:text-[13px] font-medium ${language === 'MM' ? 'leading-relaxed py-0.5' : 'leading-tight'}`}>
                    {language === 'MM' ? feature.mm : feature.en}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Login Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-[320px] md:w-[400px] flex flex-col gap-4 md:gap-10 justify-center"
          >
            <div className="bg-white/[0.04] backdrop-blur-3xl p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl relative space-y-6 md:space-y-10 group">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              
              <div className="text-center space-y-2 md:space-y-4 relative z-10">
                <h2 className={`text-white font-bold tracking-tight ${language === 'MM' ? 'text-[13px] md:text-[16px]' : 'text-xs md:text-[13px] md:tracking-[0.3em]'}`}>
                  {language === 'MM' ? 'စတင်ရန် အကောင့်ဝင်ပါ' : 'SIGN IN TO CONTINUE'}
                </h2>
                <div className="h-0.5 w-10 bg-indigo-500/40 mx-auto rounded-full" />
              </div>
              
              <div className="relative z-10">
                <AuthStatus />
              </div>
            </div>

            <div className="text-center space-y-4 pt-2 md:pt-4">
              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em]">
                Developed By <span className="text-indigo-500/90 font-extrabold">Zin Ko Ko Aung</span>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
