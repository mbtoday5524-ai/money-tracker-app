import React, { useState, useEffect, ComponentType } from 'react';
import { Wallet, Banknote, CreditCard, LucideProps } from 'lucide-react';
import { KBZLogo, WaveLogo, AYALogo, CashLogo, UABLogo, TrueLogo } from './Logos';

interface BalanceCardsProps {
  kbz: number;
  wave: number;
  aya: number;
  cash: number;
  uab: number;
  trueMoney: number;
  kbzEnabled: boolean;
  waveEnabled: boolean;
  ayaEnabled: boolean;
  cashEnabled: boolean;
  uabEnabled: boolean;
  trueEnabled: boolean;
  language: 'MM' | 'EN';
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
}

interface StatCardProps {
  label: string,
  value: string,
  icon?: ComponentType<LucideProps>,
  image?: string,
  customLogo?: ComponentType<{ className?: string }>,
  colorClass: string,
  iconColorClass: string,
  labelColorClass: string,
  darkColorClass: string,
  borderColorClass: string,
  phone?: string,
  enabled?: boolean,
  language: 'MM' | 'EN'
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, image, customLogo: CustomLogo, colorClass, iconColorClass, labelColorClass, darkColorClass, borderColorClass, phone, enabled = true, language }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [image]);

  const maskPhone = (p?: string) => {
    if (!p) return null;
    if (p.length < 8) return p;
    // Format: 09422***789
    return p.slice(0, 5) + '***' + p.slice(-3);
  };

  return (
    <div className={`bg-white dark:bg-[#0f172a] p-3 sm:p-4 rounded-xl border-[3px] ${borderColorClass} sleek-shadow flex items-center justify-between group transition-all overflow-hidden ${enabled ? 'hover:scale-[1.01]' : 'opacity-35 grayscale select-none pointer-events-none'}`}>
      <div className="space-y-1 py-0.5 min-w-0 flex-1">
        <p className={`text-[10px] sm:text-[11px] lg:text-[12px] font-black font-display ${labelColorClass} ${
          language === 'MM'
            ? 'tracking-normal normal-case leading-tight'
            : 'tracking-tight normal-case leading-tight'
        }`}>
          {label}
        </p>
        <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap font-display">
          {value}
        </h3>
        {phone && (
          <p className="text-[8.5px] sm:text-[9.5px] lg:text-[11px] font-bold text-indigo-500 dark:text-indigo-400 tracking-tight whitespace-nowrap">
            {maskPhone(phone)}
          </p>
        )}
      </div>
      <div className={`relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 ml-2 ${colorClass} ${darkColorClass} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-500 overflow-hidden`}>
        {image && !imgError ? (
          <img 
            src={image} 
            alt={label} 
            key={image} // Key helps React recognize image change
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer" 
            onError={() => setImgError(true)}
          />
        ) : CustomLogo ? (
          <CustomLogo className="w-full h-full" />
        ) : (
          Icon && <Icon className={iconColorClass} size={20} />
        )}
      </div>
    </div>
  );
};

export default function BalanceCards({ 
  kbz, wave, aya, cash, uab, trueMoney,
  kbzEnabled, waveEnabled, ayaEnabled, cashEnabled, uabEnabled, trueEnabled, 
  language, 
  kbzPhone, wavePhone, ayaPhone, uabPhone, truePhone,
  kbzLogoUrl, waveLogoUrl, ayaLogoUrl, cashLogoUrl, uabLogoUrl, trueLogoUrl 
}: BalanceCardsProps) {
  const f = (n: number) => n.toLocaleString();

  return (
    <>
      {kbzEnabled && (
        <StatCard 
          label={language === 'MM' ? 'KBZ Pay လက်ကျန်' : 'KBZ Pay Balance'} 
          value={f(kbz)} 
          image={kbzLogoUrl}
          customLogo={KBZLogo}
          phone={kbzPhone}
          enabled={kbzEnabled}
          language={language}
          colorClass="bg-blue-50" 
          darkColorClass="dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400" 
          labelColorClass="text-blue-600 dark:text-blue-400"
          borderColorClass="border-blue-200 dark:border-blue-900/50 group-hover:border-blue-400 dark:group-hover:border-blue-700"
        />
      )}
      {waveEnabled && (
        <StatCard 
          label={language === 'MM' ? 'Wave Pay လက်ကျန်' : 'Wave Pay Balance'} 
          value={f(wave)} 
          image={waveLogoUrl}
          customLogo={WaveLogo}
          phone={wavePhone}
          enabled={waveEnabled}
          language={language}
          colorClass="bg-amber-50" 
          darkColorClass="dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400" 
          labelColorClass="text-amber-600 dark:text-amber-400"
          borderColorClass="border-amber-200 dark:border-amber-900/50 group-hover:border-amber-400 dark:group-hover:border-amber-700"
        />
      )}
      {ayaEnabled && (
        <StatCard 
          label={language === 'MM' ? 'AYA Pay လက်ကျန်' : 'AYA Pay Balance'} 
          value={f(aya)} 
          image={ayaLogoUrl}
          customLogo={AYALogo}
          phone={ayaPhone}
          enabled={ayaEnabled}
          language={language}
          colorClass="bg-red-50" 
          darkColorClass="dark:bg-red-900/20"
          iconColorClass="text-red-600 dark:text-red-400" 
          labelColorClass="text-red-600 dark:text-red-400"
          borderColorClass="border-red-200 dark:border-red-900/50 group-hover:border-red-400 dark:group-hover:border-red-700"
        />
      )}
      {uabEnabled && (
        <StatCard 
          label={language === 'MM' ? 'UAB Pay လက်ကျန်' : 'UAB Pay Balance'} 
          value={f(uab)} 
          image={uabLogoUrl}
          customLogo={UABLogo}
          phone={uabPhone}
          enabled={uabEnabled}
          language={language}
          colorClass="bg-purple-50" 
          darkColorClass="dark:bg-purple-900/20"
          iconColorClass="text-purple-600 dark:text-purple-400" 
          labelColorClass="text-purple-600 dark:text-purple-400"
          borderColorClass="border-purple-200 dark:border-purple-900/50 group-hover:border-purple-400 dark:group-hover:border-purple-700"
        />
      )}
      {trueEnabled && (
        <StatCard 
          label={language === 'MM' ? 'True Money လက်ကျန်' : 'True Money Balance'} 
          value={f(trueMoney)} 
          image={trueLogoUrl}
          customLogo={TrueLogo}
          phone={truePhone}
          enabled={trueEnabled}
          language={language}
          colorClass="bg-orange-50" 
          darkColorClass="dark:bg-orange-900/20"
          iconColorClass="text-orange-600 dark:text-orange-400" 
          labelColorClass="text-orange-600 dark:text-orange-400"
          borderColorClass="border-orange-200 dark:border-orange-900/50 group-hover:border-orange-400 dark:group-hover:border-orange-700"
        />
      )}
      {cashEnabled && (
        <StatCard 
          label={language === 'MM' ? 'လက်ဝယ်ရှိငွေ' : 'Cash on Hand'} 
          value={f(cash)} 
          image={cashLogoUrl}
          customLogo={CashLogo}
          enabled={cashEnabled}
          language={language}
          colorClass="bg-emerald-50" 
          darkColorClass="dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400" 
          labelColorClass="text-emerald-600 dark:text-emerald-400"
          borderColorClass="border-emerald-200 dark:border-emerald-900/50 group-hover:border-emerald-400 dark:group-hover:border-emerald-700"
        />
      )}
    </>
  );
}
