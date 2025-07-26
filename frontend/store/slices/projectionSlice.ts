import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LumpSum {
  amount: number;
  month: string;
  description: string;
}

export interface MonthlyPayment {
  debtId: string;
  amount: number;
  remainingBalance: number;
  interestPaid: number;
}

export interface MonthlySchedule {
  month: string;
  payments: MonthlyPayment[];
  totalPayment: number;
  totalInterest: number;
}

export interface ProjectionScenario {
  id: string;
  name: string;
  strategy: 'snowball' | 'avalanche' | 'custom';
  monthlyExtra: number;
  lumpSums: LumpSum[];
  projectedPayoffDate: string;
  totalInterestSaved: number;
  totalInterestPaid: number;
  monthlySchedule: MonthlySchedule[];
}

interface ProjectionState {
  scenarios: ProjectionScenario[];
  activeScenario: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectionState = {
  scenarios: [],
  activeScenario: null,
  loading: false,
  error: null,
};

export const projectionSlice = createSlice({
  name: 'projections',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setScenarios: (state, action: PayloadAction<ProjectionScenario[]>) => {
      state.scenarios = action.payload;
    },
    addScenario: (state, action: PayloadAction<ProjectionScenario>) => {
      state.scenarios.push(action.payload);
    },
    updateScenario: (state, action: PayloadAction<ProjectionScenario>) => {
      const index = state.scenarios.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scenarios[index] = action.payload;
      }
    },
    deleteScenario: (state, action: PayloadAction<string>) => {
      state.scenarios = state.scenarios.filter(s => s.id !== action.payload);
      if (state.activeScenario === action.payload) {
        state.activeScenario = state.scenarios.length > 0 ? state.scenarios[0].id : null;
      }
    },
    setActiveScenario: (state, action: PayloadAction<string>) => {
      state.activeScenario = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setScenarios,
  addScenario,
  updateScenario,
  deleteScenario,
  setActiveScenario,
} = projectionSlice.actions;