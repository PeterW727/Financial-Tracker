import { 
  Transaction, 
  BudgetCategory, 
  MonthlyBudget, 
  RecurringExpense, 
  BudgetProfile 
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const data = await handleResponse<Transaction[]>(await fetch(`${API_BASE_URL}/api/transaction`));
  // Normalize date format from API (handles ISO strings and YYYY-MM-DD)
  return data.map((t: Transaction) => ({
    ...t,
    date: typeof t.date === 'string' && t.date.includes('T') ? t.date.split('T')[0] : t.date
  }));
}

export async function fetchBudgetCategories(): Promise<BudgetCategory[]> {
  return handleResponse<BudgetCategory[]>(await fetch(`${API_BASE_URL}/api/budget/budget-category`));
}

export async function fetchMonthlyBudgets(): Promise<MonthlyBudget[]> {
  return handleResponse<MonthlyBudget[]>(await fetch(`${API_BASE_URL}/api/budget/monthly-budget`));
}

export async function fetchRecurringExpenses(): Promise<RecurringExpense[]> {
  return handleResponse<RecurringExpense[]>(await fetch(`${API_BASE_URL}/api/budget/recurring-expense`));
}

export async function fetchBudgetProfile(): Promise<BudgetProfile | null> {
  try {
    const data = await handleResponse<BudgetProfile[]>(await fetch(`${API_BASE_URL}/api/budget/budget-profile`));
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to fetch budget profile', error);
    return null;
  }
}

export async function uploadAmex(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/transaction/upload-amex`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload Amex transactions');
  }
}

export async function uploadChase(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/transaction/upload-chase`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload Chase transactions');
  }
}
