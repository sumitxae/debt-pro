import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice';
import { debtSlice } from './slices/debtSlice';
import { budgetSlice } from './slices/budgetSlice';
import { projectionSlice } from './slices/projectionSlice';
import { gamificationSlice } from './slices/gamificationSlice';
import { debtApi } from './api/debtApi';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    debts: debtSlice.reducer,
    budget: budgetSlice.reducer,
    projections: projectionSlice.reducer,
    gamification: gamificationSlice.reducer,
    [debtApi.reducerPath]: debtApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          debtApi.util.resetApiState.type,
          'auth/loginUser/fulfilled',
          'auth/registerUser/fulfilled',
          'auth/updateUserProfile/fulfilled',
          'auth/updateUserPreferences/fulfilled',
        ],
      },
    }).concat(debtApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;