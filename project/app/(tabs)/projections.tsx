import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCalculateProjectionMutation, useGetProjectionsQuery } from '@/store/api/debtApi';
import { Calculator, Plus, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react-native';

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

export default function ProjectionsScreen() {
  const { list: debts } = useSelector((state: RootState) => state.debts);
  const { availableForDebt } = useSelector((state: RootState) => state.budget);
  const { scenarios } = useSelector((state: RootState) => state.projections);
  
  const [selectedStrategy, setSelectedStrategy] = useState<'snowball' | 'avalanche' | 'custom'>('snowball');
  const [monthlyExtra, setMonthlyExtra] = useState('0');
  const [lumpSums, setLumpSums] = useState<any[]>([]);
  const [currentProjection, setCurrentProjection] = useState<any>(null);
  
  const [calculateProjection, { isLoading: calculating }] = useCalculateProjectionMutation();
  const { data: projectionsData } = useGetProjectionsQuery();

  const activeDebts = debts.filter(debt => debt.status === 'active');
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = activeDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  useEffect(() => {
    if (activeDebts.length > 0) {
      handleCalculateProjection();
    }
  }, [selectedStrategy, monthlyExtra]);

  const handleCalculateProjection = async () => {
    if (activeDebts.length === 0) {
      Alert.alert('No Active Debts', 'Add some debts first to see projections');
      return;
    }

    try {
      const result = await calculateProjection({
        strategy: selectedStrategy,
        monthlyExtra: parseFloat(monthlyExtra) || 0,
        lumpSums,
      }).unwrap();
      
      setCurrentProjection(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate projection');
    }
  };

  const addLumpSum = () => {
    setLumpSums([
      ...lumpSums,
      {
        amount: 0,
        month: new Date().toISOString().slice(0, 7),
        description: 'Tax refund',
      },
    ]);
  };

  const removeLumpSum = (index: number) => {
    setLumpSums(lumpSums.filter((_, i) => i !== index));
  };

  const updateLumpSum = (index: number, field: string, value: any) => {
    const updated = [...lumpSums];
    updated[index] = { ...updated[index], [field]: value };
    setLumpSums(updated);
  };

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'snowball':
        return 'Pay minimums on all debts, put extra money toward smallest balance first';
      case 'avalanche':
        return 'Pay minimums on all debts, put extra money toward highest interest rate first';
      case 'custom':
        return 'Pay debts in your preferred order';
      default:
        return '';
    }
  };

  const formatMonthsToPayoff = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Debt Projections</Text>
          <Text style={styles.headerSubtitle}>
            Plan your path to debt freedom
          </Text>
        </View>
        <Calculator size={32} color={COLORS.primary} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Debt Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Current Debt Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${totalDebt.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Debt</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${totalMinimumPayments.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Min Payments</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${availableForDebt.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Available Extra</Text>
            </View>
          </View>
        </View>

        {/* Strategy Selector */}
        <View style={styles.strategySection}>
          <Text style={styles.sectionTitle}>Payoff Strategy</Text>
          <View style={styles.strategyButtons}>
            {(['snowball', 'avalanche', 'custom'] as const).map((strategy) => (
              <TouchableOpacity
                key={strategy}
                style={[
                  styles.strategyButton,
                  selectedStrategy === strategy && styles.selectedStrategy,
                ]}
                onPress={() => setSelectedStrategy(strategy)}
              >
                <Text
                  style={[
                    styles.strategyButtonText,
                    selectedStrategy === strategy && styles.selectedStrategyText,
                  ]}
                >
                  {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.strategyDescription}>
            {getStrategyDescription(selectedStrategy)}
          </Text>
        </View>

        {/* Monthly Extra Payment */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Monthly Extra Payment</Text>
          <View style={styles.extraPaymentContainer}>
            <TextInput
              style={styles.extraPaymentInput}
              value={monthlyExtra}
              onChangeText={setMonthlyExtra}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            <Text style={styles.availableText}>
              Available: ${availableForDebt.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Lump Sum Payments */}
        <View style={styles.lumpSumSection}>
          <View style={styles.lumpSumHeader}>
            <Text style={styles.sectionTitle}>Lump Sum Payments</Text>
            <TouchableOpacity style={styles.addLumpSumButton} onPress={addLumpSum}>
              <Plus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {lumpSums.map((lumpSum, index) => (
            <View key={index} style={styles.lumpSumItem}>
              <View style={styles.lumpSumInputs}>
                <TextInput
                  style={styles.lumpSumAmount}
                  value={lumpSum.amount.toString()}
                  onChangeText={(value) => updateLumpSum(index, 'amount', parseFloat(value) || 0)}
                  placeholder="Amount"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={styles.lumpSumMonth}
                  value={lumpSum.month}
                  onChangeText={(value) => updateLumpSum(index, 'month', value)}
                  placeholder="YYYY-MM"
                />
              </View>
              <TouchableOpacity
                style={styles.removeLumpSumButton}
                onPress={() => removeLumpSum(index)}
              >
                <Text style={styles.removeLumpSumText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Projection Results */}
        {currentProjection && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Projection Results</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Calendar size={24} color={COLORS.success} />
                <Text style={styles.resultTitle}>Debt-Free Date</Text>
              </View>
              <Text style={styles.resultValue}>
                {new Date(currentProjection.projectedPayoffDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.resultSubtext}>
                {formatMonthsToPayoff(currentProjection.monthsToPayoff || 24)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <DollarSign size={20} color={COLORS.warning} />
                  <Text style={styles.resultLabel}>Total Interest</Text>
                </View>
                <Text style={styles.resultAmount}>
                  ${currentProjection.totalInterestPaid?.toLocaleString() || '0'}
                </Text>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <TrendingUp size={20} color={COLORS.success} />
                  <Text style={styles.resultLabel}>Interest Saved</Text>
                </View>
                <Text style={styles.resultAmount}>
                  ${currentProjection.totalInterestSaved?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>

            {/* Payment Schedule Preview */}
            <View style={styles.schedulePreview}>
              <Text style={styles.sectionTitle}>Next 6 Months</Text>
              {currentProjection.monthlySchedule?.slice(0, 6).map((month: any, index: number) => (
                <View key={index} style={styles.monthRow}>
                  <Text style={styles.monthName}>
                    {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={styles.monthPayment}>
                    ${month.totalPayment?.toLocaleString() || '0'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Strategy Comparison */}
        {scenarios.length > 0 && (
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Strategy Comparison</Text>
            {scenarios.map((scenario) => (
              <View key={scenario.id} style={styles.comparisonCard}>
                <View style={styles.comparisonHeader}>
                  <Text style={styles.comparisonTitle}>{scenario.name}</Text>
                  <Text style={styles.comparisonStrategy}>
                    {scenario.strategy.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.comparisonMetrics}>
                  <View style={styles.comparisonMetric}>
                    <Text style={styles.comparisonValue}>
                      {formatMonthsToPayoff(scenario.monthlySchedule?.length || 0)}
                    </Text>
                    <Text style={styles.comparisonLabel}>Payoff Time</Text>
                  </View>
                  <View style={styles.comparisonMetric}>
                    <Text style={styles.comparisonValue}>
                      ${scenario.totalInterestPaid?.toLocaleString() || '0'}
                    </Text>
                    <Text style={styles.comparisonLabel}>Total Interest</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State for No Debts */}
        {activeDebts.length === 0 && (
          <View style={styles.emptyState}>
            <Calculator size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No Active Debts</Text>
            <Text style={styles.emptySubtitle}>
              Add some debts to see your debt payoff projections
            </Text>
          </View>
        )}
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  strategySection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  strategyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  selectedStrategy: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  strategyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedStrategyText: {
    color: COLORS.white,
  },
  strategyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  extraPaymentContainer: {
    alignItems: 'center',
  },
  extraPaymentInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    width: '100%',
    marginBottom: 8,
  },
  availableText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  lumpSumSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lumpSumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addLumpSumButton: {
    padding: 8,
  },
  lumpSumItem: {
    marginBottom: 12,
  },
  lumpSumInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  lumpSumAmount: {
    flex: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  lumpSumMonth: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeLumpSumButton: {
    alignSelf: 'flex-end',
  },
  removeLumpSumText: {
    fontSize: 14,
    color: COLORS.danger,
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resultSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 16,
  },
  schedulePreview: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  monthPayment: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  comparisonSection: {
    marginBottom: 40,
  },
  comparisonCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  comparisonStrategy: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  comparisonMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonMetric: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  comparisonLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});