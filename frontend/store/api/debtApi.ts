import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { Debt, Payment } from '../slices/debtSlice';
import { ProjectionScenario } from '../slices/projectionSlice';
import { BudgetExpenses, Transaction } from '../slices/budgetSlice';
import { forceLogout } from '../slices/authSlice';

// API base URL - points to local backend server
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.104:3000/api/v1'
  : 'https://api.debtfree.com/api/v1';

// Custom base query with 401 handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.tokens?.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Token expired or invalid, force logout
    console.log('401 Unauthorized - forcing logout');
    api.dispatch(forceLogout());
    
    // Return a custom error that won't trigger the error handling in components
    return {
      error: {
        status: 401,
        data: { message: 'Session expired. Please login again.' }
      }
    };
  }
  
  return result;
};

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Debt', 'Budget', 'Projection', 'Payment', 'Analytics', 'Gamification', 'Reports'],
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
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: [...], timestamp: ... }
        const debtsArray = response?.data || [];
        
        // Transform API response to match frontend interface
        return debtsArray.map(debt => ({
          id: debt.id,
          name: debt.name,
          balance: Number(debt.currentBalance) || 0, // Convert string to number
          currentBalance: Number(debt.currentBalance) || 0, // Convert string to number
          originalAmount: Number(debt.originalAmount) || 0, // Convert string to number
          minimumPayment: Number(debt.minimumPayment) || 0, // Convert string to number
          interestRate: Number(debt.interestRate) || 0, // Convert string to number
          dueDate: debt.dueDate,
          priority: Number(debt.priority) || 1, // Convert string to number
          status: debt.status || 'active',
          createdAt: debt.createdAt,
          type: debt.type,
        }));
      },
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
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: [...], timestamp: ... }
        return response?.data || [];
      },
      providesTags: ['Payment'],
    }),

    // Budget Management
    getBudget: builder.query<
      { monthlyIncome: number; expenses: BudgetExpenses; currentMonth: string },
      void
    >({
      query: () => '/budget/current',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        const budgetData = response?.data || {};
        const expenses = budgetData.expenses || {};
        
        return {
          monthlyIncome: Number(budgetData.monthlyIncome) || 0,
          expenses: {
            housing: Number(expenses.housing) || 0,
            food: Number(expenses.food) || 0,
            transportation: Number(expenses.transportation) || 0,
            utilities: Number(expenses.utilities) || 0,
            entertainment: Number(expenses.entertainment) || 0,
            healthcare: Number(expenses.healthcare) || 0,
            miscellaneous: Number(expenses.miscellaneous) || 0,
          },
          currentMonth: budgetData.currentMonth || new Date().toISOString().slice(0, 7),
        };
      },
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
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: [...], timestamp: ... }
        return response?.data || [];
      },
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
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        return response?.data || { comparisons: [], recommendation: null };
      },
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
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        const analyticsData = response?.data || {};
        return {
          debtToIncomeRatio: Number(analyticsData.debtToIncomeRatio) || 0,
          monthlyPaymentRatio: Number(analyticsData.monthlyPaymentRatio) || 0,
          averageInterestRate: Number(analyticsData.averageInterestRate) || 0,
          totalInterestSaved: Number(analyticsData.totalInterestSaved) || 0,
          projectedPayoffDate: analyticsData.projectedPayoffDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          progressData: analyticsData.progressData || [],
        };
      },
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
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        const progressData = response?.data || {};
        return {
          totalOriginalDebt: Number(progressData.totalOriginalDebt) || 0,
          totalCurrentDebt: Number(progressData.totalCurrentDebt) || 0,
          totalPaidOff: Number(progressData.totalPaidOff) || 0,
          progressPercentage: Number(progressData.progressPercentage) || 0,
          paidOffDebts: Number(progressData.paidOffDebts) || 0,
          activeDebts: Number(progressData.activeDebts) || 0,
          totalDebts: Number(progressData.totalDebts) || 0,
        };
      },
      providesTags: ['Analytics'],
    }),

    // Gamification
    getGamificationProfile: builder.query<any, void>({
      query: () => '/gamification/profile',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        const profileData = response?.data || {};
        return {
          userId: profileData.userId,
          points: profileData.points || 0,
          level: profileData.level || 1,
          experience: profileData.experience || 0,
          experienceToNextLevel: profileData.experienceToNextLevel || 1000,
          streak: profileData.streak || 0,
          totalPayments: profileData.totalPayments || 0,
          totalPaidOff: profileData.totalPaidOff || 0,
          nextMilestone: profileData.nextMilestone || {
            name: 'Debt Warrior',
            pointsRequired: 1000,
            currentProgress: 0,
          },
        };
      },
      providesTags: ['Gamification'],
    }),
    getBadges: builder.query<any[], void>({
      query: () => '/gamification/badges',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: [...], timestamp: ... }
        const badgesData = response?.data || [];
        return Array.isArray(badgesData) ? badgesData : [];
      },
      providesTags: ['Gamification'],
    }),
    getAvailableBadges: builder.query<any[], void>({
      query: () => '/gamification/available-badges',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: [...], timestamp: ... }
        return response?.data || [];
      },
      providesTags: ['Gamification'],
    }),

    // Payments
    getAllPayments: builder.query<any[], void>({
      query: () => '/payments',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: [...], timestamp: ... }
        return response?.data || [];
      },
      providesTags: ['Payment'],
    }),
    getPaymentStats: builder.query<any, void>({
      query: () => '/payments/stats',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        return response?.data || {};
      },
      providesTags: ['Payment'],
    }),

    // Reports
    getDebtSummary: builder.query<any, void>({
      query: () => '/reports/debt-summary',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        return response?.data || {};
      },
      providesTags: ['Reports'],
    }),
    getFinancialHealth: builder.query<any, void>({
      query: () => '/reports/financial-health',
      transformResponse: (response: any) => {
        // Handle API response structure - backend returns { success: true, data: {...}, timestamp: ... }
        return response?.data || {};
      },
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
  useGetAvailableBadgesQuery,
  useGetAllPaymentsQuery,
  useGetPaymentStatsQuery,
  useGetDebtSummaryQuery,
  useGetFinancialHealthQuery,
} = debtApi;