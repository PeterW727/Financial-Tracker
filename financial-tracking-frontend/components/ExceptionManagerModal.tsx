import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Info, Shield, ShieldAlert, Settings, HelpCircle } from 'lucide-react';
import { Exception } from '@/lib/types';
import { fetchExceptions, saveException, deleteException, updateException } from '@/lib/api';

interface ExceptionManagerModalProps {
  onClose: () => void;
  onUpdate?: () => void;
}

type RuleType = 'EXACT' | 'CONTAINS' | 'CONTAINS_IGNORE_CASE' | 'STARTS_WITH' | 'ENDS_WITH';

export default function ExceptionManagerModal({ onClose, onUpdate }: ExceptionManagerModalProps) {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'default' | 'advanced'>('default');
  
  // New Exception Form State
  const [newName, setNewName] = useState('');
  const [ruleType, setRuleType] = useState<RuleType>('CONTAINS_IGNORE_CASE');
  const [ruleValue, setRuleValue] = useState('');
  const [advancedRegex, setAdvancedRegex] = useState('');

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const data = await fetchExceptions();
      setExceptions(data);
    } catch (err) {
      console.error('Failed to fetch exceptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExceptions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exception rule?')) return;
    try {
      await deleteException(id);
      loadExceptions();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to delete exception', err);
      alert('Failed to delete exception');
    }
  };

  const ruleTypeToRegex = (type: RuleType, value: string): string => {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    switch (type) {
      case 'EXACT': return `^${escaped}$`;
      case 'CONTAINS': return escaped;
      case 'CONTAINS_IGNORE_CASE': return `(?i)${escaped}`;
      case 'STARTS_WITH': return `^${escaped}`;
      case 'ENDS_WITH': return `${escaped}$`;
      default: return escaped;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      alert('Please provide a name for the exception');
      return;
    }

    const regexRule = activeTab === 'default' 
      ? ruleTypeToRegex(ruleType, ruleValue)
      : advancedRegex;

    if (!regexRule) {
      alert('Please provide a rule');
      return;
    }

    try {
      await saveException({
        exceptionName: newName,
        regexRule: regexRule
      });
      setIsAdding(false);
      setNewName('');
      setRuleValue('');
      setAdvancedRegex('');
      loadExceptions();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to save exception', err);
      alert('Failed to save exception');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[85vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Settings className="text-blue-500" size={24} />
              Manage Autopay Exceptions
              <div className="group relative">
                <HelpCircle size={18} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help transition-colors" />
                <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 bg-zinc-800 dark:bg-zinc-700 text-white text-xs font-normal rounded-xl shadow-xl border border-zinc-700 dark:border-zinc-600 z-[70] transition-all opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                  <p className="leading-relaxed">
                    Create rules for transactions you want to ignore. This is typically used for autopayments that inflate spending totals or cause discrepancies in your budget. Use the Default tab for simple matching, or the Advanced tab for custom regex control.
                  </p>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-800 dark:bg-zinc-700 rotate-45 border-t border-l border-zinc-700 dark:border-zinc-600"></div>
                </div>
              </div>
            </h3>
            <p className="text-sm text-zinc-500">Define rules for transactions that should be ignored</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isAdding ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Rule Name</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Amex Autopay"
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('default')}
                      className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'default' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('advanced')}
                      className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'advanced' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>

                {activeTab === 'default' ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Match Type</label>
                      <select 
                        value={ruleType}
                        onChange={(e) => setRuleType(e.target.value as RuleType)}
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="EXACT">Exact word match</option>
                        <option value="CONTAINS">Contains the word (case sensitive)</option>
                        <option value="CONTAINS_IGNORE_CASE">Contains the word (case insensitive)</option>
                        <option value="STARTS_WITH">Starts with</option>
                        <option value="ENDS_WITH">Ends with</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Word / Phrase</label>
                      <input 
                        type="text"
                        value={ruleValue}
                        onChange={(e) => setRuleValue(e.target.value)}
                        placeholder="Enter text to match"
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Regex Expression</label>
                      <textarea 
                        value={advancedRegex}
                        onChange={(e) => setAdvancedRegex(e.target.value)}
                        placeholder="^AUTOPAY.*$"
                        rows={3}
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                      <p className="mt-2 text-xs text-zinc-500 flex items-start gap-1.5">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        Use standard regex syntax. For case-insensitivity, prefix with (?i) 
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Create Rule
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Existing Rules</h4>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <Plus size={16} />
                  Add Rule
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-zinc-500">Loading rules...</div>
              ) : exceptions.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                  <ShieldAlert size={32} className="mx-auto mb-3 text-zinc-300" />
                  <p className="text-zinc-500">No exception rules defined yet.</p>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Create your first rule
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {exceptions.map((ex) => (
                    <div 
                      key={ex.exceptionId}
                      className="group flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{ex.exceptionName}</p>
                          <p className="text-xs text-zinc-500 font-mono truncate max-w-[300px]">{ex.regexRule}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => ex.exceptionId && handleDelete(ex.exceptionId)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Rule"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!isAdding && (
          <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
