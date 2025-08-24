import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useGetDebtsQuery, useGetBudgetQuery, useGetAnalyticsQuery } from '@/store/api/debtApi';
import { formatCurrency } from '@/src/utils/currencyUtils';
import { Plus, DollarSign, Calendar, TrendingUp, Target, User } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#3498db',
  success: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
  gray: '#95a5a6',
  lightGray: '#ecf0f1',
  white: '#ffffff',
  background: '#f8f9fa',
  text: '#2c3e50',
  textLight: '#7f8c8d',
};

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { list: debts } = useSelector((state: RootState) => state.debts);
  
  // Get user preferences for currency
  const userCurrency = user?.preferences?.currency || 'USD';
  
  // Ensure userCurrency is a valid currency code
  const validCurrency = userCurrency && typeof userCurrency === 'string' ? userCurrency : 'USD';
  
  // Get budget data from API instead of Redux state
  const { data: debtsData, isLoading: debtsLoading } = useGetDebtsQuery();
  const { data: budgetData, isLoading: budgetLoading } = useGetBudgetQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetAnalyticsQuery();

  // Handle potential errors
  if (debtsLoading && budgetLoading && analyticsLoading) {
    console.log('All data is still loading...');
  }

  // Ensure debtsData is an array and handle different response structures
  const debtsArray = Array.isArray(debtsData) ? debtsData : [];

  // Calculate dashboard metrics from real data with null checks
  const totalDebt = debtsArray.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  
  const totalOriginalDebt = debtsArray.reduce((sum, debt) => sum + (debt.originalAmount || 0), 0);
  
  const debtPaidOff = totalOriginalDebt - totalDebt;
  const progressPercentage = totalOriginalDebt > 0 ? (debtPaidOff / totalOriginalDebt) * 100 : 0;
  
  const activeDebts = debtsArray.filter(debt => debt.status === 'active');
  const nextDebtToPay = activeDebts.sort((a, b) => (a.priority || 0) - (b.priority || 0))[0];
  
  const monthlyPayments = debtsArray.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0);
  
  const debtToIncomeRatio = (budgetData?.monthlyIncome || 0) > 0 ? (monthlyPayments / (budgetData?.monthlyIncome || 1)) * 100 : 0;

  // Real debt-free countdown from analytics
  const projectedPayoffDate = analyticsData?.projectedPayoffDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const daysUntilDebtFree = Math.ceil(
    (new Date(projectedPayoffDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate available for debt from budget data
  const availableForDebt = budgetData ? 
    (Number(budgetData.monthlyIncome) || 0) - Object.values(budgetData.expenses || {}).reduce((sum, exp) => sum + (Number(exp) || 0), 0) : 0;
  const totalInterestSaved = Number(analyticsData?.totalInterestSaved) || 0;

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Welcome to DebtFree Pro</Text>
          <Text style={styles.authSubtitle}>Please log in to manage your debts</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.authButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show loading state while data is being fetched
  if (debtsLoading || budgetLoading || analyticsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your financial data...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'User'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <User size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/debts/add')}>
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Debt Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Total Debt</Text>
            <DollarSign size={20} color={COLORS.danger} />
          </View>
          <Text style={styles.mainAmount}>{formatCurrency(totalDebt, validCurrency)}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progressPercentage.toFixed(1)}% paid off
            </Text>
          </View>
        </View>

        <View style={styles.countdownCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Debt-Free Countdown</Text>
            <Calendar size={20} color={COLORS.success} />
          </View>
          <Text style={styles.countdownNumber}>{daysUntilDebtFree}</Text>
          <Text style={styles.countdownLabel}>days remaining</Text>
        </View>
      </View>

      {/* Progress Cards */}
      <View style={styles.progressCards}>
        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardSubtitle}>This Month's Target</Text>
            <Target size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.progressAmount}>{formatCurrency(monthlyPayments, validCurrency)}</Text>
          <Text style={styles.progressDescription}>Minimum payments due</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardSubtitle}>Available for Debt</Text>
            <DollarSign size={16} color={COLORS.success} />
          </View>
          <Text style={styles.progressAmount}>{formatCurrency(availableForDebt, validCurrency)}</Text>
          <Text style={styles.progressDescription}>After expenses</Text>
        </View>
      </View>

      {/* Next Debt to Pay Off */}
      {nextDebtToPay && (
        <View style={styles.nextDebtCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Next Debt to Pay Off</Text>
            <TrendingUp size={20} color={COLORS.warning} />
          </View>
          <Text style={styles.debtName}>{nextDebtToPay.name}</Text>
          <Text style={styles.debtBalance}>{formatCurrency(nextDebtToPay.balance, validCurrency)}</Text>
          <View style={styles.debtProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((nextDebtToPay.originalAmount - nextDebtToPay.balance) / nextDebtToPay.originalAmount) * 100}%`,
                    backgroundColor: COLORS.warning
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {(((nextDebtToPay.originalAmount - nextDebtToPay.balance) / nextDebtToPay.originalAmount) * 100).toFixed(1)}% complete
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/payments/record')}
          >
            <DollarSign size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Record Payment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/budget/expenses')}
          >
            <Plus size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Add Expense</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/projections')}
          >
            <TrendingUp size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>View Projections</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/budget/manage')}
          >
            <Target size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Update Budget</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Financial Health Indicators */}
      <View style={styles.healthIndicators}>
        <Text style={styles.sectionTitle}>Financial Health</Text>
        <View style={styles.indicatorRow}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorValue}>
              {debtToIncomeRatio.toFixed(1)}%
            </Text>
            <Text style={styles.indicatorLabel}>Debt-to-Income</Text>
            <View style={[
              styles.healthBadge, 
              { backgroundColor: debtToIncomeRatio > 36 ? COLORS.danger : debtToIncomeRatio > 20 ? COLORS.warning : COLORS.success }
            ]}>
              <Text style={styles.healthBadgeText}>
                {debtToIncomeRatio > 36 ? 'High' : debtToIncomeRatio > 20 ? 'Fair' : 'Good'}
              </Text>
            </View>
          </View>
          
          <View style={styles.indicator}>
            <Text style={styles.indicatorValue}>
              {formatCurrency(totalInterestSaved, validCurrency)}
            </Text>
            <Text style={styles.indicatorLabel}>Interest Saved</Text>
            <View style={[styles.healthBadge, { backgroundColor: COLORS.success }]}>
              <Text style={styles.healthBadgeText}>Tracking</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  overviewContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  mainAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
  },
  countdownLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  progressCards: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  progressCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  progressDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  nextDebtCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debtName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  debtBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: 16,
  },
  debtProgress: {
    marginTop: 8,
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  healthIndicators: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 16,
  },
  indicator: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  indicatorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  indicatorLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 32,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 16,
  },
});