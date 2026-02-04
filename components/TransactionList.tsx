import React from 'react';
import { Transaction, Category, ConsumptionObject } from '../types';
import { Trash2, Edit2, Utensils, Car, Shirt, Plane, BookOpen, Gift, Heart, Stethoscope, TrendingDown, Zap, ShoppingBag, HelpCircle, User, Users, Baby, HandHeart } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const CategoryIcon: React.FC<{ category: Category }> = ({ category }) => {
    switch (category) {
        case Category.Food: return <Utensils className="w-5 h-5 text-orange-500" />;
        case Category.Transport: return <Car className="w-5 h-5 text-green-500" />;
        case Category.Clothing: return <Shirt className="w-5 h-5 text-pink-500" />;
        case Category.HobbiesTravel: return <Plane className="w-5 h-5 text-blue-500" />;
        case Category.Education: return <BookOpen className="w-5 h-5 text-indigo-500" />;
        case Category.Social: return <Gift className="w-5 h-5 text-red-500" />;
        case Category.Elders: return <Heart className="w-5 h-5 text-rose-600" />;
        case Category.Medical: return <Stethoscope className="w-5 h-5 text-teal-500" />;
        case Category.InvestmentLoss: return <TrendingDown className="w-5 h-5 text-gray-500" />;
        case Category.Services: return <Zap className="w-5 h-5 text-yellow-500" />;
        case Category.DailySupplies: return <ShoppingBag className="w-5 h-5 text-cyan-500" />;
        default: return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
}

const ObjectBadge: React.FC<{ obj: ConsumptionObject }> = ({ obj }) => {
    let color = "bg-gray-100 text-gray-600";
    let icon = <User className="w-3 h-3 mr-1" />;

    switch (obj) {
        case ConsumptionObject.Self: color = "bg-blue-50 text-blue-600 border-blue-100"; break;
        case ConsumptionObject.Husband: color = "bg-indigo-50 text-indigo-600 border-indigo-100"; icon=<User className="w-3 h-3 mr-1" />; break;
        case ConsumptionObject.Daughter: color = "bg-pink-50 text-pink-600 border-pink-100"; icon=<Baby className="w-3 h-3 mr-1" />; break;
        case ConsumptionObject.Parents: color = "bg-orange-50 text-orange-600 border-orange-100"; icon=<Heart className="w-3 h-3 mr-1" />; break;
        case ConsumptionObject.Friends: color = "bg-purple-50 text-purple-600 border-purple-100"; icon=<Users className="w-3 h-3 mr-1" />; break;
        case ConsumptionObject.Others: color = "bg-gray-100 text-gray-600 border-gray-200"; icon=<HandHeart className="w-3 h-3 mr-1" />; break;
    }

    return (
        <span className={`flex items-center text-xs px-2 py-0.5 rounded-full border ${color}`}>
            {icon} {obj}
        </span>
    );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  if (transactions.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">暂无数据，请上传截图进行分析</p>
        </div>
    )
  }

  // Sort by date desc
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">记账明细 ({transactions.length})</h3>
        <span className="text-sm text-gray-500">总计: <span className="font-bold text-gray-900">¥{transactions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</span></span>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {sorted.map((t) => (
          <div key={t.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-full mt-1 flex-shrink-0">
                <CategoryIcon category={t.category} />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <p className="font-medium text-gray-900 truncate mr-1">{t.description || t.merchant}</p>
                    <ObjectBadge obj={t.consumptionObject || ConsumptionObject.Self} />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">{t.platform}</span>
                </div>
                
                <div className="flex text-xs text-gray-500 mt-1 space-x-2 items-center">
                  <span>{t.date}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="truncate max-w-[120px]">{t.merchant}</span>
                </div>

                {t.note && (
                    <div className="mt-1.5 text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded inline-block max-w-full truncate border border-yellow-100">
                        备注: {t.note}
                    </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <span className="font-bold text-gray-900 mr-2 whitespace-nowrap">¥{t.amount.toFixed(2)}</span>
              
              <button 
                onClick={() => onEdit(t)}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => onDelete(t.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
