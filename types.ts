export enum Platform {
  WeChat = '微信支付',
  Alipay = '支付宝',
  Bank = '银行卡',
  Cash = '现金',
  Apple = 'Apple Pay',
  Douyin = '抖音支付',
  Meituan = '美团',
  JD = '京东',
  Taobao = '淘宝/天猫',
  Pinduoduo = '拼多多',
  Other = '其他'
}

export enum Category {
  Food = '餐饮',
  Transport = '交通',
  Clothing = '服饰',
  HobbiesTravel = '爱好&旅行',
  Education = '教育',
  Social = '人情',
  Elders = '长辈',
  Medical = '医疗',
  InvestmentLoss = '投资亏损',
  Services = '生活服务',
  DailySupplies = '日用品',
  Other = '其他'
}

export enum ConsumptionObject {
  Self = '自己',
  Parents = '父母',
  Husband = '丈夫',
  Daughter = '女儿',
  Friends = '朋友',
  Others = '其他人'
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount: number;
  merchant: string;
  description: string; // AI inferred details
  platform: Platform;
  category: Category;
  consumptionObject: ConsumptionObject; // New field
  note?: string; // New field
  originalImage?: string; // Base64 preview (optional, strictly for UI)
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface DailySummary {
  date: string;
  total: number;
}

export interface CategorySummary {
  name: string;
  value: number;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  progress: string; // Message to show user
  error: string | null;
}
