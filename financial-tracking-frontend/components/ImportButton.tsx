'use client';

import { useState, useRef, ReactNode } from 'react';
import { ChevronDown, Upload, CreditCard, Wallet, Landmark, Loader2 } from 'lucide-react';
import { uploadAmex, uploadChase } from '@/lib/api';

interface ImportButtonProps {
  onUploadSuccess: () => void;
}

export default function ImportButton({ onUploadSuccess }: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<'AMEX' | 'CHASE' | 'VENMO' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const institutions = [
    { key: 'AMEX' as const, name: 'Amex', icon: <Landmark size={16} className="text-blue-500" /> },
    { key: 'CHASE' as const, name: 'Chase', icon: <CreditCard size={16} className="text-blue-700" /> },
    { key: 'VENMO' as const, name: 'Venmo', icon: <Wallet size={16} className="text-blue-400" />, disabled: true },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedInstitution) return;

    // Validate file type based on institution
    if (selectedInstitution === 'CHASE') {
      const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
      if (!isCsv) {
        alert('Please select a .csv file for Chase uploads.');
        e.target.value = '';
        return;
      }
    }

    setIsUploading(true);
    try {
      if (selectedInstitution === 'AMEX') {
        await uploadAmex(file);
      } else if (selectedInstitution === 'CHASE') {
        await uploadChase(file);
      } else {
        throw new Error('Unsupported institution');
      }
      onUploadSuccess();
      alert('Transactions uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload transactions. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedInstitution(null);
      setIsOpen(false);
    }
  };

  const handleOptionClick = (inst: { key: 'AMEX' | 'CHASE' | 'VENMO'; name: string; icon: ReactNode; disabled?: boolean }) => {
    if (inst.disabled) return;
    setSelectedInstitution(inst.key);
    fileInputRef.current?.click();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUploading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
      >
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        Import
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black ring-opacity-5 border border-zinc-200 dark:border-zinc-800 z-30 py-1 overflow-hidden"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Select Institution
            </div>
            {institutions.map((inst) => (
              <button
                key={inst.name}
                onClick={() => handleOptionClick(inst)}
                disabled={!!inst.disabled}
                title={inst.disabled ? 'Coming soon' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  inst.disabled
                    ? 'text-zinc-400 cursor-not-allowed'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex-shrink-0">
                  {inst.icon}
                </div>
                <span className="font-medium">{inst.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={selectedInstitution === 'CHASE' ? '.csv,text/csv' : '.xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'}
      />
    </div>
  );
}
