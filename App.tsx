import React, { useState, useEffect, useRef } from 'react';
import { Transaction, AnalysisState, Platform, Budget } from './types';
import { analyzeScreenshots } from './services/geminiService';
import FileUpload from './components/FileUpload';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import EditModal from './components/EditModal';
import BudgetSettingsModal from './components/BudgetSettingsModal';
import BudgetOverview from './components/BudgetOverview';
import { Wallet, Info, AlertCircle, Download, Upload, Merge, PiggyBank } from 'lucide-react';

const STORAGE_KEY = 'smartledger_transactions';
const BUDGET_KEY = 'smartledger_budgets';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: '',
    error: null,
  });
  
  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Hidden file input for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
  useEffect(() => {
    const storedTx = localStorage.getItem(STORAGE_KEY);
    if (storedTx) {
      try {
        setTransactions(JSON.parse(storedTx));
      } catch (e) {
        console.error("Failed to parse stored transactions", e);
      }
    }

    const storedBudgets = localStorage.getItem(BUDGET_KEY);
    if (storedBudgets) {
      try {
        setBudgets(JSON.parse(storedBudgets));
      } catch (e) {
        console.error("Failed to parse stored budgets", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const handleAnalyze = async (files: File[]) => {
    setAnalysisState({ isAnalyzing: true, progress: '正在通过 Gemini 智能分析图片内容...', error: null });
    
    try {
      const results = await analyzeScreenshots(files);
      if (results.length === 0) {
        setAnalysisState({ isAnalyzing: false, progress: '', error: '未能从图片中识别出有效交易信息，请尝试更清晰的截图。' });
      } else {
        setTransactions(prev => [...results, ...prev]);
        setAnalysisState({ isAnalyzing: false, progress: '', error: null });
      }
    } catch (err: any) {
      setAnalysisState({ 
        isAnalyzing: false, 
        progress: '', 
        error: err.message || '分析过程中发生错误，请重试。' 
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有记录吗？此操作不可恢复。')) {
      setTransactions([]);
    }
  }

  // Edit Logic
  const openEditModal = (transaction: Transaction) => {
    setEditingTx(transaction);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    setIsEditModalOpen(false);
    setEditingTx(null);
  };

  // Export Logic
  const handleExport = () => {
    const data = {
        transactions,
        budgets
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Logic
  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Handle both old format (array of tx) and new format (object with tx and budgets)
        let importedTx: Transaction[] = [];
        let importedBudgets: Budget[] = [];

        if (Array.isArray(json)) {
            importedTx = json;
        } else if (json.transactions) {
            importedTx = json.transactions;
            importedBudgets = json.budgets || [];
        }

        if (importedTx.length > 0 || importedBudgets.length > 0) {
          if (window.confirm(`发现记录，确定要覆盖当前数据吗？(取消则为追加交易记录，预算将被覆盖)`)) {
             setTransactions(importedTx);
             if (importedBudgets.length > 0) setBudgets(importedBudgets);
          } else {
             // Deduplicate by ID when appending
             const currentIds = new Set(transactions.map(t => t.id));
             const newItems = importedTx.filter((t: any) => !currentIds.has(t.id));
             setTransactions(prev => [...prev, ...newItems]);
             if (importedBudgets.length > 0) setBudgets(importedBudgets);
          }
        } else {
            alert('文件格式错误或无数据');
        }
      } catch (err) {
        alert('无法解析 JSON 文件');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Merge Duplicates Logic
  const handleMergeDuplicates = () => {
    let mergedCount = 0;
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach(t => {
      const key = `${t.date}-${t.amount.toFixed(2)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const newTransactions: Transaction[] = [];

    Object.values(groups).forEach(group => {
      if (group.length === 1) {
        newTransactions.push(group[0]);
      } else {
        const best = group.reduce((prev, curr) => {
            const prevScore = getSourceScore(prev);
            const currScore = getSourceScore(curr);
            if (currScore > prevScore) return curr;
            return prev;
        });
        
        if (group.length > 1) {
            mergedCount += (group.length - 1);
        }
        newTransactions.push(best);
      }
    });

    if (mergedCount > 0) {
        if (window.confirm(`发现并合并了 ${mergedCount} 条重复流水(例如：微信支付和银行卡扣款重复)。确定合并吗？`)) {
            setTransactions(newTransactions);
        }
    } else {
        alert('未发现明显的重复流水（基于日期和金额匹配）。');
    }
  };

  const getSourceScore = (t: Transaction) => {
      if (t.platform === Platform.WeChat || t.platform === Platform.Alipay) return 10;
      if (t.platform === Platform.Meituan || t.platform === Platform.JD || t.platform === Platform.Taobao) return 8;
      if (t.platform === Platform.Bank) return 1;
      return 5;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 p-2 rounded-lg">
                <Wallet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-900 hidden sm:block">
              SmartLedger AI
            </h1>
            <h1 className="text-xl font-bold text-brand-700 sm:hidden">
              SmartLedger
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
             <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center sm:flex-row sm:space-x-1"
                title="设置预算"
            >
                <PiggyBank className="w-5 h-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">预算</span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button 
                onClick={handleMergeDuplicates}
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center sm:flex-row sm:space-x-1"
                title="合并重复流水 (微信/银行卡)"
            >
                <Merge className="w-5 h-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">合并重复</span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button 
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="导出数据"
            >
                <Download className="w-5 h-5" />
            </button>
            <button 
                onClick={triggerImport}
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="导入数据"
            >
                <Upload className="w-5 h-5" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro / Tips */}
        {transactions.length === 0 && !analysisState.isAnalyzing && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                <Info className="text-blue-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">如何使用？</p>
                    <p>1. 截图你的微信支付账单、支付宝账单、或电商（淘宝、美团）订单详情。</p>
                    <p>2. 将图片上传到下方区域。</p>
                    <p>3. AI 将自动提取时间、金额、商户，并自动帮你分类。</p>
                </div>
            </div>
        )}

        {/* Error Banner */}
        {analysisState.error && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-center space-x-3 text-red-700 animate-fade-in">
                <AlertCircle className="w-5 h-5" />
                <span>{analysisState.error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
                <FileUpload 
                  onAnalyze={handleAnalyze} 
                  isAnalyzing={analysisState.isAnalyzing} 
                />
                
                {transactions.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="mt-6 w-full text-sm text-gray-400 hover:text-red-500 transition-colors underline decoration-dotted"
                    >
                        清空所有数据
                    </button>
                )}
            </div>
          </div>

          {/* Right Column: Dashboard & List */}
          <div className="lg:col-span-2 space-y-8">
            <Dashboard transactions={transactions} />
            
            <BudgetOverview 
                transactions={transactions} 
                budgets={budgets} 
                onOpenSettings={() => setIsBudgetModalOpen(true)} 
            />

            <TransactionList 
              transactions={transactions} 
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        transaction={editingTx} 
        onSave={handleSaveEdit}
      />

      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudgets={budgets}
        onSave={setBudgets}
      />
    </div>
  );
};

export default App;
