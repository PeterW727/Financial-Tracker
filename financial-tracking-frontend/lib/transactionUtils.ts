import { Transaction, Exception } from './types';

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

export function matchesException(description: string, regexRule: string): boolean {
  try {
    let flags = '';
    let rule = regexRule;
    if (rule.startsWith('(?i)')) {
      rule = rule.substring(4);
      flags = 'i';
    }
    const re = new RegExp(rule, flags);
    return re.test(description);
  } catch (e) {
    console.error('Invalid regex:', regexRule, e);
    return false;
  }
}

export function isInternalTransfer(t: Transaction, exceptions: Exception[] = []): boolean {
  const desc = t.description || '';
  
  if (!exceptions || exceptions.length === 0) {
    // Fallback to legacy hardcoded rules if no exceptions are provided yet
    // return desc === 'AUTOPAY PAYMENT - THANK YOU' || desc.includes('AMERICAN EXPRESS ACH PMT');
  }
  
  return exceptions.some(ex => matchesException(desc, ex.regexRule));
}
