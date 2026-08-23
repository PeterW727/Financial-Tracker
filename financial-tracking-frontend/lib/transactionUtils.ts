import { Transaction } from './types';

export function isSpending(t: Transaction): boolean {
  // AMEX: positive = spending, negative = income
  // Others (CHASE, VENMO, etc.): positive = income, negative = spending
  if (t.transactionOrigin === 'AMEX') return t.amount > 0;
  return t.amount < 0;
}

export function isIncome(t: Transaction): boolean {
  // AMEX: negative = income, positive = spending
  // Others (CHASE, VENMO, etc.): positive = income, negative = spending
  if (t.transactionOrigin === 'AMEX') return t.amount < 0;
  return t.amount > 0;
}

export function absAmount(t: Transaction): number {
  return Math.abs(t.amount || 0);
}

export function isInternalTransfer(t: Transaction): boolean {
  const desc = t.description || '';
  return desc === 'AUTOPAY PAYMENT - THANK YOU' || desc.includes('AMERICAN EXPRESS ACH PMT');
}
