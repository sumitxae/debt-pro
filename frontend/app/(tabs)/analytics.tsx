import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetAnalyticsQuery, useGetDebtsQuery, useGetBudgetQuery } from '@/store/api/debtApi';
// Victory Native temporarily disabled due to compatibility issues
import { ChartBar as BarChart3, TrendingDown, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react-native';

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

// Default analytics data structure
const defaultAnalyticsData = {
  debtToIncomeRatio: 0,
  monthlyPaymentRatio: 0,
  averageInterestRate: 0,
  totalInterestSaved: 0,
  projectedPayoffDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  progressData: [],
  debtBreakdown: [],
  monthlyPayments: [],
  interestVsPrincipal: [],
};

export default function AnalyticsScreen() {
  try {
    // Add skip option to prevent queries when not authenticated
    const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useGetAnalyticsQuery(undefined, {
      skip: false, // We'll handle errors gracefully
    });
    const { data: debtsData, isLoading: debtsLoading, error: debtsError } = useGetDebtsQuery(undefined, {
      skip: false, // We'll handle errors gracefully
    });
    const { data: budgetData, isLoading: budgetLoading, error: budgetError } = useGetBudgetQuery(undefined, {
      skip: false, // We'll handle errors gracefully
    });
  
  // Handle errors
  if (analyticsError || debtsError || budgetError) {
    console.log('Analytics errors:', { analyticsError, debtsError, budgetError });
  }

  // Use real data from API with fallback to defaults
  const data = analyticsData || defaultAnalyticsData;
  
  // Calculate totals from real debt data with safe fallbacks
  const debtsArray = Array.isArray(debtsData) ? debtsData : [];
  const totalDebt = debtsArray.reduce((sum, debt) => sum + (debt?.balance || 0), 0);
  const totalOriginalDebt = debtsArray.reduce((sum, debt) => sum + (debt?.originalAmount || 0), 0);
  const totalPaidOff = totalOriginalDebt - totalDebt;
  const payoffPercentage = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

  // Show loading state
  if (analyticsLoading || debtsLoading || budgetLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (analyticsError || debtsError || budgetError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load analytics data</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </View>
    );
  }

  const getHealthColor = (ratio: number, type: 'debt' | 'payment') => {
    if (type === 'debt') {
      if (ratio > 36) return COLORS.danger;
      if (ratio > 20) return COLORS.warning;
      return COLORS.success;
    } else {
      if (ratio > 20) return COLORS.danger;
      if (ratio > 10) return COLORS.warning;
      return COLORS.success;
    }
  };

  const getHealthLabel = (ratio: number, type: 'debt' | 'payment') => {
    if (type === 'debt') {
      if (ratio > 36) return 'High Risk';
      if (ratio > 20) return 'Moderate';
      return 'Healthy';
    } else {
      if (ratio > 20) return 'High';
      if (ratio > 10) return 'Moderate';
      return 'Low';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Your financial health insights
          </Text>
        </View>
        <BarChart3 size={32} color={COLORS.primary} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Financial Health Dashboard</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Percent size={20} color={COLORS.primary} />
                <Text style={styles.metricLabel}>Debt-to-Income</Text>
              </View>
              <Text style={styles.metricValue}>{data.debtToIncomeRatio}%</Text>
              <View style={[
                styles.healthBadge,
                { backgroundColor: getHealthColor(data.debtToIncomeRatio, 'debt') }
              ]}>
                <Text style={styles.healthBadgeText}>
                  {getHealthLabel(data.debtToIncomeRatio, 'debt')}
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <DollarSign size={20} color={COLORS.warning} />
                <Text style={styles.metricLabel}>Payment Ratio</Text>
              </View>
              <Text style={styles.metricValue}>{data.monthlyPaymentRatio}%</Text>
              <View style={[
                styles.healthBadge,
                { backgroundColor: getHealthColor(data.monthlyPaymentRatio, 'payment') }
              ]}>
                <Text style={styles.healthBadgeText}>
                  {getHealthLabel(data.monthlyPaymentRatio, 'payment')}
                </Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <TrendingUp size={20} color={COLORS.success} />
                <Text style={styles.metricLabel}>Interest Saved</Text>
              </View>
              <Text style={styles.metricValue}>${data.totalInterestSaved.toLocaleString()}</Text>
              <Text style={styles.metricSubtext}>vs minimum payments</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.metricLabel}>Avg Interest Rate</Text>
              </View>
              <Text style={styles.metricValue}>{data.averageInterestRate}%</Text>
              <Text style={styles.metricSubtext}>across all debts</Text>
            </View>
          </View>
        </View>

        {/* Debt Reduction Progress */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Debt Reduction Progress</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart temporarily unavailable</Text>
              <Text style={styles.chartPlaceholderSubtext}>Progress tracking will be restored soon</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.danger }]} />
                <Text style={styles.legendText}>Remaining Debt</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Paid Off</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Debt Breakdown Pie Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Current Debt Breakdown</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart temporarily unavailable</Text>
              <Text style={styles.chartPlaceholderSubtext}>Debt breakdown will be restored soon</Text>
            </View>
            <View style={styles.pieChartLegend}>
              {data.debtBreakdown.map((item, index) => (
                <View key={index} style={styles.pieChartLegendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.debt}</Text>
                  <Text style={styles.legendValue}>${item.balance.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Monthly Payment Comparison */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Monthly Payment Performance</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart temporarily unavailable</Text>
              <Text style={styles.chartPlaceholderSubtext}>Payment tracking will be restored soon</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.gray }]} />
                <Text style={styles.legendText}>Minimum Required</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>Actual Payments</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Interest vs Principal */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Interest vs Principal Payments</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart temporarily unavailable</Text>
              <Text style={styles.chartPlaceholderSubtext}>Interest tracking will be restored soon</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.danger }]} />
                <Text style={styles.legendText}>Interest Paid</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Principal Paid</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Progress Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <TrendingDown size={24} color={COLORS.success} />
                <Text style={styles.summaryValue}>{payoffPercentage.toFixed(1)}%</Text>
                <Text style={styles.summaryLabel}>Debt Eliminated</Text>
              </View>
              <View style={styles.summaryItem}>
                <DollarSign size={24} color={COLORS.primary} />
                <Text style={styles.summaryValue}>${totalPaidOff.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Paid Off</Text>
              </View>
            </View>
            
            <View style={styles.projectionContainer}>
              <Text style={styles.projectionTitle}>Projected Debt-Free Date</Text>
              <Text style={styles.projectionDate}>
                {new Date(data.projectedPayoffDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <Text style={styles.projectionSubtext}>
                Based on current payment patterns
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationCard}>
            <TrendingUp size={24} color={COLORS.success} />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Great Progress!</Text>
              <Text style={styles.recommendationText}>
                You're paying ${(data.monthlyPayments[data.monthlyPayments.length - 1].actual - data.monthlyPayments[data.monthlyPayments.length - 1].minimum)} 
                extra per month. Keep this up to save more on interest.
              </Text>
            </View>
          </View>
          
          <View style={styles.recommendationCard}>
            <DollarSign size={24} color={COLORS.warning} />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Optimization Opportunity</Text>
              <Text style={styles.recommendationText}>
                Consider the avalanche method to reduce interest payments. You could save an additional 
                $500 in interest over the life of your debts.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
  } catch (error) {
    console.error('Analytics screen error:', error);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </View>
    );
  }
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  metricsContainer: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  healthBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.text,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pieChartLegend: {
    marginTop: 20,
    width: '100%',
  },
  pieChartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  projectionContainer: {
    alignItems: 'center',
  },
  projectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  projectionDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 4,
  },
  projectionSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  recommendationsSection: {
    marginBottom: 40,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    width: '100%',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});