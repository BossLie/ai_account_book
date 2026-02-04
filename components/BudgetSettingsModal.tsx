import React, { useState, useEffect } from 'react';
import { Category, Budget } from '../types';
import { X, Save, PiggyBank } from 'lucide-react';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudgets: Budget[];
  onSave: (budgets: Budget[]) => void;
}

const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({ isOpen, onClose, currentBudgets, onSave }) => {
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      currentBudgets.forEach(b => {
        initial[b.category] = b.limit;
      });
      setLocalBudgets(initial);
    }
  }, [isOpen, currentBudgets]);

  if (!isOpen) return null;

  const handleInputChange = (category: string, value: string) => {
    const num = parseFloat(value);
    setLocalBudgets(prev => ({
      ...prev,
      [category]: isNaN(num) ? 0 : num
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudgets: Budget[] = Object.entries(localBudgets)
      .filter(([_, limit]) => limit > 0)
      .map(([category, limit]) => ({
        category: category as Category,
        limit
      }));
    onSave(newBudgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-semibold text-gray-800">设置月度预算</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-4">为每个分类设置每月支出限额。设置为 0 则不启用该分类的预算监控。</p>
          <form id="budget-form" onSubmit={handleSubmit} className="space-y-3">
            {Object.values(Category).map((category) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <label className="font-medium text-gray-700">{category}</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2 text-sm">¥</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={localBudgets[category] || ''}
                    onChange={(e) => handleInputChange(category, e.target.value)}
                    className="w-32 rounded-md border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500 text-right"
                  />
                </div>
              </div>
            ))}
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            form="budget-form"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettingsModal;
