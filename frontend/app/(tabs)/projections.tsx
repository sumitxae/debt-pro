import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  useGetDebtsQuery, 
  useGetBudgetQuery, 
  useRecordPaymentMutation,
} from '@/store/api/debtApi';
import { formatCurrency } from '@/src/utils/currencyUtils';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  Edit3,
  CheckCircle,
  Clock,
  Zap,
  AlertCircle,
  ChevronRight,
} from 'lucide-react-native';

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

type PaymentStrategy = 'minimum' | 'snowball' | 'avalanche' | 'custom';

interface DebtWithPriority {
  id: string;
  name: string;
  balance: number;
  originalAmount: number;
  minimumPayment: number;
  interestRate: number;
  priority: number;
  strategyPriority: number;
  recommendedPayment: number;
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
}

interface DebtOverview {
  debtId: string;
  monthlyPayment: number;
  payoffDate: Date;
  totalPayments: number;
  totalInterest: number;
  monthlyBreakdown: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>;
}

export default function ProjectionsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: debtsData, isLoading: debtsLoading } = useGetDebtsQuery();
  const { data: budgetData, isLoading: budgetLoading } = useGetBudgetQuery();

  // State management
  const [monthlyDebtBudget, setMonthlyDebtBudget] = useState(0);
  const [strategy, setStrategy] = useState<PaymentStrategy>('snowball');
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  const [overviewModalVisible, setOverviewModalVisible] = useState(false);
  const [selectedDebtOverview, setSelectedDebtOverview] = useState<DebtOverview | null>(null);

  const userCurrency = user?.preferences?.currency || 'USD';
  
  const debts = useMemo(() => {
    return Array.isArray(debtsData) ? debtsData.filter(debt => debt.status === 'active') : [];
  }, [debtsData]);
  
  const availableForDebt = useMemo(() => {
    if (!budgetData) return 0;
    const monthlyIncome = Number(budgetData.monthlyIncome) || 0;
    const totalExpenses = Object.values(budgetData.expenses || {}).reduce((sum, exp) => sum + (Number(exp) || 0), 0);
    const homeContribution = Number(budgetData.homeContribution) || 0;
    return Math.max(0, monthlyIncome - totalExpenses - homeContribution);
  }, [budgetData]);

  // Initialize debt budget
  useEffect(() => {
    if (availableForDebt > 0 && monthlyDebtBudget === 0) {
      const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      setMonthlyDebtBudget(Math.min(availableForDebt, totalMinimumPayments * 1.5));
    }
  }, [availableForDebt, debts]);

  const calculatePayoffDetails = (balance: number, monthlyPayment: number, interestRate: number) => {
    if (monthlyPayment <= 0 || balance <= 0) {
      return { monthsToPayoff: 0, totalInterestPaid: 0, totalAmountPaid: 0 };
    }

    const monthlyInterestRate = interestRate / 100 / 12;
    
    if (monthlyInterestRate === 0) {
      // No interest
      const months = Math.ceil(balance / monthlyPayment);
      return {
        monthsToPayoff: months,
        totalInterestPaid: 0,
        totalAmountPaid: Math.min(balance, months * monthlyPayment),
      };
    }

    // Check if payment covers interest
    if (monthlyPayment <= balance * monthlyInterestRate) {
      return {
        monthsToPayoff: Infinity,
        totalInterestPaid: Infinity,
        totalAmountPaid: Infinity,
      };
    }

    // Calculate months to payoff
    const monthsToPayoff = Math.ceil(
      -Math.log(1 - (balance * monthlyInterestRate) / monthlyPayment) / Math.log(1 + monthlyInterestRate)
    );

    // Calculate total amounts
    const totalAmountPaid = monthsToPayoff * monthlyPayment;
    const totalInterestPaid = totalAmountPaid - balance;

    return {
      monthsToPayoff,
      totalInterestPaid: Math.max(0, totalInterestPaid),
      totalAmountPaid,
    };
  };

  // Calculate debt payment strategy and projections
  const debtProjections = useMemo((): DebtWithPriority[] => {
    if (debts.length === 0 || monthlyDebtBudget === 0) return [];

    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraAmount = Math.max(0, monthlyDebtBudget - totalMinimumPayments);

    // Sort debts based on strategy
    let sortedDebts = [...debts];
    switch (strategy) {
      case 'snowball':
        sortedDebts.sort((a, b) => a.balance - b.balance);
        break;
      case 'avalanche':
        sortedDebts.sort((a, b) => b.interestRate - a.interestRate);
        break;
      case 'minimum':
        // Keep original order for minimum payments
        break;
      case 'custom':
        sortedDebts.sort((a, b) => a.priority - b.priority);
        break;
    }

    return sortedDebts.map((debt, index) => {
      let recommendedPayment = debt.minimumPayment;
      
      // For non-minimum strategies, allocate extra payment to highest priority debt
      if (strategy !== 'minimum' && index === 0) {
        recommendedPayment += extraAmount;
      }

      const { monthsToPayoff, totalInterestPaid, totalAmountPaid } = calculatePayoffDetails(
        debt.balance,
        recommendedPayment,
        debt.interestRate
      );

      return {
        ...debt,
        strategyPriority: index + 1,
        recommendedPayment,
        monthsToPayoff,
        totalInterestPaid,
        totalAmountPaid,
      };
    });
  }, [debts, strategy, monthlyDebtBudget]);

  const generateDebtOverview = (debt: DebtWithPriority): DebtOverview => {
    const monthlyBreakdown = [];
    let currentBalance = debt.balance;
    let totalPayments = 0;
    let totalInterest = 0;
    const monthlyInterestRate = debt.interestRate / 100 / 12;
    let month = 0;

    while (currentBalance > 0.01 && month < 360) { // Max 30 years
      month++;
      const interestPayment = currentBalance * monthlyInterestRate;
      const principalPayment = Math.min(debt.recommendedPayment - interestPayment, currentBalance);
      
      if (principalPayment <= 0) break; // Payment doesn't cover interest

      currentBalance -= principalPayment;
      totalPayments += debt.recommendedPayment;
      totalInterest += interestPayment;

      monthlyBreakdown.push({
        month,
        payment: debt.recommendedPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, currentBalance),
      });

      if (currentBalance <= 0) break;
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + month);

    return {
      debtId: debt.id,
      monthlyPayment: debt.recommendedPayment,
      payoffDate,
      totalPayments,
      totalInterest,
      monthlyBreakdown,
    };
  };

  const handleSaveBudget = () => {
    const amount = parseFloat(tempBudget);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    if (amount < totalMinimumPayments) {
      Alert.alert('Error', `Budget must cover minimum payments (${formatCurrency(totalMinimumPayments, userCurrency)})`);
      return;
    }

    if (amount > availableForDebt) {
      Alert.alert('Error', `Amount cannot exceed available budget (${formatCurrency(availableForDebt, userCurrency)})`);
      return;
    }

    setMonthlyDebtBudget(amount);
    setBudgetModalVisible(false);
    setTempBudget('');
  };

  const openDebtOverview = (debt: DebtWithPriority) => {
    const overview = generateDebtOverview(debt);
    setSelectedDebtOverview(overview);
    setOverviewModalVisible(true);
  };

  const getStrategyDescription = (strategy: PaymentStrategy) => {
    switch (strategy) {
      case 'minimum':
        return 'Pay only minimum payments - lowest monthly cost but highest total interest';
      case 'snowball':
        return 'Focus on smallest balances first - builds momentum and motivation';
      case 'avalanche':
        return 'Focus on highest interest rates first - saves the most money';
      case 'custom':
        return 'Pay debts in your preferred priority order';
      default:
        return '';
    }
  };

  const getStrategyIcon = (strategy: PaymentStrategy) => {
    switch (strategy) {
      case 'minimum': return <Clock size={20} color={COLORS.gray} />;
      case 'snowball': return <Target size={20} color={COLORS.success} />;
      case 'avalanche': return <TrendingUp size={20} color={COLORS.primary} />;
      case 'custom': return <Edit3 size={20} color={COLORS.warning} />;
      default: return null;
    }
  };

  const getPriorityBadgeColor = (priority: number) => {
    if (priority === 1) return COLORS.danger; // Highest priority - red
    if (priority === 2) return COLORS.warning; // Medium priority - orange
    return COLORS.gray; // Lower priority - gray
  };

  if (debtsLoading || budgetLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Calculating projections...</Text>
      </View>
    );
  }

  if (debts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Debt Projections</Text>
        </View>
        <View style={styles.emptyState}>
          <Calculator size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>No Active Debts</Text>
          <Text style={styles.emptySubtitle}>
            Add some debts to see your personalized payoff strategy
          </Text>
        </View>
      </View>
    );
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const totalRecommendedPayments = debtProjections.reduce((sum, debt) => sum + debt.recommendedPayment, 0);
  const extraPayment = totalRecommendedPayments - totalMinimumPayments;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Debt Strategy</Text>
          <Text style={styles.headerSubtitle}>
            Smart recommendations for debt elimination
          </Text>
        </View>
        <Calculator size={32} color={COLORS.primary} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Monthly Debt Budget</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempBudget(monthlyDebtBudget.toString());
                setBudgetModalVisible(true);
              }}
            >
              <Edit3 size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.budgetGrid}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetValue}>{formatCurrency(monthlyDebtBudget, userCurrency)}</Text>
              <Text style={styles.budgetLabel}>Total Budget</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetValue}>{formatCurrency(extraPayment, userCurrency)}</Text>
              <Text style={styles.budgetLabel}>Extra Payment</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetValue}>{formatCurrency(availableForDebt, userCurrency)}</Text>
              <Text style={styles.budgetLabel}>Available</Text>
            </View>
          </View>

          {monthlyDebtBudget < totalMinimumPayments && (
            <View style={styles.warningBanner}>
              <AlertCircle size={16} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Budget is below minimum payments required ({formatCurrency(totalMinimumPayments, userCurrency)})
              </Text>
            </View>
          )}
        </View>

        {/* Strategy Selector */}
        <View style={styles.strategySection}>
          <Text style={styles.sectionTitle}>Payment Strategy</Text>
          
          <View style={styles.strategyButtons}>
            {(['snowball', 'avalanche', 'minimum', 'custom'] as PaymentStrategy[]).map((strat) => (
              <TouchableOpacity
                key={strat}
                style={[
                  styles.strategyButton,
                  strategy === strat && styles.selectedStrategy,
                ]}
                onPress={() => setStrategy(strat)}
              >
                <View style={styles.strategyButtonContent}>
                  {getStrategyIcon(strat)}
                  <Text style={[
                    styles.strategyButtonText,
                    strategy === strat && styles.selectedStrategyText,
                  ]}>
                    {strat.charAt(0).toUpperCase() + strat.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.strategyDescription}>
            <Text style={styles.strategyDescriptionText}>
              {getStrategyDescription(strategy)}
            </Text>
          </View>
        </View>

        {/* Recommended Payment Order */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended Payment Order</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any debt to see detailed payoff projections
          </Text>
          
          {debtProjections.map((debt, index) => (
            <TouchableOpacity 
              key={debt.id} 
              style={styles.debtCard}
              onPress={() => openDebtOverview(debt)}
            >
              <View style={styles.debtHeader}>
                <View style={styles.debtPriority}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityBadgeColor(debt.strategyPriority) }
                  ]}>
                    <Text style={styles.priorityText}>#{debt.strategyPriority}</Text>
                  </View>
                  <View>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    <Text style={styles.debtBalance}>
                      {formatCurrency(debt.balance, userCurrency)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </View>

              <View style={styles.debtDetails}>
                <View style={styles.debtMetric}>
                  <DollarSign size={14} color={COLORS.textLight} />
                  <Text style={styles.metricLabel}>Monthly Payment:</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(debt.recommendedPayment, userCurrency)}
                  </Text>
                  {debt.recommendedPayment > debt.minimumPayment && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.extraText}>
                        +{formatCurrency(debt.recommendedPayment - debt.minimumPayment, userCurrency)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.debtMetric}>
                  <Calendar size={14} color={COLORS.textLight} />
                  <Text style={styles.metricLabel}>Payoff Time:</Text>
                  <Text style={styles.metricValue}>
                    {debt.monthsToPayoff === Infinity 
                      ? 'Never (payment too low)' 
                      : `${debt.monthsToPayoff} months`
                    }
                  </Text>
                </View>

                <View style={styles.debtMetric}>
                  <TrendingUp size={14} color={COLORS.textLight} />
                  <Text style={styles.metricLabel}>Interest Rate:</Text>
                  <Text style={styles.metricValue}>{debt.interestRate}%</Text>
                </View>
              </View>

              {debt.strategyPriority === 1 && strategy !== 'minimum' && (
                <View style={styles.focusIndicator}>
                  <Zap size={16} color={COLORS.primary} />
                  <Text style={styles.focusText}>Focus debt - pay extra here first</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Strategy Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalRecommendedPayments, userCurrency)}
              </Text>
              <Text style={styles.summaryLabel}>Total Monthly</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {Math.min(...debtProjections.filter(d => d.monthsToPayoff !== Infinity).map(d => d.monthsToPayoff)) || 0}
              </Text>
              <Text style={styles.summaryLabel}>First Debt Free</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {formatCurrency(
                  debtProjections.reduce((sum, debt) => sum + (debt.totalInterestPaid === Infinity ? 0 : debt.totalInterestPaid), 0),
                  userCurrency
                )}
              </Text>
              <Text style={styles.summaryLabel}>Total Interest</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={budgetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Monthly Debt Budget</Text>
            <Text style={styles.modalSubtitle}>
              Available: {formatCurrency(availableForDebt, userCurrency)}
            </Text>
            <Text style={styles.modalSubtitle}>
              Minimum Required: {formatCurrency(totalMinimumPayments, userCurrency)}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Amount</Text>
              <TextInput
                style={styles.budgetInput}
                value={tempBudget}
                onChangeText={setTempBudget}
                placeholder="0.00"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setBudgetModalVisible(false);
                  setTempBudget('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSaveBudget}
              >
                <Text style={styles.confirmButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Debt Overview Modal */}
      <Modal
        visible={overviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOverviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.overviewModalContent}>
            <Text style={styles.modalTitle}>Debt Payoff Overview</Text>
            {selectedDebtOverview && (
              <>
                <Text style={styles.modalSubtitle}>
                  {debtProjections.find(d => d.id === selectedDebtOverview.debtId)?.name}
                </Text>

                <ScrollView style={styles.overviewScroll}>
                  <View style={styles.overviewSummary}>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Monthly Payment:</Text>
                      <Text style={styles.overviewValue}>
                        {formatCurrency(selectedDebtOverview.monthlyPayment, userCurrency)}
                      </Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Payoff Date:</Text>
                      <Text style={styles.overviewValue}>
                        {selectedDebtOverview.payoffDate.toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Total Payments:</Text>
                      <Text style={styles.overviewValue}>
                        {formatCurrency(selectedDebtOverview.totalPayments, userCurrency)}
                      </Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={styles.overviewLabel}>Total Interest:</Text>
                      <Text style={styles.overviewValue}>
                        {formatCurrency(selectedDebtOverview.totalInterest, userCurrency)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.breakdownTitle}>Payment Breakdown (First 12 Months)</Text>
                  {selectedDebtOverview.monthlyBreakdown.slice(0, 12).map((month) => (
                    <View key={month.month} style={styles.breakdownRow}>
                      <Text style={styles.monthText}>Month {month.month}</Text>
                      <View style={styles.breakdownDetails}>
                        <Text style={styles.breakdownText}>
                          Principal: {formatCurrency(month.principal, userCurrency)}
                        </Text>
                        <Text style={styles.breakdownText}>
                          Interest: {formatCurrency(month.interest, userCurrency)}
                        </Text>
                        <Text style={styles.breakdownText}>
                          Remaining: {formatCurrency(month.remainingBalance, userCurrency)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setOverviewModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  budgetCard: {
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
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editButton: {
    padding: 8,
  },
  budgetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItem: {
    alignItems: 'center',
    flex: 1,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: COLORS.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  strategyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  strategyButton: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  selectedStrategy: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  strategyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  strategyDescriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  debtCard: {
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
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debtPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  debtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  debtBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  debtDetails: {
    gap: 8,
  },
  debtMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  extraBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  extraText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  focusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  focusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  summarySection: {
    marginBottom: 40,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  overviewModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  budgetInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  overviewScroll: {
    maxHeight: 400,
  },
  overviewSummary: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  breakdownRow: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  breakdownDetails: {
    gap: 4,
  },
  breakdownText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});