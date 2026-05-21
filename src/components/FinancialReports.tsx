import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Percent,
  CalendarDays
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { motion } from 'motion/react';

interface FinancialReportsProps {
  transactions: Transaction[];
  language: 'MM' | 'EN';
}

const BRAND_COLORS: Record<string, { stroke: string; bg: string; text: string; label: string }> = {
  KBZ: { 
    stroke: '#3b82f6', // blue-500
    bg: 'bg-blue-500', 
    text: 'text-blue-600 dark:text-blue-400',
    label: 'KBZPay'
  },
  Wave: { 
    stroke: '#eab308', // yellow-500
    bg: 'bg-yellow-500', 
    text: 'text-yellow-600 dark:text-amber-400',
    label: 'WavePay'
  },
  AYAPay: { 
    stroke: '#f43f5e', // rose-500
    bg: 'bg-rose-500', 
    text: 'text-rose-600 dark:text-rose-400',
    label: 'AYAPay'
  },
  UABPay: { 
    stroke: '#a855f7', // purple-500
    bg: 'bg-purple-500', 
    text: 'text-purple-600 dark:text-purple-400',
    label: 'UABPay'
  },
  TrueMoney: { 
    stroke: '#f97316', // orange-500
    bg: 'bg-orange-500', 
    text: 'text-orange-600 dark:text-orange-400',
    label: 'TrueMoney'
  },
  Cash: { 
    stroke: '#10b981', // emerald-500
    bg: 'bg-emerald-500', 
    text: 'text-emerald-500 dark:text-emerald-400',
    label: 'Cash'
  }
};

export default function FinancialReports({ transactions, language }: FinancialReportsProps) {
  const [timeframe, setTimeframe] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);

  const getBrandColor = (category: string) => {
    const normalized = category.trim();
    return BRAND_COLORS[normalized] || { stroke: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-600', label: category };
  };

  const getCategoryLabel = (cat: string) => {
    if (language === 'MM') {
      switch (cat) {
        case 'KBZ': return 'KBZPay ဝေါလတ်';
        case 'Wave': return 'WavePay ဝေါလတ်';
        case 'AYAPay': return 'AYAPay ဝေါလတ်';
        case 'UABPay': return 'UAB ဝေါလတ်';
        case 'TrueMoney': return 'True Money ဝေါလတ်';
        case 'Cash': return 'လက်ဝယ်ရှိငွေ';
        default: return cat;
      }
    } else {
      switch (cat) {
        case 'KBZ': return 'KBZPay Wallet';
        case 'Wave': return 'WavePay Wallet';
        case 'AYAPay': return 'AYAPay Wallet';
        case 'UABPay': return 'UAB Wallet';
        case 'TrueMoney': return 'True Money Wallet';
        case 'Cash': return 'Cash on Hand';
        default: return cat;
      }
    }
  };

  const f = (n: number) => new Intl.NumberFormat().format(n);

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      if (timeframe === 'DAY') {
        const txDate = new Date(tx.date).toISOString().split('T')[0];
        return txDate === selectedDay;
      }
      if (timeframe === 'MONTH') {
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      }
      return d.getFullYear() === selectedYear;
    });
  }, [transactions, timeframe, selectedDay, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const totalFees = filteredData.reduce((acc, tx) => acc + (tx.fee || 0), 0);
    const totalAmount = filteredData.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const avgFeePercent = totalAmount > 0 ? (totalFees / totalAmount) * 100 : 0;

    const byCategory: Record<string, { fees: number; count: number; amount: number }> = {};
    filteredData.forEach(tx => {
      if (!byCategory[tx.category]) {
        byCategory[tx.category] = { fees: 0, count: 0, amount: 0 };
      }
      byCategory[tx.category].fees += tx.fee || 0;
      byCategory[tx.category].amount += tx.amount || 0;
      byCategory[tx.category].count += 1;
    });

    return { totalFees, totalAmount, avgFeePercent, byCategory };
  }, [filteredData]);

  const pieData = useMemo(() => {
    let accumPercent = 0;
    return (Object.entries(stats.byCategory) as [string, { fees: number; count: number; amount: number }][])
      .sort((a, b) => b[1].fees - a[1].fees)
      .map(([category, catStats], i) => {
        const value = catStats.fees;
        const percent = stats.totalFees > 0 ? value / stats.totalFees : 0;
        const startPercent = accumPercent;
        accumPercent += percent;
        return {
          id: i,
          category,
          value,
          percent,
          startPercent,
        };
      });
  }, [stats.byCategory, stats.totalFees]);

  const months = language === 'MM' ? [
    'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
    'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
  ] : [
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const chartData = useMemo(() => {
    if (timeframe === 'DAY') {
      const bins = Array.from({ length: 8 }, (_, i) => {
        const startHour = i * 3;
        const endHour = (i + 1) * 3;
        
        let label = '';
        let shortLabel = '';
        
        if (language === 'MM') {
          const formatHourMM = (h: number) => {
            if (h === 0 || h === 24) return 'ည ၁၂';
            if (h === 12) return 'မွန်းတည့် ၁၂';
            return h > 12 ? `မွန်းလွဲ ${h - 12}` : `မနက် ${h}`;
          };
          label = `${formatHourMM(startHour)} နာရီ မှ ${formatHourMM(endHour)} နာရီ`;
          shortLabel = `${startHour === 0 ? 'ည၁၂' : startHour === 12 ? 'နေ့၁၂' : startHour > 12 ? (startHour - 12) + 'ညနေ' : startHour + 'မနက်'}`;
        } else {
          const formatHourEN = (h: number) => {
            if (h === 0 || h === 24) return '12 AM';
            if (h === 12) return '12 PM';
            return h >= 12 ? `${h - 12} PM` : `${h} AM`;
          };
          label = `${formatHourEN(startHour)} - ${formatHourEN(endHour)}`;
          shortLabel = `${startHour === 0 ? '12A' : startHour === 12 ? '12P' : startHour > 12 ? (startHour - 12) + 'P' : startHour + 'A'}`;
        }

        return {
          key: `${startHour}`,
          label,
          shortLabel,
          fees: 0,
          count: 0,
        };
      });

      filteredData.forEach(tx => {
        const dateObj = new Date(tx.date);
        const hour = dateObj.getHours();
        const binIdx = Math.min(Math.floor(hour / 3), 7);
        bins[binIdx].fees += tx.fee || 0;
        bins[binIdx].count += 1;
      });

      return bins;
    }

    if (timeframe === 'MONTH') {
      const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const bins = Array.from({ length: totalDays }, (_, i) => {
        const dayNum = i + 1;
        const label = language === 'MM' ? `${dayNum} ရက်နေ့` : `Day ${dayNum}`;
        const shortLabel = `${dayNum}`;
        return {
          key: `${dayNum}`,
          label,
          shortLabel,
          fees: 0,
          count: 0,
        };
      });

      filteredData.forEach(tx => {
        const dateObj = new Date(tx.date);
        const day = dateObj.getDate();
        if (day >= 1 && day <= totalDays) {
          bins[day - 1].fees += tx.fee || 0;
          bins[day - 1].count += 1;
        }
      });

      return bins;
    }

    // YEAR timeframe
    const bins = Array.from({ length: 12 }, (_, i) => {
      const monthLabel = months[i];
      return {
        key: `${i}`,
        label: monthLabel,
        shortLabel: language === 'MM' ? monthLabel : monthLabel.slice(0, 3),
        fees: 0,
        count: 0,
      };
    });

    filteredData.forEach(tx => {
      const dateObj = new Date(tx.date);
      const month = dateObj.getMonth();
      if (month >= 0 && month < 12) {
        bins[month].fees += tx.fee || 0;
        bins[month].count += 1;
      }
    });

    return bins;
  }, [filteredData, timeframe, selectedMonth, selectedYear, language, months]);

  const maxFees = useMemo(() => {
    return Math.max(...chartData.map(b => b.fees), 1);
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <button 
            onClick={() => setTimeframe('DAY')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
              timeframe === 'DAY' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {language === 'MM' ? 'ရက်အလိုက်' : 'Daily'}
          </button>
          <button 
            onClick={() => setTimeframe('MONTH')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
              timeframe === 'MONTH' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {language === 'MM' ? 'လအလိုက်' : 'Monthly'}
          </button>
          <button 
            onClick={() => setTimeframe('YEAR')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
              timeframe === 'YEAR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {language === 'MM' ? 'နှစ်အလိုက်' : 'Yearly'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {timeframe === 'DAY' && (
            <input 
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          )}

          {timeframe !== 'DAY' && (
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-bold focus:outline-none"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}

          {timeframe === 'MONTH' && (
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-bold focus:outline-none"
            >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-indigo-600 p-4 lg:p-6 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[8px] sm:text-[9px] font-black opacity-70 uppercase tracking-[0.2em] mb-0.5 md:mb-1">
              {language === 'MM' ? 'စုစုပေါင်း ဝန်ဆောင်ခ (ကော်မရှင်)' : 'Total Fees Collected'}
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-4xl font-black">{f(stats.totalFees)}</h3>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 text-white/10 w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg flex items-center justify-center">
              <Percent size={12} className="lg:w-4 lg:h-4" />
            </div>
            <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {language === 'MM' ? 'ပျမ်းမျှ ဝန်ဆောင်ခနှုန်း' : 'Avg Fee %'}
            </p>
          </div>
          <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{stats.avgFeePercent.toFixed(2)}%</h4>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={12} className="lg:w-4 lg:h-4" />
            </div>
            <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {language === 'MM' ? 'စာရင်းသွင်းမှု စုစုပေါင်း' : 'Transactions'}
            </p>
          </div>
          <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white">{filteredData.length}</h4>
        </div>
      </div>

      {/* Fees Collected Over Time (Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
              <BarChart3 size={14} className="text-indigo-600 sm:w-4 sm:h-4 animate-pulse" />
              {language === 'MM' ? 'ဝန်ဆောင်ခ ရရှိမှု ခြုံငုံသုံးသပ်ချက် (အချိန်အလိုက်)' : 'Fees Collected Over Time'}
            </h3>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {timeframe === 'DAY' 
                ? (language === 'MM' ? 'တစ်ရက်တာအတွင်း (၃) နာရီခြား အပိုင်းအခြားအလိုက်' : 'Daily breakdown in 3-hour bins') 
                : timeframe === 'MONTH' 
                  ? (language === 'MM' ? 'လအလိုက် ရက်က္ကဒိန် ရက်စွဲများအလိုက်' : 'Monthly breakdown by day of month') 
                  : (language === 'MM' ? 'တစ်နှစ်တာအတွင်း လအလိုက်' : 'Yearly breakdown by month')
              }
            </p>
          </div>
          {/* Quick Active Bar Metric Readout */}
          <div className="text-right hidden sm:block min-h-[40px]">
            {activeBarIdx !== null && chartData[activeBarIdx] ? (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold"
              >
                <div className="text-slate-400 text-[9px] uppercase tracking-widest font-black leading-none mb-1">
                  {chartData[activeBarIdx].label}
                </div>
                <div className="text-slate-900 dark:text-white font-black leading-none">
                  {language === 'MM' ? 'စုစုပေါင်း ဝန်ဆောင်ခ' : 'Fees'}: <span className="text-indigo-600 dark:text-indigo-400">{f(chartData[activeBarIdx].fees)}</span>
                </div>
                <div className="text-slate-400 text-[10px] font-medium leading-none mt-0.5">
                  ({chartData[activeBarIdx].count} {language === 'MM' ? 'ကြိမ်' : 'Transactions'})
                </div>
              </motion.div>
            ) : (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-3 uppercase tracking-wider font-extrabold">
                {language === 'MM' ? 'အသေးစိတ်ကြည့်ရန် တိုင်တစ်ခုပေါ်သို့ ထိလိုက်ပါ' : 'Hover a bar for details'}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {filteredData.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays className="mx-auto text-slate-200 mb-2" size={40} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {language === 'MM' ? 'ရွေးချယ်ထားသောကာလအတွင်း အချက်အလက် မရှိပါ' : 'No data available for this period'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Chart Stage */}
              <div className="relative h-64 w-full flex flex-col justify-end pt-4 select-none">
                {/* Y-Axis Value Guides and horizontal dashed grid lines */}
                <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
                  {[1, 0.75, 0.5, 0.25, 0].map((percent, idx) => (
                    <div key={idx} className="relative w-full flex items-center">
                      <span className="text-[9px] font-black font-mono text-slate-405 dark:text-slate-500 bg-white/80 dark:bg-slate-900/80 px-1 rounded z-10 select-none">
                        {percent === 0 ? '0' : f(Math.round(maxFees * percent))}
                      </span>
                      <div className="absolute left-0 right-0 border-t border-dashed border-slate-100 dark:border-slate-800/80 -z-0" />
                    </div>
                  ))}
                </div>

                {/* Bars Container */}
                <div className="relative z-10 h-full flex items-end justify-between gap-[3px] sm:gap-2 px-1 pb-1">
                  {chartData.map((item, idx) => {
                    const heightPercent = maxFees > 0 ? (item.fees / maxFees) * 100 : 0;
                    const isActive = activeBarIdx === idx;
                    
                    return (
                      <div 
                        key={item.key}
                        className="flex-1 flex flex-col justify-end h-full relative"
                        onMouseEnter={() => setActiveBarIdx(idx)}
                        onMouseLeave={() => setActiveBarIdx(null)}
                      >
                        {/* Interactive floating state tooltip for mobile viewports */}
                        {isActive && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 bg-slate-950 text-white rounded-lg p-2 text-center shadow-lg text-[10px] font-bold pointer-events-none min-w-[120px] block sm:hidden">
                            <p className="text-[8px] opacity-70 mb-0.5">{item.label}</p>
                            <p className="font-black text-indigo-400">{f(item.fees)}</p>
                            <p className="text-[8px] opacity-50">{item.count} Tx</p>
                          </div>
                        )}

                        {/* Bar Segment */}
                        <div className="relative w-full h-full flex items-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.015 }}
                            className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-150 relative cursor-pointer ${
                              isActive 
                                ? 'bg-indigo-600 dark:bg-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-none' 
                                : item.fees > 0 
                                  ? 'bg-gradient-to-t from-indigo-500/80 to-indigo-600/80 hover:from-indigo-500 hover:to-indigo-600'
                                  : 'bg-slate-100 dark:bg-slate-800/40'
                            }`}
                            style={{ minHeight: item.fees > 0 ? '4px' : '0' }}
                          >
                            {/* Accent highlight cap */}
                            {item.fees > 0 && (
                              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-300 dark:bg-indigo-400 rounded-t-sm sm:rounded-t-md opacity-60" />
                            )}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-Axis labels */}
              <div className="flex justify-between items-center px-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                {timeframe === 'MONTH' ? (
                  // Month view can have up to 31 days. To prevent crowding, show labels at intervals (e.g. Day 1, 5, 10, 15, 20, 25, Progress end)
                  chartData.map((item, idx) => {
                    const dayNum = idx + 1;
                    const isSignificant = dayNum === 1 || dayNum % 5 === 0 || dayNum === chartData.length;
                    if (!isSignificant) return <div key={item.key} className="flex-1 animate-fade-in" />;
                    return (
                      <div 
                        key={item.key} 
                        className={`text-center flex-1 text-[9px] font-black font-mono transition-colors ${
                          activeBarIdx === idx 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.shortLabel}
                      </div>
                    );
                  })
                ) : (
                  // Daily & Yearly can show all labels comfortably
                  chartData.map((item, idx) => (
                    <div 
                      key={item.key}
                      style={{ width: `${100 / chartData.length}%` }}
                      className={`text-center text-[9px] font-black font-mono tracking-tighter truncate px-0.5 transition-colors ${
                        activeBarIdx === idx 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.shortLabel}
                    </div>
                  ))
                )}
              </div>

              {/* Mobile details reader fallback */}
              <div className="block sm:hidden bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 transition-all text-center min-h-[50px] flex items-center justify-center">
                {activeBarIdx !== null && chartData[activeBarIdx] ? (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">{chartData[activeBarIdx].label}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">
                      {language === 'MM' ? 'စုစုပေါင်း ဝန်ဆောင်ခ' : 'Fees'}: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{f(chartData[activeBarIdx].fees)}</span> 
                      <span className="text-[9px] font-medium text-slate-400 ml-1">({chartData[activeBarIdx].count} Tx)</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                    {language === 'MM' ? 'အသေးစိတ်ကြည့်ရန် တိုင်များအား နှိပ်ပါ' : 'Tap any bar for details'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <PieChart size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
            {language === 'MM' ? 'ငွေပေးချေမှုစနစ်အလိုက် ခွဲခြမ်းစိတ်ဖြာချက်' : 'Breakdown by Payment Method'}
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          {Object.entries(stats.byCategory).length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays className="mx-auto text-slate-200 mb-2" size={40} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {language === 'MM' ? 'ရွေးချယ်ထားသောကာလအတွင်း အချက်အလက် မရှိပါ' : 'No data available for this period'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Interactive Donut / Pie Chart Visualizer */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50/60 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 min-h-[260px]">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 160 160" 
                    className="transform -rotate-90 select-none"
                  >
                    {/* Ring placeholder backing */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="60" 
                      fill="transparent" 
                      stroke="#f1f5f9" 
                      className="stroke-slate-100 dark:stroke-slate-800/50"
                      strokeWidth="11"
                    />

                    {pieData.map((item, idx) => {
                      const brand = getBrandColor(item.category);
                      const isHovered = hoveredIdx === idx;
                      const strokeWidth = isHovered ? 16 : 10;
                      const r = 60;
                      const circ = 2 * Math.PI * r;
                      
                      return (
                        <motion.circle 
                          key={item.category}
                          cx="80" 
                          cy="80" 
                          r={r} 
                          fill="transparent" 
                          stroke={brand.stroke}
                          strokeWidth={strokeWidth}
                          strokeDasharray={`${item.percent * circ} ${circ}`}
                          strokeDashoffset={-item.startPercent * circ}
                          strokeLinecap="round"
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          className="cursor-pointer transition-[stroke-width] duration-200"
                          style={{
                            transformOrigin: 'center',
                          }}
                          animate={{
                            scale: isHovered ? 1.04 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                        />
                      );
                    })}
                  </svg>

                  {/* Centered contextual stats readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                    {hoveredIdx === null ? (
                      <>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {language === 'MM' ? 'စုစုပေါင်း ဝန်ဆောင်ခ' : 'Total Fees'}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {f(stats.totalFees)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-[9.5px] font-black uppercase tracking-wider ${getBrandColor(pieData[hoveredIdx].category).text}`}>
                          {getCategoryLabel(pieData[hoveredIdx].category)}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {f(pieData[hoveredIdx].value)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          {((pieData[hoveredIdx].percent) * 100).toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Ledger Cards (Legend with synchronized hover binding) */}
              <div className="lg:col-span-7 space-y-2.5 sm:space-y-3">
                {Object.entries(stats.byCategory).sort((a: any, b: any) => b[1].fees - a[1].fees).map(([cat, data]: [string, any], i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={cat} 
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`group p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer ${
                      hoveredIdx === i 
                        ? 'bg-slate-100/80 dark:bg-slate-800/60 border-indigo-200 dark:border-indigo-900/40 shadow-sm' 
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getBrandColor(cat).stroke }} />
                        <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                          {getCategoryLabel(cat)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{f(data.fees)}</p>
                        <p className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-400">Avg: {((data.fees / data.amount) * 100 || 0).toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1 sm:h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${(data.fees / stats.totalFees) * 100}%`,
                          backgroundColor: getBrandColor(cat).stroke 
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
