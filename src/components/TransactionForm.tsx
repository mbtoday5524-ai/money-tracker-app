import React, { useState, useEffect } from 'react';
import { Plus, Minus, Calendar, Sparkles, Coins, Wallet } from 'lucide-react';
import { TransactionType } from '../types';
import { KBZLogo, WaveLogo, AYALogo, CashLogo, UABLogo, TrueLogo } from './Logos';

interface TransactionFormProps {
  onAdd: (tx: {
    date: string;
    category: string;
    type: TransactionType;
    amount: number;
    fee: number;
    phoneNumber?: string;
    feePaymentMethod?: 'Cash' | 'Wallet';
  }) => void;
  percentIn: number;
  percentOut: number;
  language: 'MM' | 'EN';
  kbzLogoUrl?: string;
  waveLogoUrl?: string;
  ayaLogoUrl?: string;
  cashLogoUrl?: string;
  uabLogoUrl?: string;
  trueLogoUrl?: string;
  kbzEnabled: boolean;
  waveEnabled: boolean;
  ayaEnabled: boolean;
  cashEnabled: boolean;
  uabEnabled: boolean;
  trueEnabled: boolean;
}

export default function TransactionForm({ 
  onAdd, 
  percentIn, 
  percentOut, 
  language,
  kbzLogoUrl,
  waveLogoUrl,
  ayaLogoUrl,
  cashLogoUrl,
  uabLogoUrl,
  trueLogoUrl,
  kbzEnabled,
  waveEnabled,
  ayaEnabled,
  cashEnabled,
  uabEnabled,
  trueEnabled
}: TransactionFormProps) {
  const banks = [
    { id: 'KBZ', name: 'KBZ Pay', logo: kbzLogoUrl, CustomLogo: KBZLogo, enabled: kbzEnabled },
    { id: 'Wave', name: 'Wave', logo: waveLogoUrl, CustomLogo: WaveLogo, enabled: waveEnabled },
    { id: 'AYAPay', name: 'AYAPay', logo: ayaLogoUrl, CustomLogo: AYALogo, enabled: ayaEnabled },
    { id: 'UABPay', name: 'UAB Pay', logo: uabLogoUrl, CustomLogo: UABLogo, enabled: uabEnabled },
    { id: 'TrueMoney', name: 'True Money', logo: trueLogoUrl, CustomLogo: TrueLogo, enabled: trueEnabled },
    { id: 'Cash', name: 'Cash', logo: cashLogoUrl, CustomLogo: CashLogo, enabled: cashEnabled },
  ].filter(b => b.enabled);

  const firstEnabled = banks[0]?.id || '';
  const [categoryId, setCategoryId] = useState<string>(firstEnabled);

  useEffect(() => {
    if (banks.length > 0 && !banks.some(b => b.id === categoryId)) {
      setCategoryId(banks[0].id);
    }
  }, [kbzEnabled, waveEnabled, ayaEnabled, cashEnabled, uabEnabled, trueEnabled, categoryId]);
  
  const [type, setType] = useState<TransactionType>(TransactionType.IN);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [feePaymentMethod, setFeePaymentMethod] = useState<'Cash' | 'Wallet'>('Cash');

  const getCleanAmount = (val: string) => {
    return Number(val.replace(/,/g, '')) || 0;
  };

  const handleSubmit = (e: React.FormEvent, selectedType?: TransactionType) => {
    e.preventDefault();
    const parsedAmount = getCleanAmount(amount);
    if (!amount || parsedAmount <= 0 || !categoryId) return;
    
    const finalType = selectedType || type;
    const finalFee = parsedAmount * (finalType === TransactionType.IN ? percentIn : percentOut) / 100;

    // Automatically compute correct local date (YYYY-MM-DD)
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    const currentDate = localDate.toISOString().split('T')[0];

    onAdd({
      date: currentDate,
      category: categoryId,
      type: finalType,
      amount: parsedAmount,
      fee: finalFee,
      phoneNumber: phoneNumber || undefined,
      feePaymentMethod: categoryId === 'Cash' ? 'Cash' : feePaymentMethod
    });
    setAmount('');
    setPhoneNumber('');
    // Keep or reset fee payment mode
  };

  const f = (n: number) => n.toLocaleString();

  const currentCleanAmount = getCleanAmount(amount);
  const calculatedFeeIn = currentCleanAmount * percentIn / 100;
  const calculatedFeeOut = currentCleanAmount * percentOut / 100;

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="space-y-4">
        {/* Wallet Selection at Full Width */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] px-1 flex items-center gap-2 transition-colors font-display">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {language === 'MM' ? 'အကောင့်အမျိုးအစား' : 'Select Wallet'}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {banks.map((bank) => (
              <button
                key={bank.id}
                type="button"
                disabled={!bank.enabled}
                onClick={() => setCategoryId(bank.id)}
                className={`flex items-center gap-2.5 p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${
                  !bank.enabled
                    ? 'opacity-40 grayscale bg-slate-100/30 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed select-none'
                    : categoryId === bank.id 
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold scale-[1.01]' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center overflow-hidden rounded-lg shrink-0">
                  {bank.logo ? (
                    <img src={bank.logo} alt={bank.name} className={`w-full h-full object-contain ${categoryId === bank.id ? '' : 'opacity-60 grayscale'}`} />
                  ) : bank.CustomLogo ? (
                    <bank.CustomLogo className={`w-full h-full ${categoryId === bank.id ? '' : 'opacity-60 grayscale'}`} />
                  ) : (
                    <div className={`w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black ${categoryId === bank.id ? '' : 'opacity-60'}`}>{bank.name.slice(0, 3)}</div>
                  )}
                </div>
                <div className="text-left">
                  <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider block leading-none ${categoryId === bank.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>{bank.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount, Phone Number Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] px-1 flex items-center gap-2 font-display">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {language === 'MM' ? 'ငွေပမာဏ (ကျပ်)' : 'Transfer Amount'}
            </label>
            <div className="relative group h-12">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 pr-16 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800/85 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-650"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-indigo-50/80 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg border border-indigo-100/60 dark:border-indigo-800/50 pointer-events-none">
                <Sparkles size={10} className="text-indigo-500" />
                <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">Net</span>
              </div>
            </div>
          </div>
          
          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] px-1 flex items-center gap-2 font-display">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}
            </label>
            <div className="relative group h-12">
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="09..."
                className="w-full h-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800/85 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700 placeholder:text-slate-300 dark:placeholder:text-slate-650"
              />
            </div>
          </div>
        </div>

        {/* Fee Payment Method Selection */}
        {categoryId !== 'Cash' && (
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] px-1 flex items-center gap-2 transition-colors font-display">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {language === 'MM' ? 'ကော်မရှင် / ဝန်ဆောင်ခ ရရှိပုံ' : 'Fee Payment Method'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeePaymentMethod('Cash')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-300 ${
                  feePaymentMethod === 'Cash'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold scale-[1.01]'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Coins size={15} className={feePaymentMethod === 'Cash' ? 'text-emerald-500' : 'text-slate-400'} />
                <div className="text-left leading-none">
                  <span className="text-[11px] font-black uppercase tracking-wider block">
                    {language === 'MM' ? 'Cash နဲ့ပေးချေ' : 'Cash Payment'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFeePaymentMethod('Wallet')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-300 ${
                  feePaymentMethod === 'Wallet'
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold scale-[1.01]'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Wallet size={15} className={feePaymentMethod === 'Wallet' ? 'text-amber-500' : 'text-slate-400'} />
                <div className="text-left leading-none">
                  <span className="text-[11px] font-black uppercase tracking-wider block">
                    {language === 'MM' ? 'Transfer ထဲပေါင်းလွှဲ' : 'Include in Transfer'}
                  </span>
                </div>
              </button>
            </div>
            <p className="text-[9px] text-slate-450 dark:text-slate-500 italic px-1 leading-normal">
              {feePaymentMethod === 'Cash'
                ? (language === 'MM' ? '* ဝန်ဆောင်ခကို ကတ်စတမ်မာက Cash (လက်ငင်း) ပေးချေသည်။ (လက်ကျန် Cash ထဲပေါင်းထည့်မည်)' : '* Service fee is paid in Cash. (Will be added to Cash balance)')
                : (language === 'MM' ? `* ဝန်ဆောင်ခကို Transfer ထဲပေါင်းပြီး ${categoryId} wallet စာရင်းထဲသို့ ထည့်သွင်းတွက်ချက်မည်` : `* Service fee is included in transfer and credited to your ${categoryId} digital wallet.`)}
            </p>
          </div>
        )}
      </div>
      
      {/* Action Area */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 transition-colors">
        <button
          onClick={(e) => handleSubmit(e as any, TransactionType.IN)}
          className="group relative h-14 lg:h-16 flex items-center justify-between px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md shrink-0">
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            </div>
            <div className="text-left font-display">
              <h4 className="font-extrabold text-xs sm:text-sm tracking-tight leading-none">{language === 'MM' ? 'ငွေသွင်းရန်' : 'Deposit'}</h4>
            </div>
          </div>

          <div className="text-right relative z-10">
            <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">{language === 'MM' ? 'ကော်မရှင်' : 'Fee'} ({percentIn}%)</p>
            <p className="font-black text-xs sm:text-sm tracking-tighter leading-none">+{f(calculatedFeeIn)}</p>
          </div>
        </button>

        <button
          onClick={(e) => handleSubmit(e as any, TransactionType.OUT)}
          className="group relative h-14 lg:h-16 flex items-center justify-between px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md shrink-0">
              <Minus size={16} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left font-display">
              <h4 className="font-extrabold text-xs sm:text-sm tracking-tight leading-none">{language === 'MM' ? 'ငွေထုတ်ရန်' : 'Withdraw'}</h4>
            </div>
          </div>

          <div className="text-right relative z-10">
            <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">{language === 'MM' ? 'ကော်မရှင်' : 'Fee'} ({percentOut}%)</p>
            <p className="font-black text-xs sm:text-sm tracking-tighter leading-none">+{f(calculatedFeeOut)}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
