import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  UserCircle, 
  Mail, 
  Calendar,
  ChevronRight,
  Database,
  BarChart4,
  ImageIcon,
  Save
} from 'lucide-react';
import { getAllUsers, updateUserActivation, getAllGlobalTransactions, getGlobalSettings, saveGlobalSettings } from '../services/transactionService';
import { motion } from 'motion/react';
import FinancialReports from './FinancialReports';
import LogoUploadField from './LogoUploadField';
import { Transaction, GlobalSettings } from '../types';

interface AdminPanelProps {
  language: 'MM' | 'EN';
  globalSettings: GlobalSettings;
  onUpdateGlobalSettings: (settings: GlobalSettings) => void;
}

export default function AdminPanel({ language, globalSettings: initialGlobalSettings, onUpdateGlobalSettings }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [globalSettings, setLocalGlobalSettings] = useState<GlobalSettings>(initialGlobalSettings || {});
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    setLocalGlobalSettings(initialGlobalSettings || {});
  }, [initialGlobalSettings]);

  const fetchUsersAndSettings = async () => {
    setLoading(true);
    const userData = await getAllUsers();
    setUsers(userData);
    
    // We already have global settings correctly passed, but can refresh if needed.
    // Const settings = await getGlobalSettings();
    // setLocalGlobalSettings(settings || {});
    
    setLoading(false);
  };


  useEffect(() => {
    fetchUsersAndSettings();
  }, []);

  const handleToggleActive = async (uid: string, currentActive: boolean) => {
    await updateUserActivation(uid, !currentActive);
    setUsers(users.map(u => u.uid === uid ? { ...u, active: !currentActive } : u));
  };
  
  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      
      // Remove undefined values
      const cleanSettings = { ...globalSettings };
      Object.keys(cleanSettings).forEach(key => {
        if ((cleanSettings as any)[key] === undefined) {
          delete (cleanSettings as any)[key];
        }
      });

      await saveGlobalSettings(cleanSettings);
      onUpdateGlobalSettings(cleanSettings);
      alert('Global settings saved successfully.');
    } catch (err: any) {
      console.error(err);
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">စုစုပေါင်း User</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</h4>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ခွင့်ပြုပြီး User</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {users.filter(u => u.active).length}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">မခွင့်ပြုရသေးသူ</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {users.filter(u => !u.active).length}
            </h4>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
            <Database size={16} className="text-indigo-500" />
            User Access Control
          </h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Last Activity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.uid} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                        {u.photoURL ? <img src={u.photoURL} alt="" /> : <UserCircle size={20} className="text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{u.displayName}</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                          <Mail size={10} /> {u.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">UID:</span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 select-all border-b border-dashed border-slate-200 dark:border-slate-800 pb-0.5">
                            {u.uid}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      u.active 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar size={12} />
                      <span className="text-xs font-medium">
                        {u.lastLogin?.toDate ? u.lastLogin.toDate().toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleActive(u.uid, !!u.active)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        u.active 
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white' 
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {u.active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Database className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Global Settings */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
            <ImageIcon size={16} className="text-indigo-500" />
            Global App Settings
          </h3>
          <button
            onClick={handleSaveSettings}
            disabled={settingsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Save size={14} />
            {settingsLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LogoUploadField 
            provider="kbz" 
            currentUrl={globalSettings.kbzLogoUrl || ''} 
            setUrl={(url) => setLocalGlobalSettings(prev => ({ ...prev, kbzLogoUrl: url }))} 
          />
          <LogoUploadField 
            provider="wave" 
            currentUrl={globalSettings.waveLogoUrl || ''} 
            setUrl={(url) => setLocalGlobalSettings(prev => ({ ...prev, waveLogoUrl: url }))} 
          />
          <LogoUploadField 
            provider="aya" 
            currentUrl={globalSettings.ayaLogoUrl || ''} 
            setUrl={(url) => setLocalGlobalSettings(prev => ({ ...prev, ayaLogoUrl: url }))} 
          />
          <LogoUploadField 
            provider="uab" 
            currentUrl={globalSettings.uabLogoUrl || ''} 
            setUrl={(url) => setLocalGlobalSettings(prev => ({ ...prev, uabLogoUrl: url }))} 
          />
          <LogoUploadField 
            provider="true" 
            currentUrl={globalSettings.trueLogoUrl || ''} 
            setUrl={(url) => setLocalGlobalSettings(prev => ({ ...prev, trueLogoUrl: url }))} 
          />
          <LogoUploadField 
            provider="cash" 
            currentUrl={globalSettings.cashLogoUrl || ''} 
            setUrl={(url) => setLocalGlobalSettings(prev => ({ ...prev, cashLogoUrl: url }))} 
          />
        </div>

        {/* Admin Contact Information for Purchase/Activation */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-widest text-[#1e293b] dark:text-slate-300 flex items-center gap-2">
            <Mail size={14} className="text-indigo-500" />
            Admin Contact & Purchase Option Configuration
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
            Configure contact details and instructions displayed on the "Access Denied" screen for users without premium access.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Facebook Messenger ID / URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. user123"
                  value={globalSettings.adminMessenger || ''}
                  onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, adminMessenger: e.target.value }))}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <label className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors flex-shrink-0 relative overflow-hidden">
                  {globalSettings.messengerIconUrl ? (
                    <img src={globalSettings.messengerIconUrl} className="w-6 h-6 object-contain" alt="" />
                  ) : (
                    <ImageIcon size={18} className="text-slate-400" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setLocalGlobalSettings(prev => ({ ...prev, messengerIconUrl: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Telegram Username / Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. admin_username"
                  value={globalSettings.adminTelegram || ''}
                  onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, adminTelegram: e.target.value }))}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <label className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors flex-shrink-0 relative overflow-hidden">
                  {globalSettings.telegramIconUrl ? (
                    <img src={globalSettings.telegramIconUrl} className="w-6 h-6 object-contain" alt="" />
                  ) : (
                    <ImageIcon size={18} className="text-slate-400" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setLocalGlobalSettings(prev => ({ ...prev, telegramIconUrl: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Viber Number / Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 09789789789"
                  value={globalSettings.adminViber || ''}
                  onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, adminViber: e.target.value }))}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <label className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors flex-shrink-0 relative overflow-hidden">
                  {globalSettings.viberIconUrl ? (
                    <img src={globalSettings.viberIconUrl} className="w-6 h-6 object-contain" alt="" />
                  ) : (
                    <ImageIcon size={18} className="text-slate-400" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setLocalGlobalSettings(prev => ({ ...prev, viberIconUrl: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Contact Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 09789789789"
                value={globalSettings.adminPhone || ''}
                onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, adminPhone: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Purchase Instructions (Myanmar text)</label>
              <textarea
                placeholder="ဥပမာ- ဤစနစ်ကို တရားဝင်အပြည့်အစုံဝယ်ယူလိုပါက အောက်ပါ Admin ထံသို့ တိုက်ရိုက်ဆက်သွယ် မေးမြန်းဝယ်ယူနိုင်ပါသည်။"
                value={globalSettings.adminContactNoteMM || ''}
                rows={3}
                onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, adminContactNoteMM: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Purchase Instructions (English Alternate)</label>
              <textarea
                placeholder="e.g. Please contact the administrator below to subscribe or buy full access to this ledger tool."
                value={globalSettings.adminContactNote || ''}
                rows={2}
                onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, adminContactNote: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">Restricted Access Logo (App Branding)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                  {globalSettings.restrictedLogoUrl ? (
                    <img src={globalSettings.restrictedLogoUrl} alt="Restricted Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-20">
                      <ImageIcon size={24} className="text-slate-400" />
                      <span className="text-[8px] font-bold uppercase">No Logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1 h-10 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer text-[10px] uppercase font-black tracking-widest">
                      Upload Branding Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) return alert("Logo must be less than 2MB");
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLocalGlobalSettings(prev => ({ ...prev, restrictedLogoUrl: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {globalSettings.restrictedLogoUrl && (
                      <button 
                        onClick={() => setLocalGlobalSettings(prev => ({ ...prev, restrictedLogoUrl: '' }))}
                        className="px-4 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-[10px] font-black uppercase"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">This logo will appear at the top of the Access Denied and Activation screens.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">Master Activation Code (Self-Service)</label>
              <input
                type="text"
                placeholder="Set a code users can enter to activate themselves"
                value={globalSettings.masterActivationCode || ''}
                onChange={(e) => setLocalGlobalSettings(prev => ({ ...prev, masterActivationCode: e.target.value }))}
                className="w-full px-4 py-2.5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
              <p className="text-[10px] text-slate-500 font-medium">Leave empty to disable self-service activation via code.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
