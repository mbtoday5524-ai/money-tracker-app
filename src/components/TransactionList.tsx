import React, { useState, useMemo } from 'react';
import { Trash2, Download, Tag, Calendar, User, ArrowRightLeft, History, Wallet, FileText, Search, Filter, X, ChevronDown, Banknote } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { KBZLogo, WaveLogo, AYALogo, CashLogo, UABLogo, TrueLogo } from './Logos';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  language: 'MM' | 'EN';
  kbzLogoUrl?: string;
  waveLogoUrl?: string;
  ayaLogoUrl?: string;
  cashLogoUrl?: string;
  uabLogoUrl?: string;
  trueLogoUrl?: string;
}

export default function TransactionList({ 
  transactions, 
  onDelete, 
  language,
  kbzLogoUrl,
  waveLogoUrl,
  ayaLogoUrl,
  cashLogoUrl,
  uabLogoUrl,
  trueLogoUrl
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBankId, setFilterBankId] = useState<string | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterFeeMethod, setFilterFeeMethod] = useState<'ALL' | 'Cash' | 'Wallet'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const f = (n: number) => n.toLocaleString();

  const getBankName = (categoryId: string) => {
    switch(categoryId) {
        case 'KBZ': return 'KPay';
        case 'Wave': return 'Wave';
        case 'AYAPay': return 'AYAPay';
        default: return categoryId;
    }
  };

  const banks = [
    { id: 'KBZ', name: 'KPay', logoUrl: kbzLogoUrl },
    { id: 'Wave', name: 'Wave', logoUrl: waveLogoUrl },
    { id: 'AYAPay', name: 'AYAPay', logoUrl: ayaLogoUrl },
    { id: 'UABPay', name: 'UAB Pay', logoUrl: uabLogoUrl },
    { id: 'TrueMoney', name: 'True Money', logoUrl: trueLogoUrl },
    { id: 'Cash', name: 'Cash', logoUrl: cashLogoUrl },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = searchTerm === '' || 
        tx.amount.toString().includes(searchTerm) || 
        tx.fee.toString().includes(searchTerm) ||
        (getBankName(tx.category).toLowerCase()).includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterBankId === 'ALL' || tx.category === filterBankId;
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      
      const matchesFeeMethod = filterFeeMethod === 'ALL' ||
        (filterFeeMethod === 'Wallet' && tx.feePaymentMethod === 'Wallet') ||
        (filterFeeMethod === 'Cash' && tx.feePaymentMethod !== 'Wallet');

      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = tx.date >= startDate && tx.date <= endDate;
      } else if (startDate) {
        matchesDate = tx.date >= startDate;
      } else if (endDate) {
        matchesDate = tx.date <= endDate;
      }

      return matchesSearch && matchesCategory && matchesType && matchesFeeMethod && matchesDate;
    });
  }, [transactions, searchTerm, filterBankId, filterType, filterFeeMethod, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBankId('ALL');
    setFilterType('ALL');
    setFilterFeeMethod('ALL');
    setStartDate('');
    setEndDate('');
  };

  const getLogo = (bankId: string) => {
    switch(bankId) {
        case 'KBZ': return kbzLogoUrl;
        case 'Wave': return waveLogoUrl;
        case 'AYAPay': return ayaLogoUrl;
        case 'UABPay': return uabLogoUrl;
        case 'TrueMoney': return trueLogoUrl;
        default: return cashLogoUrl;
    }
  };

  const getDefaultLogo = (bankId: string) => {
    const name = bankId.toLowerCase();
    if (name.includes('kbz')) return KBZLogo;
    if (name.includes('wave')) return WaveLogo;
    if (name.includes('aya')) return AYALogo;
    if (name.includes('uab')) return UABLogo;
    if (name.includes('true')) return TrueLogo;
    return CashLogo;
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Date', 'Account', 'Type', 'Amount', 'Fee', 'Phone', 'Timestamp'];
    const rows = filteredTransactions.map(tx => [
      tx.date,
      tx.category,
      tx.type === TransactionType.IN ? 'Deposit' : 'Withdraw',
      tx.amount,
      tx.fee,
      tx.phoneNumber || '',
      tx.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `money_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) return;

    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('Z Money Tracker Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Enterprise Ledger POS Service Edition`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
    
    // Horizontal line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);

    const tableColumn = ["ID", "Date", "Account", "Type", "Amount", "Fee", "Phone"];
    const tableRows = filteredTransactions.map(tx => [
      `TX-${tx.id?.slice(0, 6).toUpperCase()}`,
      tx.date,
      tx.category,
      tx.type === TransactionType.IN ? 'Deposit' : 'Withdraw',
      f(tx.amount),
      f(tx.fee),
      tx.phoneNumber || '-'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'striped',
      headStyles: { 
        fillColor: [79, 70, 229], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        font: 'helvetica'
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        const str = `Page ${data.pageNumber}`;
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`money_tracker_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 sleek-shadow flex flex-col overflow-hidden h-full transition-colors">
      <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-[#0f172a] transition-colors">
        <div className="space-y-0.5 lg:space-y-1">
          <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-sm lg:text-base font-display">{language === 'MM' ? 'နောက်ဆုံးမှတ်တမ်းများ' : 'Recent Transactions'}</h3>
          <p className="text-[9px] lg:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-display">{language === 'MM' ? 'နောက်ဆုံးပြုလုပ်ခဲ့သောစာရင်းများ' : 'Latest wallet activity'}</p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border ${
              showFilters 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter size={14} />
            <span>{language === 'MM' ? 'စစ်ထုတ်ရန်' : 'Filters'}</span>
            {(filterBankId !== 'ALL' || filterType !== 'ALL' || filterFeeMethod !== 'ALL' || startDate || endDate) && (
              <span className="w-2 h-2 bg-rose-500 rounded-full ml-1"></span>
            )}
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
            disabled={filteredTransactions.length === 0}
          >
            <FileText size={14} />
            <span>{language === 'MM' ? 'PDF' : 'PDF'}</span>
          </button>
          
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
            disabled={filteredTransactions.length === 0}
          >
            <Download size={14} />
            <span>{language === 'MM' ? 'CSV' : 'CSV'}</span>
          </button>
          
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800 ml-1"></div>
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest hidden sm:inline ml-1">
            {language === 'MM' ? `စုစုပေါင်း ${filteredTransactions.length} ခု` : `${filteredTransactions.length} Entries`}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      {showFilters && (
        <div className="px-4 lg:px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 transition-all animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={language === 'MM' ? 'ပမာဏဖြင့် ရှာရန်...' : 'Search amount or fee...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                value={filterBankId}
                onChange={(e) => setFilterBankId(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="ALL">{language === 'MM' ? 'အကောင့်အားလုံး' : 'All Accounts'}</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <ArrowRightLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="ALL">{language === 'MM' ? 'အမျိုးအစားအားလုံး' : 'All Types'}</option>
                <option value={TransactionType.IN}>{language === 'MM' ? 'ငွေသွင်း' : 'Deposit'}</option>
                <option value={TransactionType.OUT}>{language === 'MM' ? 'ငွေထုတ်' : 'Withdraw'}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            </div>

            {/* Fee Payment Method Filter */}
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                value={filterFeeMethod}
                onChange={(e) => setFilterFeeMethod(e.target.value as any)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="ALL">{language === 'MM' ? 'ဝန်ဆောင်ခပေးစနစ်အားလုံး' : 'All Fee Methods'}</option>
                <option value="Cash">{language === 'MM' ? 'လက်ငင်း (Cash)' : 'Cash'}</option>
                <option value="Wallet">{language === 'MM' ? 'ဝေါလတ်ထဲမှ (Wallet)' : 'Wallet'}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={clearFilters}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                title="Clear Filters"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-auto scrollbar-hide flex-1">
        {/* Desktop Table */}
        <table className="w-full text-left hidden lg:table">
          <thead className="bg-[#4f46e5] text-white text-[10px] lg:text-[11px] uppercase font-black sticky top-0 z-10 transition-colors font-display tracking-[0.1em]">
            <tr>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'အမှတ်' : 'ID'}</th>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'ရက်စွဲ' : 'Date'}</th>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'အကောင့်' : 'Account'}</th>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'အမျိုးအစား' : 'Type'}</th>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'ပမာဏ' : 'Amount'}</th>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'ဝန်ဆောင်ခ' : 'Fee'}</th>
              <th className="px-8 py-4 tracking-wider text-center">{language === 'MM' ? 'ဖုန်းနံပါတ်' : 'Phone'}</th>
              <th className="px-4 py-4 w-12 text-center text-indigo-200">
                <Trash2 size={14} className="mx-auto opacity-50" />
              </th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-700 rounded-full">
                      <History size={24} />
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 font-bold text-xs uppercase tracking-widest">
                      {searchTerm || filterBankId !== 'ALL' || filterType !== 'ALL' || startDate || endDate
                        ? (language === 'MM' ? 'ရှာဖွေမှုရလဒ် မရှိပါ' : 'No matching results found')
                        : (language === 'MM' ? 'မှတ်တမ်း မရှိသေးပါ' : 'No transactions recorded yet')
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors group">
                  <td className="px-8 py-4 text-center">
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-tighter">
                      TX-{tx.id?.slice(0, 6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-4 font-bold text-slate-600 dark:text-slate-400 text-xs text-center">{tx.date}</td>
                  <td className="px-8 py-4 text-center">
                    <div className="inline-flex items-center gap-2.5 w-24 text-left">
                       <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm bg-slate-50 dark:bg-slate-800 shrink-0">
                         {getLogo(tx.category) ? (
                           <img src={getLogo(tx.category)} alt={tx.category} className="w-full h-full object-contain" />
                         ) : (
                           getDefaultLogo(tx.category)({ className: "w-full h-full" })
                         )}
                       </div>
                       <span className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-tight leading-none">{tx.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      tx.type === TransactionType.IN 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500' 
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-500'
                    }`}>
                      {tx.type === TransactionType.IN ? (language === 'MM' ? 'ငွေသွင်း' : 'Deposit') : (language === 'MM' ? 'ငွေထုတ်' : 'Withdraw')}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="font-black font-display text-slate-900 dark:text-white">
                      {f(tx.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="font-bold font-sans text-emerald-600 dark:text-emerald-400 text-sm">
                        {f(tx.fee)}
                      </span>
                      {tx.feePaymentMethod === 'Wallet' && (
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-normal bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                          {language === 'MM' ? 'ပေါင်းလွှဲ' : 'Wallet'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="font-extrabold font-display text-black dark:text-white text-[15px]">
                      {tx.phoneNumber || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => tx.id && onDelete(tx.id)}
                      className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile List View */}
        <div className="lg:hidden divide-y divide-slate-50 dark:divide-slate-800/50">
          {filteredTransactions.length === 0 ? (
            <div className="px-8 py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-700 transition-colors">
                  <History size={20} />
                </div>
                <p className="text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                  {searchTerm || filterBankId !== 'ALL' || filterType !== 'ALL' || startDate || endDate
                    ? (language === 'MM' ? 'ရှာဖွေမှုရလဒ် မရှိပါ' : 'No matching results found')
                    : (language === 'MM' ? 'မှတ်တမ်း မရှိသေးပါ' : 'No transactions yet')
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-2.5 sm:p-3 grid grid-cols-12 items-center gap-1.5 sm:gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                <div className="col-span-5 sm:col-span-5 flex items-center gap-1.5 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center p-1 overflow-hidden bg-slate-50 dark:bg-slate-800 transition-colors shrink-0">
                    {getLogo(tx.category) ? (
                      <img src={getLogo(tx.category)} alt={tx.category} className="w-full h-full object-contain" />
                    ) : (
                      getDefaultLogo(tx.category)({ className: "w-full h-full" })
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1 min-w-0">
                       <span className="font-black text-slate-900 dark:text-white text-[13px] sm:text-base font-display whitespace-nowrap leading-none">{f(tx.amount)}</span>
                       <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider font-display shrink-0 ${
                         tx.type === TransactionType.IN ? 'text-emerald-700 dark:text-emerald-500' : 'text-rose-700 dark:text-rose-500'
                       }`}>
                         {tx.type === TransactionType.IN ? (language === 'MM' ? 'သွင်း' : 'In') : (language === 'MM' ? 'ထုတ်' : 'Out')}
                       </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold font-display truncate">
                      <span className="shrink-0">{tx.date}</span>
                      <span className="opacity-45 shrink-0">•</span>
                      <span className="uppercase truncate">{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-3 flex items-center justify-center min-w-0">
                  {tx.phoneNumber ? (
                    <span className="text-[13px] sm:text-[15px] text-black dark:text-white font-extrabold font-mono tracking-tight whitespace-nowrap">
                      {tx.phoneNumber}
                    </span>
                  ) : null}
                </div>
                
                <div className="col-span-4 sm:col-span-4 flex items-center justify-end gap-1 sm:gap-2 min-w-0">
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 mb-0.5 leading-none">
                      <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest font-sans">{language === 'MM' ? 'ဝန်ဆောင်ခ' : 'fee'}</p>
                      {tx.feePaymentMethod === 'Wallet' && (
                        <span className="text-[7.5px] sm:text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-normal bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                          {language === 'MM' ? 'ပေါင်းလွှဲ' : 'Wallet'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-sans tracking-tight leading-none">{f(tx.fee)}</p>
                  </div>
                  <button
                    onClick={() => tx.id && onDelete(tx.id)}
                    className="p-1 sm:p-1.5 text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
