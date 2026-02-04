import React, { useState, useEffect } from 'react';
import { Transaction, Category, Platform, ConsumptionObject } from '../types';
import { X, Save } from 'lucide-react';

interface EditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
}

const EditModal: React.FC<EditModalProps> = ({ transaction, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Transaction | null>(null);

  useEffect(() => {
    if (transaction) {
      setFormData({ 
          ...transaction,
          consumptionObject: transaction.consumptionObject || ConsumptionObject.Self,
          note: transaction.note || ''
      });
    }
  }, [transaction]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">编辑交易</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
            <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
                <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商户名称</label>
                <input
                type="text"
                required
                value={formData.merchant}
                onChange={e => setFormData({ ...formData, merchant: e.target.value })}
                className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">平台</label>
                <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value as Platform })}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                >
                    {Object.values(Platform).map(p => (
                    <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                >
                    {Object.values(Category).map(c => (
                    <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">消费对象</label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(ConsumptionObject).map(obj => (
                        <button
                            key={obj}
                            type="button"
                            onClick={() => setFormData({ ...formData, consumptionObject: obj })}
                            className={`text-xs py-2 px-1 rounded border text-center transition-colors ${
                                formData.consumptionObject === obj
                                    ? 'bg-brand-50 border-brand-500 text-brand-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {obj}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                    value={formData.note || ''}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                    placeholder="如：黑色 M 码..."
                />
            </div>

            </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              form="edit-form"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-1.5" />
              保存
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
