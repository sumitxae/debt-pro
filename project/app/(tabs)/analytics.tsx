import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetAnalyticsQuery } from '@/store/api/debtApi';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryPie, 
  VictoryBar,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel
} from 'victory-native';
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

// Mock analytics data - would come from backend in real app
const mockAnalyticsData = {
  debtToIncomeRatio: 28.5,
  monthlyPaymentRatio: 15.2,
  averageInterestRate: 18.7,
  totalInterestSaved: 2450,
  projectedPayoffDate: '2026-08-15',
  progressData: [
    { month: 'Jan 2024', totalDebt: 25000, paidOff: 0 },
    { month: 'Feb 2024', totalDebt: 23500, paidOff: 1500 },
    { month: 'Mar 2024', totalDebt: 22200, paidOff: 2800 },
    { month: 'Apr 2024', totalDebt: 20800, paidOff: 4200 },
    { month: 'May 2024', totalDebt: 19500, paidOff: 5500 },
    { month: 'Jun 2024', totalDebt: 18100, paidOff: 6900 },
  ],
  debtBreakdown: [
    { debt: 'Credit Card 1', balance: 8500, color: COLORS.danger },
    { debt: 'Credit Card 2', balance: 4200, color: COLORS.warning },
    { debt: 'Personal Loan', balance: 3800, color: COLORS.primary },
    { debt: 'Car Loan', balance: 1600, color: COLORS.success },
  ],
  monthlyPayments: [
    { month: 'Jan', minimum: 750, actual: 1200 },
    { month: 'Feb', minimum: 750, actual: 1350 },
    { month: 'Mar', minimum: 750, actual: 1100 },
    { month: 'Apr', minimum: 750, actual: 1400 },
    { month: 'May', minimum: 750, actual: 1250 },
    { month: 'Jun', minimum: 750, actual: 1300 },
  ],
  interestVsPrincipal: [
    { month: 'Jan', interest: 320, principal: 880 },
    { month: 'Feb', interest: 290, principal: 1060 },
    { month: 'Mar', interest: 275, principal: 825 },
    { month: 'Apr', interest: 245, principal: 1155 },
    { month: 'May', interest: 230, principal: 1020 },
    { month: 'Jun', interest: 210, principal: 1090 },
  ],
};

export default function AnalyticsScreen() {
  const { list: debts } = useSelector((state: RootState) => state.debts);
  const { monthlyIncome } = useSelector((state: RootState) => state.budget);
  
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery();
  
  // Use mock data for demo - replace with real data from API
  const data = mockAnalyticsData;
  
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.originalAmount, 0);
  const totalPaidOff = totalOriginalDebt - totalDebt;
  const payoffPercentage = totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0;

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
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
              padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t) => `$${t/1000}k`} />
              <VictoryAxis />
              <VictoryArea
                data={data.progressData}
                x="month"
                y="totalDebt"
                style={{
                  data: { fill: COLORS.danger, fillOpacity: 0.3, stroke: COLORS.danger, strokeWidth: 2 }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
              <VictoryLine
                data={data.progressData}
                x="month"
                y="paidOff"
                style={{
                  data: { stroke: COLORS.success, strokeWidth: 3 }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
            </VictoryChart>
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
            <VictoryPie
              data={data.debtBreakdown}
              x="debt"
              y="balance"
              width={width - 80}
              height={250}
              colorScale={data.debtBreakdown.map(item => item.color)}
              labelComponent={<VictoryLabel style={{ fill: "white", fontSize: 14, fontWeight: "bold" }} />}
              animate={{
                duration: 1000
              }}
            />
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
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
              padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t) => `$${t}`} />
              <VictoryAxis />
              <VictoryBar
                data={data.monthlyPayments}
                x="month"
                y="minimum"
                style={{
                  data: { fill: COLORS.gray, fillOpacity: 0.7 }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
              <VictoryBar
                data={data.monthlyPayments}
                x="month"
                y="actual"
                style={{
                  data: { fill: COLORS.primary }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
            </VictoryChart>
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
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
              padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
            >
              <VictoryAxis dependentAxis tickFormat={(t) => `$${t}`} />
              <VictoryAxis />
              <VictoryBar
                data={data.interestVsPrincipal}
                x="month"
                y="interest"
                style={{
                  data: { fill: COLORS.danger }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
              <VictoryBar
                data={data.interestVsPrincipal}
                x="month"
                y="principal"
                style={{
                  data: { fill: COLORS.success }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
              />
            </VictoryChart>
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
});