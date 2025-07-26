import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { Debt, Payment } from '../slices/debtSlice';
import { ProjectionScenario } from '../slices/projectionSlice';
import { BudgetExpenses, Transaction } from '../slices/budgetSlice';

// API base URL - points to local backend server
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.104:3000/api/v1'
  : 'https://api.debtfree.com/api/v1';

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.tokens?.accessToken;
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
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: any; token: string },
      { firstName: string; lastName: string; email: string; password: string; monthlyIncome?: number }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Debt Management
    getDebts: builder.query<Debt[], void>({
      query: () => '/debts',
      providesTags: ['Debt'],
    }),
    createDebt: builder.mutation<Debt, Partial<Debt>>({
      query: (debt) => ({
        url: '/debts',
        method: 'POST',
        body: debt,
      }),
      invalidatesTags: ['Debt', 'Projection'],
    }),
    updateDebt: builder.mutation<Debt, { id: string } & Partial<Debt>>({
      query: ({ id, ...debt }) => ({
        url: `/debts/${id}`,
        method: 'PUT',
        body: debt,
      }),
      invalidatesTags: ['Debt', 'Projection'],
    }),
    deleteDebt: builder.mutation<void, string>({
      query: (id) => ({
        url: `/debts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Debt', 'Projection'],
    }),
    recordPayment: builder.mutation<
      Payment,
      { debtId: string; amount: number; paymentDate?: string; paymentType?: string; notes?: string }
    >({
      query: ({ debtId, ...payment }) => ({
        url: `/payments/${debtId}`,
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: ['Debt', 'Payment', 'Projection', 'Analytics'],
    }),
    getPayments: builder.query<Payment[], string>({
      query: (debtId) => `/debts/${debtId}/payments`,
      providesTags: ['Payment'],
    }),

    // Budget Management
    getBudget: builder.query<
      { monthlyIncome: number; expenses: BudgetExpenses; currentMonth: string },
      void
    >({
      query: () => '/budget/current',
      providesTags: ['Budget'],
    }),
    updateBudget: builder.mutation<
      void,
      { monthlyIncome?: number; expenses?: BudgetExpenses }
    >({
      query: (budget) => ({
        url: '/budget/current',
        method: 'PUT',
        body: budget,
      }),
      invalidatesTags: ['Budget', 'Projection'],
    }),
    getTransactions: builder.query<Transaction[], { month?: number; year?: number }>({
      query: ({ month, year }) => `/budget/transactions?month=${month}&year=${year}`,
      providesTags: ['Budget'],
    }),
    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: '/budget/transactions',
        method: 'POST',
        body: transaction,
      }),
      invalidatesTags: ['Budget'],
    }),

    // Projections
    calculateProjection: builder.mutation<
      ProjectionScenario,
      {
        strategy?: 'snowball' | 'avalanche' | 'custom';
        monthlyExtra?: number;
        lumpSums?: any[];
        customPriorities?: { debtId: string; priority: number }[];
      }
    >({
      query: (projection) => ({
        url: '/analytics/projection',
        method: 'GET',
        params: projection,
      }),
      invalidatesTags: ['Projection'],
    }),
    compareStrategies: builder.query<
      { comparisons: any[]; recommendation: any },
      { monthlyExtra?: number; lumpSums?: any[] }
    >({
      query: (params) => ({
        url: '/analytics/compare-strategies',
        method: 'GET',
        params,
      }),
      providesTags: ['Projection'],
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
      query: () => '/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
    getProgress: builder.query<
      {
        totalOriginalDebt: number;
        totalCurrentDebt: number;
        totalPaidOff: number;
        progressPercentage: number;
        paidOffDebts: any;
        activeDebts: any;
        totalDebts: any;
      },
      void
    >({
      query: () => '/analytics/progress',
      providesTags: ['Analytics'],
    }),

    // Gamification
    getGamificationProfile: builder.query<any, void>({
      query: () => '/gamification/profile',
      providesTags: ['Gamification'],
    }),
    getBadges: builder.query<any[], void>({
      query: () => '/gamification/badges',
      providesTags: ['Gamification'],
    }),

    // Reports
    getDebtSummary: builder.query<any, void>({
      query: () => '/reports/debt-summary',
      providesTags: ['Reports'],
    }),
    getFinancialHealth: builder.query<any, void>({
      query: () => '/reports/financial-health',
      providesTags: ['Reports'],
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
  useCompareStrategiesQuery,
  useGetAnalyticsQuery,
  useGetProgressQuery,
  useGetGamificationProfileQuery,
  useGetBadgesQuery,
  useGetDebtSummaryQuery,
  useGetFinancialHealthQuery,
} = debtApi;