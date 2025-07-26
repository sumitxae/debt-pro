import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  originalAmount: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: string;
  priority: number;
  status: 'active' | 'paid';
  createdAt: string;
  type: string;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

interface DebtState {
  list: Debt[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: DebtState = {
  list: [],
  payments: [],
  loading: false,
  error: null,
};

export const debtSlice = createSlice({
  name: 'debts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDebts: (state, action: PayloadAction<Debt[]>) => {
      state.list = action.payload;
    },
    addDebt: (state, action: PayloadAction<Debt>) => {
      state.list.push(action.payload);
    },
    updateDebt: (state, action: PayloadAction<Debt>) => {
      const index = state.list.findIndex(debt => debt.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteDebt: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(debt => debt.id !== action.payload);
    },
    recordPayment: (state, action: PayloadAction<{ debtId: string; amount: number }>) => {
      const debt = state.list.find(d => d.id === action.payload.debtId);
      if (debt) {
        debt.balance = Math.max(0, debt.balance - action.payload.amount);
        if (debt.balance === 0) {
          debt.status = 'paid';
        }
      }
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setDebts,
  addDebt,
  updateDebt,
  deleteDebt,
  recordPayment,
  setPayments,
  addPayment,
} = debtSlice.actions;