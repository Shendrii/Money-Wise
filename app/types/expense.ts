export interface Expense {
  id: string;
  userId: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseFormData = Omit<
  Expense,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
