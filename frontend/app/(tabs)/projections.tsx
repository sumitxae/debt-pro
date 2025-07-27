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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  useGetDebtsQuery, 
  useGetBudgetQuery, 
  useRecordPaymentMutation,
  useUpdateBudgetMutation 
} from '@/store/api/debtApi';
import { formatCurrency } from '@/src/utils/currencyUtils';
import { 
  Calculator, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  Edit3,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Save,
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

interface DebtAllocation {
  debtId: string;
  monthlyAmount: number;
  isMinimum: boolean;
}

export default function ProjectionsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: debtsData, isLoading: debtsLoading } = useGetDebtsQuery();
  const { data: budgetData, isLoading: budgetLoading } = useGetBudgetQuery();
  const [recordPayment, { isLoading: recordingPayment }] = useRecordPaymentMutation();
  const [updateBudget] = useUpdateBudgetMutation();

  // State management
  const [monthlyInvestment, setMonthlyInvestment] = useState(0);
  const [strategy, setStrategy] = useState<PaymentStrategy>('snowball');
  const [autoDistribute, setAutoDistribute] = useState(true);
  const [debtAllocations, setDebtAllocations] = useState<DebtAllocation[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [investmentModalVisible, setInvestmentModalVisible] = useState(false);
  const [tempInvestment, setTempInvestment] = useState('');

  const userCurrency = user?.preferences?.currency || 'USD';
  const debts = Array.isArray(debtsData) ? debtsData.filter(debt => debt.status === 'active') : [];
  const availableForDebt = budgetData ? 
    (Number(budgetData.monthlyIncome) || 0) - Object.values(budgetData.expenses || {}).reduce((sum, exp) => sum + (Number(exp) || 0), 0) : 0;

  // Initialize monthly investment from available budget
  useEffect(() => {
    if (availableForDebt > 0 && monthlyInvestment === 0) {
      setMonthlyInvestment(Math.min(availableForDebt, debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)));
    }
  }, [availableForDebt, debts]);

  // Auto-distribute payments when strategy or investment changes
  useEffect(() => {
    if (autoDistribute && debts.length > 0 && monthlyInvestment > 0) {
      distributePayments();
    }
  }, [monthlyInvestment, strategy, autoDistribute, debts]);

  const distributePayments = () => {
    const totalMinimum = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraAmount = Math.max(0, monthlyInvestment - totalMinimum);
    
    let sortedDebts = [...debts];
    
    // Sort debts based on strategy
    switch (strategy) {
      case 'snowball':
        sortedDebts.sort((a, b) => a.balance - b.balance);
        break;
      case 'avalanche':
        sortedDebts.sort((a, b) => b.interestRate - a.interestRate);
        break;
      case 'minimum':
        // No extra allocation, just minimums
        break;
      case 'custom':
        sortedDebts.sort((a, b) => a.priority - b.priority);
        break;
    }

    const allocations: DebtAllocation[] = debts.map(debt => ({
      debtId: debt.id,
      monthlyAmount: debt.minimumPayment,
      isMinimum: true,
    }));

    // Allocate extra amount to first debt in strategy order
    if (extraAmount > 0 && strategy !== 'minimum' && sortedDebts.length > 0) {
      const targetDebt = allocations.find(alloc => alloc.debtId === sortedDebts[0].id);
      if (targetDebt) {
        targetDebt.monthlyAmount += extraAmount;
        targetDebt.isMinimum = false;
      }
    }

    setDebtAllocations(allocations);
  };

  const calculatePayoffDate = (debt: any, monthlyPayment: number) => {
    if (monthlyPayment <= 0 || debt.balance <= 0) return null;
    
    const monthlyRate = debt.interestRate / 100 / 12;
    if (monthlyRate === 0) {
      // No interest
      const months = Math.ceil(debt.balance / monthlyPayment);
      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + months);
      return payoffDate;
    }
    
    // With interest
    if (monthlyPayment <= debt.balance * monthlyRate) {
      return null; // Payment too low
    }
    
    const months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate)
    );
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    return payoffDate;
  };

  const handleRecordPayment = async () => {
    if (!selectedDebt || !paymentAmount) {
      Alert.alert('Error', 'Please enter a payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    if (amount > selectedDebt.balance) {
      Alert.alert('Error', 'Payment amount cannot exceed debt balance');
      return;
    }

    try {
      await recordPayment({
        debtId: selectedDebt.id,
        amount,
        paymentDate,
        paymentType: 'manual',
        notes: paymentNotes,
      }).unwrap();
      
      setPaymentModalVisible(false);
      setPaymentAmount('');
      setPaymentNotes('');
      setSelectedDebt(null);
      Alert.alert('Success', 'Payment recorded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const handleSaveInvestment = async () => {
    const amount = parseFloat(tempInvestment);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > availableForDebt) {
      Alert.alert('Error', `Amount cannot exceed available budget (${formatCurrency(availableForDebt, userCurrency)})`);
      return;
    }

    setMonthlyInvestment(amount);
    setInvestmentModalVisible(false);
    setTempInvestment('');
  };

  const adjustAllocation = (debtId: string, newAmount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const updatedAllocations = debtAllocations.map(alloc => {
      if (alloc.debtId === debtId) {
        return {
          ...alloc,
          monthlyAmount: Math.max(debt.minimumPayment, newAmount),
          isMinimum: newAmount <= debt.minimumPayment,
        };
      }
      return alloc;
    });

    // Check if total doesn't exceed monthly investment
    const total = updatedAllocations.reduce((sum, alloc) => sum + alloc.monthlyAmount, 0);
    if (total <= monthlyInvestment) {
      setDebtAllocations(updatedAllocations);
      setAutoDistribute(false); // Switch to manual mode
    } else {
      Alert.alert('Error', 'Total allocation cannot exceed monthly investment amount');
    }
  };

  const getStrategyDescription = (strategy: PaymentStrategy) => {
    switch (strategy) {
      case 'minimum':
        return 'Pay only minimum payments on all debts';
      case 'snowball':
        return 'Focus extra payments on smallest balance first';
      case 'avalanche':
        return 'Focus extra payments on highest interest rate first';
      case 'custom':
        return 'Pay debts in your preferred priority order';
      default:
        return '';
    }
  };

  if (debtsLoading || budgetLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading projections...</Text>
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
            Add some debts to see your debt payoff projections
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/debts/add')}
          >
            <Text style={styles.emptyButtonText}>Add Your First Debt</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const totalAllocated = debtAllocations.reduce((sum, alloc) => sum + alloc.monthlyAmount, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Debt Manager</Text>
          <Text style={styles.headerSubtitle}>
            Track payments & manage your debt elimination plan
          </Text>
        </View>
        <Calculator size={32} color={COLORS.primary} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Debt Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Debt Overview</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempInvestment(monthlyInvestment.toString());
                setInvestmentModalVisible(true);
              }}
            >
              <Edit3 size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(totalDebt, userCurrency)}</Text>
              <Text style={styles.summaryLabel}>Total Debt</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(monthlyInvestment, userCurrency)}</Text>
              <Text style={styles.summaryLabel}>Monthly Investment</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(availableForDebt, userCurrency)}</Text>
              <Text style={styles.summaryLabel}>Available Budget</Text>
            </View>
          </View>
        </View>

        {/* Strategy Selector */}
        <View style={styles.strategySection}>
          <Text style={styles.sectionTitle}>Payment Strategy</Text>
          <View style={styles.strategyButtons}>
            {(['minimum', 'snowball', 'avalanche', 'custom'] as PaymentStrategy[]).map((strat) => (
              <TouchableOpacity
                key={strat}
                style={[
                  styles.strategyButton,
                  strategy === strat && styles.selectedStrategy,
                ]}
                onPress={() => {
                  setStrategy(strat);
                  setAutoDistribute(true);
                }}
              >
                <Text
                  style={[
                    styles.strategyButtonText,
                    strategy === strat && styles.selectedStrategyText,
                  ]}
                >
                  {strat.charAt(0).toUpperCase() + strat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.strategyDescription}>
            {getStrategyDescription(strategy)}
          </Text>
          
          <View style={styles.distributionToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, autoDistribute && styles.toggleButtonActive]}
              onPress={() => setAutoDistribute(true)}
            >
              <Zap size={16} color={autoDistribute ? COLORS.white : COLORS.primary} />
              <Text style={[
                styles.toggleButtonText,
                autoDistribute && styles.toggleButtonTextActive
              ]}>
                Auto Distribute
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !autoDistribute && styles.toggleButtonActive]}
              onPress={() => setAutoDistribute(false)}
            >
              <Settings size={16} color={!autoDistribute ? COLORS.white : COLORS.primary} />
              <Text style={[
                styles.toggleButtonText,
                !autoDistribute && styles.toggleButtonTextActive
              ]}>
                Manual Control
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Debt Management Cards */}
        <View style={styles.debtsSection}>
          <Text style={styles.sectionTitle}>Debt Allocation & Tracking</Text>
          {debts.map((debt) => {
            const allocation = debtAllocations.find(alloc => alloc.debtId === debt.id);
            const monthlyPayment = allocation?.monthlyAmount || debt.minimumPayment;
            const payoffDate = calculatePayoffDate(debt, monthlyPayment);
            const progress = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
            
            return (
              <View key={debt.id} style={styles.debtCard}>
                <View style={styles.debtHeader}>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    <Text style={styles.debtBalance}>{formatCurrency(debt.balance, userCurrency)}</Text>
                    <Text style={styles.debtOriginal}>
                      of {formatCurrency(debt.originalAmount, userCurrency)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.recordPaymentButton}
                    onPress={() => {
                      setSelectedDebt(debt);
                      setPaymentAmount('');
                      setPaymentModalVisible(true);
                    }}
                  >
                    <DollarSign size={16} color={COLORS.white} />
                    <Text style={styles.recordPaymentText}>Pay</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.toFixed(1)}% paid off
                  </Text>
                </View>

                {/* Payment Allocation */}
                <View style={styles.allocationSection}>
                  <View style={styles.allocationHeader}>
                    <Text style={styles.allocationTitle}>Monthly Allocation</Text>
                    {!autoDistribute && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.prompt(
                            'Adjust Payment',
                            `Current: ${formatCurrency(monthlyPayment, userCurrency)}\nMinimum: ${formatCurrency(debt.minimumPayment, userCurrency)}`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Update',
                                onPress: (value) => {
                                  const amount = parseFloat(value || '0');
                                  if (!isNaN(amount)) {
                                    adjustAllocation(debt.id, amount);
                                  }
                                },
                              },
                            ],
                            'plain-text',
                            monthlyPayment.toString()
                          );
                        }}
                      >
                        <Edit3 size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.allocationDetails}>
                    <View style={styles.allocationItem}>
                      <Text style={styles.allocationLabel}>Allocated:</Text>
                      <Text style={[
                        styles.allocationValue,
                        { color: allocation?.isMinimum ? COLORS.warning : COLORS.success }
                      ]}>
                        {formatCurrency(monthlyPayment, userCurrency)}
                      </Text>
                    </View>
                    <View style={styles.allocationItem}>
                      <Text style={styles.allocationLabel}>Minimum:</Text>
                      <Text style={styles.allocationValue}>
                        {formatCurrency(debt.minimumPayment, userCurrency)}
                      </Text>
                    </View>
                    <View style={styles.allocationItem}>
                      <Text style={styles.allocationLabel}>Extra:</Text>
                      <Text style={styles.allocationValue}>
                        {formatCurrency(Math.max(0, monthlyPayment - debt.minimumPayment), userCurrency)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payoff Projection */}
                <View style={styles.projectionSection}>
                  <View style={styles.projectionItem}>
                    <Calendar size={16} color={COLORS.textLight} />
                    <Text style={styles.projectionLabel}>Estimated Payoff:</Text>
                    <Text style={styles.projectionValue}>
                      {payoffDate ? payoffDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      }) : 'Never (payment too low)'}
                    </Text>
                  </View>
                  <View style={styles.projectionItem}>
                    <TrendingUp size={16} color={COLORS.textLight} />
                    <Text style={styles.projectionLabel}>Interest Rate:</Text>
                    <Text style={styles.projectionValue}>{debt.interestRate}%</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Monthly Schedule Preview */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Next 6 Months Schedule</Text>
          <View style={styles.scheduleCard}>
            {Array.from({ length: 6 }, (_, index) => {
              const date = new Date();
              date.setMonth(date.getMonth() + index);
              const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              
              return (
                <View key={index} style={styles.scheduleRow}>
                  <Text style={styles.scheduleMonth}>{monthName}</Text>
                  <Text style={styles.scheduleAmount}>
                    {formatCurrency(totalAllocated, userCurrency)}
                  </Text>
                  <Text style={styles.scheduleStatus}>
                    {index === 0 ? 'Current' : 'Projected'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(totalAllocated, userCurrency)}</Text>
              <Text style={styles.statLabel}>Total Monthly</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(totalAllocated - totalMinimumPayments, userCurrency)}</Text>
              <Text style={styles.statLabel}>Extra Payment</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalDebt > 0 ? Math.ceil(totalDebt / (totalAllocated || 1)) : 0}
              </Text>
              <Text style={styles.statLabel}>Months to Freedom</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Investment Amount Modal */}
      <Modal
        visible={investmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInvestmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Monthly Debt Investment</Text>
            <Text style={styles.modalSubtitle}>
              Available: {formatCurrency(availableForDebt, userCurrency)}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Amount</Text>
              <TextInput
                style={styles.investmentInput}
                value={tempInvestment}
                onChangeText={setTempInvestment}
                placeholder="0.00"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setInvestmentModalVisible(false);
                  setTempInvestment('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSaveInvestment}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Recording Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <Text style={styles.modalSubtitle}>
              {selectedDebt?.name} - {formatCurrency(selectedDebt?.balance || 0, userCurrency)}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Payment Amount</Text>
              <TextInput
                style={styles.paymentInput}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Payment Date</Text>
              <TextInput
                style={styles.input}
                value={paymentDate}
                onChangeText={setPaymentDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={paymentNotes}
                onChangeText={setPaymentNotes}
                placeholder="Add payment notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Payment Preview */}
            {paymentAmount && selectedDebt && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Payment Preview</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>New Balance:</Text>
                  <Text style={styles.previewValue}>
                    {formatCurrency(Math.max(0, selectedDebt.balance - parseFloat(paymentAmount)), userCurrency)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setPaymentAmount('');
                  setPaymentNotes('');
                  setSelectedDebt(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleRecordPayment}
                disabled={recordingPayment}
              >
                {recordingPayment ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Record Payment</Text>
                )}
              </TouchableOpacity>
            </View>
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editButton: {
    padding: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  strategyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  strategyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
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
    marginBottom: 16,
  },
  distributionToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  debtsSection: {
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  debtInfo: {
    flex: 1,
  },
  debtName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  debtBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 4,
  },
  debtOriginal: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  recordPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  recordPaymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  progressContainer: {
    marginBottom: 16,
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
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  allocationSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  allocationDetails: {
    gap: 8,
  },
  allocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allocationLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  allocationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  projectionSection: {
    gap: 8,
  },
  projectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectionLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    flex: 1,
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  scheduleMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  scheduleAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  scheduleStatus: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'right',
  },
  statsSection: {
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
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
  input: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  investmentInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
  },
  paymentInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previewCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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
});