export type TransactionOrigin = 'AMEX' | 'CHASE' | 'VENMO';

export type BudgetCategoryType = 'INCOME' | 'FIXED_EXPENSE' | 'DISCRETIONARY_EXPENSE' | 'SAVINGS' | 'INVESTMENT';
export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface BudgetCategory {
  id: number;
  name: string;
  type: BudgetCategoryType;
}

export interface MonthlyBudget {
  id: number;
  category: BudgetCategory;
  month: number;
  year: number;
  amount: number;
}

export interface RecurringExpense {
  id: number;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: BudgetCategory;
}

export interface BudgetProfile {
  id: number;
  grossBaseSalary: number;
  taxRate: number;
  savingsApr: number;
}

export interface Transaction {
  transactionId: number;
  referenceNo: string; // BigInteger in Java, usually string in JS if large
  date: string; // SQL Date usually comes as YYYY-MM-DD
  description: string;
  amount: number;
  category: string;
  budgetCategory?: BudgetCategory;
  transactionOrigin: TransactionOrigin;
}

export type TimeRange = 'week' | 'month' | 'ytd';
