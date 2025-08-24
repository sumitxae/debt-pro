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
import {
  useGetDebtsQuery,
  useGetBudgetQuery,
} from '@/store/api/debtApi';

import {
  ChartBar as BarChart3,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
} from 'lucide-react-native';
import { formatCurrency } from '@/src/utils/currencyUtils';

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

export default function AnalyticsScreen() {
  try {
    const {
      data: debtsData,
      isLoading: debtsLoading,
      error: debtsError,
    } = useGetDebtsQuery(undefined, {
      skip: false,
    });
    const {
      data: budgetData,
      isLoading: budgetLoading,
      error: budgetError,
    } = useGetBudgetQuery(undefined, {
      skip: false,
    });

    if (debtsError || budgetError) {
      console.log('Analytics errors:', { debtsError, budgetError });
    }

    const debtsArray = Array.isArray(debtsData) ? debtsData : [];
    const totalDebt = debtsArray.reduce(
      (sum, debt) => sum + (debt?.balance || 0),
      0
    );
    const totalOriginalDebt = debtsArray.reduce(
      (sum, debt) => sum + (debt?.originalAmount || 0),
      0
    );
    const totalPaidOff = totalOriginalDebt - totalDebt;
    const payoffPercentage =
      totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

    const monthlyIncome = budgetData
      ? Number(budgetData.monthlyIncome) || 0
      : 0;
    const debtToIncomeRatio =
      monthlyIncome > 0
        ? Math.ceil((totalDebt / (monthlyIncome * 12)) * 100)
        : 0;

    const totalInterestRate = debtsArray.reduce(
      (sum, debt) => sum + (debt?.interestRate || 0),
      0
    );
    const averageInterestRate =
      debtsArray.length > 0
        ? Math.ceil(totalInterestRate / debtsArray.length)
        : 0;

    const totalMonthlyPayments = debtsArray.reduce(
      (sum, debt) => sum + (debt?.minimumPayment || 0),
      0
    );
    const monthlyPaymentRatio =
      monthlyIncome > 0
        ? Math.ceil((totalMonthlyPayments / monthlyIncome) * 100)
        : 0;

    const colors = [
      COLORS.primary,
      COLORS.success,
      COLORS.warning,
      COLORS.danger,
      COLORS.gray,
    ];
    const debtBreakdown = debtsArray.map((debt, index) => ({
      debt: debt.name || `Debt ${index + 1}`,
      balance: debt.balance || 0,
      color: colors[index % colors.length],
    }));

    const { user, isAuthenticated } = useSelector(
      (state: RootState) => state.auth
    );
    const userCurrency = user?.preferences?.currency || 'USD';

    const validCurrency =
      userCurrency && typeof userCurrency === 'string' ? userCurrency : 'USD';

    const data = {
      debtToIncomeRatio,
      monthlyPaymentRatio,
      averageInterestRate,
      totalInterestSaved: totalPaidOff * 0.1,
      projectedPayoffDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      progressData: [],
      debtBreakdown,
      monthlyPayments: [],
      interestVsPrincipal: [],
    };

    if (debtsLoading || budgetLoading) {
      return (
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        </View>
      );
    }

    if (debtsError || budgetError) {
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

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Key Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Financial Health Dashboard</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Percent size={20} color={COLORS.primary} />
                  <Text style={styles.metricLabel}>Debt-to-Income</Text>
                </View>
                <Text style={styles.metricValue}>
                  {data.debtToIncomeRatio}%
                </Text>
                <View
                  style={[
                    styles.healthBadge,
                    {
                      backgroundColor: getHealthColor(
                        data.debtToIncomeRatio,
                        'debt'
                      ),
                    },
                  ]}
                >
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
                <Text style={styles.metricValue}>
                  {data.monthlyPaymentRatio}%
                </Text>
                <View
                  style={[
                    styles.healthBadge,
                    {
                      backgroundColor: getHealthColor(
                        data.monthlyPaymentRatio,
                        'payment'
                      ),
                    },
                  ]}
                >
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
                <Text style={styles.metricValue}>
                  {formatCurrency(
                    Number(data.totalInterestSaved),
                    validCurrency
                  )}
                </Text>
                <Text style={styles.metricSubtext}>vs minimum payments</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Calendar size={20} color={COLORS.primary} />
                  <Text style={styles.metricLabel}>Avg Interest Rate</Text>
                </View>
                <Text style={styles.metricValue}>
                  {data.averageInterestRate}%
                </Text>
                <Text style={styles.metricSubtext}>across all debts</Text>
              </View>
            </View>
          </View>

                     {/* Debt Reduction Progress */}
           <View style={styles.chartSection}>
             <Text style={styles.sectionTitle}>Debt Reduction Progress</Text>
             <View style={styles.chartCard}>
               <View style={styles.progressContainer}>
                 <View style={styles.progressBar}>
                   <View 
                     style={[
                       styles.progressFill, 
                       { 
                         width: `${payoffPercentage}%`,
                         backgroundColor: COLORS.success 
                       }
                     ]} 
                   />
                 </View>
                 <View style={styles.progressStats}>
                   <Text style={styles.progressText}>
                     {payoffPercentage.toFixed(1)}% Complete
                   </Text>
                   <Text style={styles.progressSubtext}>
                     {formatCurrency(Number(totalPaidOff), validCurrency)} of {formatCurrency(Number(totalOriginalDebt), validCurrency)} paid off
                   </Text>
                 </View>
               </View>
               <View style={styles.chartLegend}>
                 <View style={styles.legendItem}>
                   <View
                     style={[
                       styles.legendColor,
                       { backgroundColor: COLORS.danger },
                     ]}
                   />
                   <Text style={styles.legendText}>Remaining Debt</Text>
                 </View>
                 <View style={styles.legendItem}>
                   <View
                     style={[
                       styles.legendColor,
                       { backgroundColor: COLORS.success },
                     ]}
                   />
                   <Text style={styles.legendText}>Paid Off</Text>
                 </View>
               </View>
             </View>
           </View>

                     {/* Debt Breakdown */}
           <View style={styles.chartSection}>
             <Text style={styles.sectionTitle}>Current Debt Breakdown</Text>
             <View style={styles.chartCard}>
               <View style={styles.debtBreakdownContainer}>
                 {data.debtBreakdown.map((item, index) => (
                   <View key={index} style={styles.debtBreakdownItem}>
                     <View style={styles.debtBreakdownHeader}>
                       <View
                         style={[
                           styles.debtBreakdownColor,
                           { backgroundColor: item.color },
                         ]}
                       />
                       <Text style={styles.debtBreakdownName}>{item.debt}</Text>
                     </View>
                     <View style={styles.debtBreakdownBar}>
                       <View 
                         style={[
                           styles.debtBreakdownFill, 
                           { 
                             width: `${(item.balance / totalDebt) * 100}%`,
                             backgroundColor: item.color 
                           }
                         ]} 
                       />
                     </View>
                     <Text style={styles.debtBreakdownValue}>
                       {formatCurrency(Number(item.balance), validCurrency)}
                     </Text>
                   </View>
                 ))}
               </View>
             </View>
           </View>

          {/* Monthly Payment Comparison */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Monthly Payment Performance</Text>
            <View style={styles.chartCard}>
              <View style={styles.paymentComparisonContainer}>
                <View style={styles.paymentComparisonItem}>
                  <View style={styles.paymentComparisonHeader}>
                    <View
                      style={[
                        styles.paymentComparisonColor,
                        { backgroundColor: COLORS.gray },
                      ]}
                    />
                    <Text style={styles.paymentComparisonLabel}>Minimum Required</Text>
                  </View>
                  <Text style={styles.paymentComparisonValue}>
                    {formatCurrency(Number(totalMonthlyPayments), validCurrency)}
                  </Text>
                  <View style={styles.paymentComparisonBar}>
                    <View 
                      style={[
                        styles.paymentComparisonFill, 
                        { 
                          width: '100%',
                          backgroundColor: COLORS.gray 
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.paymentComparisonItem}>
                  <View style={styles.paymentComparisonHeader}>
                    <View
                      style={[
                        styles.paymentComparisonColor,
                        { backgroundColor: COLORS.primary },
                      ]}
                    />
                    <Text style={styles.paymentComparisonLabel}>Recommended Payment</Text>
                  </View>
                  <Text style={styles.paymentComparisonValue}>
                    {formatCurrency(Number(totalMonthlyPayments * 1.2), validCurrency)}
                  </Text>
                  <View style={styles.paymentComparisonBar}>
                    <View 
                      style={[
                        styles.paymentComparisonFill, 
                        { 
                          width: '120%',
                          backgroundColor: COLORS.primary 
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Interest vs Principal */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Interest vs Principal Payments
            </Text>
            <View style={styles.chartCard}>
              <View style={styles.interestPrincipalContainer}>
                <View style={styles.interestPrincipalItem}>
                  <View style={styles.interestPrincipalHeader}>
                    <View
                      style={[
                        styles.interestPrincipalColor,
                        { backgroundColor: COLORS.danger },
                      ]}
                    />
                    <Text style={styles.interestPrincipalLabel}>Interest Paid</Text>
                  </View>
                  <Text style={styles.interestPrincipalValue}>
                    {formatCurrency(Number(data.totalInterestSaved), validCurrency)}
                  </Text>
                  <View style={styles.interestPrincipalBar}>
                    <View 
                      style={[
                        styles.interestPrincipalFill, 
                        { 
                          width: `${(data.totalInterestSaved / totalPaidOff) * 100}%`,
                          backgroundColor: COLORS.danger 
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.interestPrincipalItem}>
                  <View style={styles.interestPrincipalHeader}>
                    <View
                      style={[
                        styles.interestPrincipalColor,
                        { backgroundColor: COLORS.success },
                      ]}
                    />
                    <Text style={styles.interestPrincipalLabel}>Principal Paid</Text>
                  </View>
                  <Text style={styles.interestPrincipalValue}>
                    {formatCurrency(Number(totalPaidOff - data.totalInterestSaved), validCurrency)}
                  </Text>
                  <View style={styles.interestPrincipalBar}>
                    <View 
                      style={[
                        styles.interestPrincipalFill, 
                        { 
                          width: `${((totalPaidOff - data.totalInterestSaved) / totalPaidOff) * 100}%`,
                          backgroundColor: COLORS.success 
                        }
                      ]} 
                    />
                  </View>
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
                  <Text style={styles.summaryValue}>
                    {payoffPercentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.summaryLabel}>Debt Eliminated</Text>
                </View>
                <View style={styles.summaryItem}>
                  <DollarSign size={24} color={COLORS.primary} />
                  <Text style={styles.summaryValue}>
                    {formatCurrency(Number(totalPaidOff), validCurrency)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Paid Off</Text>
                </View>
              </View>

              <View style={styles.projectionContainer}>
                <Text style={styles.projectionTitle}>
                  Projected Debt-Free Date
                </Text>
                <Text style={styles.projectionDate}>
                  {new Date(data.projectedPayoffDate).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
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
                  You're making great progress on your debt repayment journey.
                  Keep up the consistent payments to save more on interest.
                </Text>
              </View>
            </View>

            <View style={styles.recommendationCard}>
              <DollarSign size={24} color={COLORS.warning} />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>
                  Optimization Opportunity
                </Text>
                <Text style={styles.recommendationText}>
                  Consider the avalanche method to reduce interest payments. You
                  could save an additional $500 in interest over the life of
                  your debts.
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
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressStats: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  debtBreakdownContainer: {
    gap: 16,
  },
  debtBreakdownItem: {
    marginBottom: 12,
  },
  debtBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  debtBreakdownColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  debtBreakdownName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  debtBreakdownBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  debtBreakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  debtBreakdownValue: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  paymentComparisonContainer: {
    gap: 16,
  },
  paymentComparisonItem: {
    marginBottom: 16,
  },
  paymentComparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  paymentComparisonColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paymentComparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  paymentComparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  paymentComparisonBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  paymentComparisonFill: {
    height: '100%',
    borderRadius: 4,
  },
  interestPrincipalContainer: {
    gap: 16,
  },
  interestPrincipalItem: {
    marginBottom: 16,
  },
  interestPrincipalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  interestPrincipalColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  interestPrincipalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  interestPrincipalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  interestPrincipalBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  interestPrincipalFill: {
    height: '100%',
    borderRadius: 4,
  },
});
