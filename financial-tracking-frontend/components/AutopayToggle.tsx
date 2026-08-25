import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import ExceptionManagerModal from './ExceptionManagerModal';

interface AutopayToggleProps {
  ignoreAutopay: boolean;
  onToggle: (value: boolean) => void;
  onUpdate?: () => void;
}

export default function AutopayToggle({ ignoreAutopay, onToggle, onUpdate }: AutopayToggleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center">
        <button
          onClick={() => onToggle(!ignoreAutopay)}
          className={`flex items-center gap-2 px-3 py-2 rounded-l-lg border text-xs font-medium transition-colors h-[38px] ${
            ignoreAutopay 
            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' 
            : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-50'
          }`}
          title={ignoreAutopay ? "Showing all but Autopayments" : "Showing all transactions"}
        >
          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
            ignoreAutopay ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-zinc-300'
          }`}>
            {ignoreAutopay && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          Ignore Autopay
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-2 py-2 rounded-r-lg border-y border-r text-xs font-medium transition-colors h-[38px] flex items-center justify-center ${
            ignoreAutopay 
            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
            : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-50'
          }`}
          title="Manage Exceptions"
        >
          <Settings size={14} />
        </button>
      </div>

      {isModalOpen && (
        <ExceptionManagerModal 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
