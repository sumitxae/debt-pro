import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BudgetExpenses {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  entertainment: number;
  miscellaneous: number;
}

export interface Transaction {
  id: string;
  category: keyof BudgetExpenses;
  amount: number;
  description: string;
  date: string;
}

interface BudgetState {
  monthlyIncome: number;
  expenses: BudgetExpenses;
  transactions: Transaction[];
  availableForDebt: number;
  currentMonth: string;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  monthlyIncome: 0,
  expenses: {
    housing: 0,
    food: 0,
    transportation: 0,
    utilities: 0,
    entertainment: 0,
    miscellaneous: 0,
  },
  transactions: [],
  availableForDebt: 0,
  currentMonth: new Date().toISOString().slice(0, 7),
  loading: false,
  error: null,
};

export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMonthlyIncome: (state, action: PayloadAction<number>) => {
      state.monthlyIncome = action.payload;
      state.availableForDebt = action.payload - Object.values(state.expenses).reduce((sum, exp) => sum + exp, 0);
    },
    setExpenses: (state, action: PayloadAction<BudgetExpenses>) => {
      state.expenses = action.payload;
      state.availableForDebt = state.monthlyIncome - Object.values(action.payload).reduce((sum, exp) => sum + exp, 0);
    },
    updateExpenseCategory: (state, action: PayloadAction<{ category: keyof BudgetExpenses; amount: number }>) => {
      state.expenses[action.payload.category] = action.payload.amount;
      state.availableForDebt = state.monthlyIncome - Object.values(state.expenses).reduce((sum, exp) => sum + exp, 0);
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
    },
    setCurrentMonth: (state, action: PayloadAction<string>) => {
      state.currentMonth = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setMonthlyIncome,
  setExpenses,
  updateExpenseCategory,
  setTransactions,
  addTransaction,
  setCurrentMonth,
} = budgetSlice.actions;