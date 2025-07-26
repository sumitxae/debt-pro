import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { Debt, Payment } from '../slices/debtSlice';
import { ProjectionScenario } from '../slices/projectionSlice';
import { BudgetExpenses, Transaction } from '../slices/budgetSlice';

// Mock API base URL - replace with real API in production
const API_BASE_URL = 'https://api.debtfree.com';

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Debt', 'Budget', 'Projection', 'Payment', 'Analytics'],
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation<
      { user: any; token: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: any; token: string },
      { name: string; email: string; password: string }
    >({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Debt Management
    getDebts: builder.query<Debt[], void>({
      query: () => '/api/debts',
      providesTags: ['Debt'],
    }),
    createDebt: builder.mutation<Debt, Partial<Debt>>({
      query: (debt) => ({
        url: '/api/debts',
        method: 'POST',
        body: debt,
      }),
      invalidatesTags: ['Debt', 'Projection'],
    }),
    updateDebt: builder.mutation<Debt, { id: string } & Partial<Debt>>({
      query: ({ id, ...debt }) => ({
        url: `/api/debts/${id}`,
        method: 'PUT',
        body: debt,
      }),
      invalidatesTags: ['Debt', 'Projection'],
    }),
    deleteDebt: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/debts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Debt', 'Projection'],
    }),
    recordPayment: builder.mutation<
      Payment,
      { debtId: string; amount: number; date: string; method: string; notes?: string }
    >({
      query: ({ debtId, ...payment }) => ({
        url: `/api/debts/${debtId}/payment`,
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: ['Debt', 'Payment', 'Projection', 'Analytics'],
    }),
    getPayments: builder.query<Payment[], string>({
      query: (debtId) => `/api/debts/${debtId}/payments`,
      providesTags: ['Payment'],
    }),

    // Budget Management
    getBudget: builder.query<
      { monthlyIncome: number; expenses: BudgetExpenses; currentMonth: string },
      void
    >({
      query: () => '/api/budget/current',
      providesTags: ['Budget'],
    }),
    updateBudget: builder.mutation<
      void,
      { monthlyIncome: number; expenses: BudgetExpenses }
    >({
      query: (budget) => ({
        url: '/api/budget/current',
        method: 'PUT',
        body: budget,
      }),
      invalidatesTags: ['Budget', 'Projection'],
    }),
    getTransactions: builder.query<Transaction[], { month: string }>({
      query: ({ month }) => `/api/transactions?month=${month}`,
      providesTags: ['Budget'],
    }),
    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: '/api/transactions',
        method: 'POST',
        body: transaction,
      }),
      invalidatesTags: ['Budget'],
    }),

    // Projections
    calculateProjection: builder.mutation<
      ProjectionScenario,
      {
        strategy: 'snowball' | 'avalanche' | 'custom';
        monthlyExtra: number;
        lumpSums: any[];
        customPriorities?: { debtId: string; priority: number }[];
      }
    >({
      query: (projection) => ({
        url: '/api/projections/calculate',
        method: 'POST',
        body: projection,
      }),
      invalidatesTags: ['Projection'],
    }),
    getProjections: builder.query<ProjectionScenario[], void>({
      query: () => '/api/projections',
      providesTags: ['Projection'],
    }),
    saveProjection: builder.mutation<ProjectionScenario, Partial<ProjectionScenario>>({
      query: (scenario) => ({
        url: '/api/projections',
        method: 'POST',
        body: scenario,
      }),
      invalidatesTags: ['Projection'],
    }),

    // Analytics
    getAnalytics: builder.query<
      {
        debtToIncomeRatio: number;
        monthlyPaymentRatio: number;
        averageInterestRate: number;
        totalInterestSaved: number;
        projectedPayoffDate: string;
        progressData: any[];
      },
      void
    >({
      query: () => '/api/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetDebtsQuery,
  useCreateDebtMutation,
  useUpdateDebtMutation,
  useDeleteDebtMutation,
  useRecordPaymentMutation,
  useGetPaymentsQuery,
  useGetBudgetQuery,
  useUpdateBudgetMutation,
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useCalculateProjectionMutation,
  useGetProjectionsQuery,
  useSaveProjectionMutation,
  useGetAnalyticsQuery,
} = debtApi;