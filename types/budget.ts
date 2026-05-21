export interface IncomeSource {
  id: string;
  label: string;
  amount: number;
}

export interface IncomeItem {
  id: string;
  title: string;
  sources: IncomeSource[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetEntry {
  id: string;
  title: string;
  category: string;
  amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetMonthRecord {
  monthKey: string;
  incomeItems: IncomeItem[];
  savingItems: BudgetEntry[];
  expenseItems: BudgetEntry[];
}

export interface IncomeSourceDraft {
  label: string;
  amount: number;
}

export interface IncomeItemDraft {
  title: string;
  sources: IncomeSourceDraft[];
  notes?: string;
}

export interface BudgetEntryDraft {
  title: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface BudgetMonthSummary {
  totalIncome: number;
  totalSavings: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  topExpenseCategory?: string;
  entryCount: number;
  hasActivity: boolean;
}
