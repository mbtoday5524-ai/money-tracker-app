import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { KBZLogo, WaveLogo, AYALogo, CashLogo, UABLogo, TrueLogo } from './Logos';
import { ComponentType } from 'react';

interface SummaryProps {
  kbzIn: number;
  kbzOut: number;
  waveIn: number;
  waveOut: number;
  ayaIn: number;
  ayaOut: number;
  uabIn: number;
  uabOut: number;
  trueIn: number;
  trueOut: number;
  kbzEnabled: boolean;
  waveEnabled: boolean;
  ayaEnabled: boolean;
  uabEnabled: boolean;
  trueEnabled: boolean;
  cashEnabled: boolean;
  totalFee: number;
  language: 'MM' | 'EN';
  kbzLogoUrl?: string;
  waveLogoUrl?: string;
  ayaLogoUrl?: string;
  cashLogoUrl?: string;
  uabLogoUrl?: string;
  trueLogoUrl?: string;
}

export default function Summary({ 
  kbzIn, 
  kbzOut, 
  waveIn, 
  waveOut, 
  ayaIn, 
  ayaOut, 
  uabIn, 
  uabOut, 
  trueIn, 
  trueOut, 
  kbzEnabled,
  waveEnabled,
  ayaEnabled,
  uabEnabled,
  trueEnabled,
  cashEnabled,
  totalFee, 
  language,
  kbzLogoUrl,
  waveLogoUrl,
  ayaLogoUrl,
  cashLogoUrl,
  uabLogoUrl,
  trueLogoUrl
}: SummaryProps) {
  const f = (n: number) => n.toLocaleString();

  const totalIn = (kbzEnabled ? kbzIn : 0) + (waveEnabled ? waveIn : 0) + (ayaEnabled ? ayaIn : 0) + (uabEnabled ? uabIn : 0) + (trueEnabled ? trueIn : 0);
  const totalOut = (kbzEnabled ? kbzOut : 0) + (waveEnabled ? waveOut : 0) + (ayaEnabled ? ayaOut : 0) + (uabEnabled ? uabOut : 0) + (trueEnabled ? trueOut : 0);


  // Cash In = Wallet Out (we received cash)
  // Cash Out = Wallet In (we gave cash)
  const cashIn = totalOut;
  const cashOut = totalIn;

  const AccountStat = ({ label, inc, dec, logoUrl, DefaultLogo }: { 
    label: string, 
    inc: number, 
    dec: number, 
    logoUrl?: string, 
    DefaultLogo: ComponentType<{ className?: string }> 
  }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-4 h-4 sm:w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm bg-slate-50 dark:bg-slate-800">
           {logoUrl ? (
             <img src={logoUrl} alt={label} className="w-full h-full object-contain" />
           ) : (
             <DefaultLogo className="w-3 h-3 sm:w-4 h-4 opacity-70" />
           )}
        </div>
        <p className="text-[7.5px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <div className="flex flex-col gap-0.5 sm:gap-1.5 pt-0.5 pl-5.5 sm:pl-7">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 opacity-60">
                        <TrendingUp size={7} className="text-emerald-500 sm:w-2.5 sm:h-2.5" />
                        <span className="text-[7.2px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">{language === 'MM' ? 'အဝင်' : 'In'}</span>
                      </div>
                      <span className="text-[9px] sm:text-xs font-black text-slate-700 dark:text-slate-300 font-mono">{f(inc)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 opacity-60">
                        <TrendingDown size={7} className="text-rose-500 sm:w-2.5 sm:h-2.5" />
                        <span className="text-[7.2px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">{language === 'MM' ? 'အထွက်' : 'Out'}</span>
                      </div>
                      <span className="text-[9px] sm:text-xs font-black text-slate-700 dark:text-slate-300 font-mono">{f(dec)}</span>
                    </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 sleek-shadow overflow-hidden flex flex-col h-full transition-colors">
      <div className="p-3 sm:p-4 lg:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 transition-colors">
        <h3 className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 lg:mb-6">{language === 'MM' ? 'စာရင်းချုပ်' : 'Current Ledger'}</h3>
        
        <div className="space-y-2 lg:space-y-4">
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/50 rounded-xl lg:rounded-2xl p-2.5 lg:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-7 h-7 lg:w-10 lg:h-10 bg-emerald-500 text-white rounded-lg lg:rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="lg:w-5 lg:h-5" />
              </div>
              <div>
                <p className="text-[8px] lg:text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest mb-1">{language === 'MM' ? 'စုစုပေါင်း အဝင်' : 'Total Inflow'}</p>
                <p className={`font-black text-emerald-700 dark:text-emerald-400 tracking-tighter ${language === 'MM' ? 'text-xs lg:text-base' : 'text-sm lg:text-lg'}`}>{f(totalIn)}</p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-800/50 rounded-xl lg:rounded-2xl p-2.5 lg:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-7 h-7 lg:w-10 lg:h-10 bg-rose-500 text-white rounded-lg lg:rounded-xl flex items-center justify-center shrink-0">
                <TrendingDown size={14} className="lg:w-5 lg:h-5" />
              </div>
              <div>
                <p className="text-[8px] lg:text-[10px] font-bold text-rose-600/60 dark:text-rose-400/60 uppercase tracking-widest mb-1">{language === 'MM' ? 'စုစုပေါင်း အထွက်' : 'Total Outflow'}</p>
                <p className={`font-black text-rose-700 dark:text-rose-400 tracking-tighter ${language === 'MM' ? 'text-xs lg:text-base' : 'text-sm lg:text-lg'}`}>{f(totalOut)}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-xl lg:rounded-2xl p-3 lg:p-5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 lg:w-24 h-16 lg:h-24 bg-white/10 rounded-full -mr-6 lg:-mr-8 -mt-6 lg:-mt-8 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center gap-3 lg:gap-4">
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-white/20 text-white rounded-lg lg:rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                <DollarSign size={16} className="lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-[8px] lg:text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{language === 'MM' ? 'ရရှိသော ကော်မရှင်စုစုပေါင်း' : 'Total Revenue (Fee)'}</p>
                <p className={`font-black text-white tracking-tighter ${language === 'MM' ? 'text-sm lg:text-lg' : 'text-base lg:text-xl'}`}>{f(totalFee)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 lg:p-8 space-y-3 lg:space-y-8 flex-1 bg-white dark:bg-[#0f172a] transition-colors">
        {kbzEnabled && <>
            <AccountStat label="KPay Wallet" inc={kbzIn} dec={kbzOut} logoUrl={kbzLogoUrl} DefaultLogo={KBZLogo} />
            <div className="h-px bg-slate-50 dark:bg-slate-800"></div>
        </>}
        {waveEnabled && <>
            <AccountStat label="Wave Wallet" inc={waveIn} dec={waveOut} logoUrl={waveLogoUrl} DefaultLogo={WaveLogo} />
            <div className="h-px bg-slate-50 dark:bg-slate-800"></div>
        </>}
        {ayaEnabled && <>
            <AccountStat label="AYAPay Wallet" inc={ayaIn} dec={ayaOut} logoUrl={ayaLogoUrl} DefaultLogo={AYALogo} />
            <div className="h-px bg-slate-50 dark:bg-slate-800"></div>
        </>}
        {uabEnabled && <>
            <AccountStat label="UAB Wallet" inc={uabIn} dec={uabOut} logoUrl={uabLogoUrl} DefaultLogo={UABLogo} />
            <div className="h-px bg-slate-50 dark:bg-slate-800"></div>
        </>}
        {trueEnabled && <>
            <AccountStat label="True Money Wallet" inc={trueIn} dec={trueOut} logoUrl={trueLogoUrl} DefaultLogo={TrueLogo} />
            <div className="h-px bg-slate-50 dark:bg-slate-800"></div>
        </>}
        {cashEnabled && <>
            <AccountStat label={language === 'MM' ? 'လက်ဝယ်ရှိငွေ' : 'Cash on Hand'} inc={cashIn} dec={cashOut} logoUrl={cashLogoUrl} DefaultLogo={CashLogo} />
        </>}
      </div>
    </div>
  );
}
