import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface LogoUploadFieldProps {
  provider: 'kbz' | 'wave' | 'aya' | 'cash' | 'uab' | 'true';
  currentUrl: string;
  setUrl: (url: string) => void;
}

export default function LogoUploadField({ provider, currentUrl, setUrl }: LogoUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Image must be less than 1MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setUrl(base64Data);
      setUploading(false);
    };

    reader.onerror = () => {
      alert('Failed to read file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4 group">
      <div className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 flex-shrink-0 flex items-center justify-center relative">
        {currentUrl ? (
          <img src={currentUrl} alt="Logo" className="w-full h-full object-contain" />
        ) : (
          <ImageIcon size={20} className="text-slate-300 dark:text-slate-700" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
            <Loader2 size={16} className="text-indigo-500 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex-1 flex items-center gap-2">
        <label className="flex-1 h-11 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50 text-[10px] uppercase font-black tracking-widest relative overflow-hidden">
          {provider.toUpperCase()} Logo (Optional)
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        {currentUrl && (
          <button 
            type="button" 
            onClick={handleClearLogo}
            className="px-4 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-[10px] font-black uppercase"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
