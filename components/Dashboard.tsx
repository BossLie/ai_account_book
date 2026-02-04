import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, Category } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      const current = map.get(t.category) || 0;
      map.set(t.category, current + t.amount);
    });
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    // Get last 7 days range or based on transaction range
    transactions.forEach(t => {
      const current = map.get(t.date) || 0;
      map.set(t.date, current + t.amount);
    });
    return Array.from(map.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Category Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-800 font-semibold mb-4">支出分类占比</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-gray-600">
            {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span>{entry.name}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Daily Trend Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-800 font-semibold mb-4">每日支出趋势</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10}} 
                tickFormatter={(val) => val.slice(5)} // Show MM-DD
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10}} 
                width={30}
              />
              <ReTooltip 
                cursor={{fill: '#f8fafc'}}
                formatter={(value: number) => [`¥${value.toFixed(2)}`, '支出']}
              />
              <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
