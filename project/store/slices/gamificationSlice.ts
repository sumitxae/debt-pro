import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string | null;
  icon: string;
  category: string;
}

export interface Milestone {
  id: string;
  description: string;
  target: number;
  current: number;
  achieved: boolean;
  type: 'payment_count' | 'debt_paid' | 'money_saved' | 'consistency';
}

interface GamificationState {
  totalPointsEarned: number;
  currentLevel: number;
  badges: Badge[];
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  totalPointsEarned: 0,
  currentLevel: 1,
  badges: [],
  milestones: [],
  loading: false,
  error: null,
};

export const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addPoints: (state, action: PayloadAction<number>) => {
      state.totalPointsEarned += action.payload;
      // Calculate level based on points (every 1000 points = 1 level)
      state.currentLevel = Math.floor(state.totalPointsEarned / 1000) + 1;
    },
    setBadges: (state, action: PayloadAction<Badge[]>) => {
      state.badges = action.payload;
    },
    earnBadge: (state, action: PayloadAction<string>) => {
      const badge = state.badges.find(b => b.id === action.payload);
      if (badge && !badge.earnedAt) {
        badge.earnedAt = new Date().toISOString();
      }
    },
    setMilestones: (state, action: PayloadAction<Milestone[]>) => {
      state.milestones = action.payload;
    },
    updateMilestone: (state, action: PayloadAction<{ id: string; current: number }>) => {
      const milestone = state.milestones.find(m => m.id === action.payload.id);
      if (milestone) {
        milestone.current = action.payload.current;
        milestone.achieved = milestone.current >= milestone.target;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  addPoints,
  setBadges,
  earnBadge,
  setMilestones,
  updateMilestone,
} = gamificationSlice.actions;