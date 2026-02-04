import React, { useMemo } from 'react';
import { Transaction, Budget, Category } from '../types';
import { AlertTriangle, CheckCircle2, TrendingUp, PiggyBank } from 'lucide-react';

interface BudgetOverviewProps {
  transactions: Transaction[];
  budgets: Budget[];
  onOpenSettings: () => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ transactions, budgets, onOpenSettings }) => {
  const budgetStats = useMemo(() => {
    // Get current month YYYY-MM
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthExpenses = transactions
      .filter(t => t.date.startsWith(currentMonthPrefix))
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return budgets.map(b => {
      const spent = currentMonthExpenses[b.category] || 0;
      const percentage = (spent / b.limit) * 100;
      return {
        ...b,
        spent,
        percentage
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by highest usage percentage
  }, [transactions, budgets]);

  if (budgets.length === 0) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-800 font-semibold flex items-center">
                    <PiggyBank className="w-5 h-5 mr-2 text-brand-600" />
                    本月预算
                </h3>
                <button onClick={onOpenSettings} className="text-sm text-brand-600 hover:underline">
                    设置预算
                </button>
            </div>
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p>暂未设置预算</p>
                <button onClick={onOpenSettings} className="mt-2 text-sm bg-white border border-gray-300 px-3 py-1 rounded shadow-sm hover:bg-gray-50">
                    立即设置
                </button>
            </div>
        </div>
    );
  }

  // Find alerts
  const alerts = budgetStats.filter(b => b.percentage >= 80);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 font-semibold flex items-center">
            <PiggyBank className="w-5 h-5 mr-2 text-brand-600" />
            本月预算监控
        </h3>
        <button onClick={onOpenSettings} className="text-sm text-brand-600 hover:underline font-medium">
            调整预算
        </button>
      </div>

      {alerts.length > 0 && (
          <div className="mb-4 space-y-2">
              {alerts.map(item => (
                  <div key={item.category} className={`text-sm p-3 rounded-md flex items-start space-x-2 ${item.percentage >= 100 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                          <span className="font-bold">{item.category}</span>
                          {item.percentage >= 100 ? ' 已超支！' : ' 即将超支！'}
                          <span className="opacity-90">
                              (已用 {item.percentage.toFixed(0)}%)
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <div className="space-y-4">
        {budgetStats.map((item) => {
            let colorClass = 'bg-green-500';
            if (item.percentage >= 100) colorClass = 'bg-red-500';
            else if (item.percentage >= 80) colorClass = 'bg-yellow-500';

            return (
                <div key={item.category}>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <div className="text-xs text-gray-500">
                            <span className={`font-semibold ${item.percentage >= 100 ? 'text-red-600' : 'text-gray-900'}`}>¥{item.spent.toFixed(0)}</span>
                            <span className="mx-1">/</span>
                            <span>¥{item.limit.toFixed(0)}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`} 
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default BudgetOverview;
