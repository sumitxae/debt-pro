import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetDebtsQuery, useDeleteDebtMutation, useRecordPaymentMutation } from '@/store/api/debtApi';
import { formatCurrency, formatCompactNumber } from '@/src/utils/currencyUtils';
import { Plus, CreditCard, Trash2, DollarSign, Percent, Calendar, CreditCard as Edit } from 'lucide-react-native';
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

export default function DebtsScreen() {
  const { data: debtsData, isLoading, refetch } = useGetDebtsQuery();
  
  // Get user preferences for currency
  const user = useSelector((state: RootState) => state.auth.user);
  const userCurrency = user?.preferences?.currency || 'USD';
  
  // Ensure debtsData is an array and handle different response structures
  const debts = Array.isArray(debtsData) ? debtsData : [];
  
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [deleteDebt] = useDeleteDebtMutation();
  const [recordPayment] = useRecordPaymentMutation();

  const handleDeleteDebt = (debtId: string, debtName: string) => {
    Alert.alert(
      'Delete Debt',
      `Are you sure you want to delete "${debtName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDebt(debtId).unwrap();
              Alert.alert('Success', 'Debt deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete debt');
            }
          },
        },
      ]
    );
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

    try {
      await recordPayment({
        debtId: selectedDebt.id,
        amount,
        paymentDate: new Date().toISOString(),
        paymentType: 'manual',
      }).unwrap();
      
      setPaymentModalVisible(false);
      setPaymentAmount('');
      setSelectedDebt(null);
      Alert.alert('Success', 'Payment recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const getDebtTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'credit_card':
        return <CreditCard size={20} color={COLORS.primary} />;
      default:
        return <DollarSign size={20} color={COLORS.primary} />;
    }
  };

  const getProgressColor = (debt: any) => {
    const progress = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
    if (progress >= 75) return COLORS.success;
    if (progress >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const activeDebts = debts.filter(debt => debt.status === 'active');
  const paidDebts = debts.filter(debt => debt.status === 'paid');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Debts</Text>
          <Text style={styles.headerSubtitle}>
            {activeDebts.length} active • {formatCurrency(activeDebts.reduce((sum, debt) => sum + debt.balance, 0), userCurrency)} total
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/debts/add')}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active Debts */}
        {activeDebts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Debts</Text>
            {activeDebts
              .sort((a, b) => a.priority - b.priority)
              .map((debt) => {
                const progress = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
                const progressColor = getProgressColor(debt);
                
                return (
                  <View key={debt.id} style={styles.debtCard}>
                    <View style={styles.debtHeader}>
                      <View style={styles.debtInfo}>
                        {getDebtTypeIcon(debt.type)}
                        <View style={styles.debtDetails}>
                          <Text style={styles.debtName}>{debt.name}</Text>
                          <Text style={styles.debtType}>{debt.type?.replace('_', ' ')}</Text>
                        </View>
                      </View>
                      <View style={styles.debtActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => router.push(`/debts/edit/${debt.id}`)}
                        >
                          <Edit size={16} color={COLORS.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteDebt(debt.id, debt.name)}
                        >
                          <Trash2 size={16} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.debtBalance}>
                      <Text style={styles.currentBalance}>{formatCurrency(debt.balance, userCurrency)}</Text>
                      <Text style={styles.originalAmount}>of {formatCurrency(debt.originalAmount, userCurrency)}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${progress}%`, backgroundColor: progressColor }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {progress.toFixed(1)}% paid off
                      </Text>
                    </View>

                    <View style={styles.debtMetrics}>
                      <View style={styles.metric}>
                        <DollarSign size={14} color={COLORS.textLight} />
                        <Text style={styles.metricLabel}>Min Payment</Text>
                        <Text style={styles.metricValue}>{formatCurrency(debt.minimumPayment, userCurrency)}</Text>
                      </View>
                      <View style={styles.metric}>
                        <Percent size={14} color={COLORS.textLight} />
                        <Text style={styles.metricLabel}>Interest Rate</Text>
                        <Text style={styles.metricValue}>{debt.interestRate}%</Text>
                      </View>
                      <View style={styles.metric}>
                        <Calendar size={14} color={COLORS.textLight} />
                        <Text style={styles.metricLabel}>Due Date</Text>
                        <Text style={styles.metricValue}>
                          {new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.paymentButton}
                      onPress={() => {
                        setSelectedDebt(debt);
                        setPaymentModalVisible(true);
                      }}
                    >
                      <DollarSign size={16} color={COLORS.white} />
                      <Text style={styles.paymentButtonText}>Record Payment</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
        )}

        {/* Paid Off Debts */}
        {paidDebts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paid Off Debts 🎉</Text>
            {paidDebts.map((debt) => (
              <View key={debt.id} style={[styles.debtCard, styles.paidDebtCard]}>
                <View style={styles.debtHeader}>
                  <View style={styles.debtInfo}>
                    {getDebtTypeIcon(debt.type)}
                    <View style={styles.debtDetails}>
                      <Text style={styles.debtName}>{debt.name}</Text>
                      <Text style={styles.paidLabel}>PAID OFF</Text>
                    </View>
                  </View>
                </View>
                                  <Text style={styles.paidAmount}>${formatCompactNumber(debt.originalAmount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {debts.length === 0 && (
          <View style={styles.emptyState}>
            <CreditCard size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No debts added yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first debt to start your journey to financial freedom
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/debts/add')}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.emptyButtonText}>Add Your First Debt</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
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
              {selectedDebt?.name}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Payment Amount</Text>
              <View style={styles.paymentInputContainer}>
                <Text style={styles.paymentCurrencySymbol}>
                  {formatCurrency(0, userCurrency).replace('0.00', '').trim()}
                </Text>
                <TextInput
                  style={styles.paymentInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setPaymentAmount('');
                  setSelectedDebt(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleRecordPayment}
              >
                <Text style={styles.confirmButtonText}>Record Payment</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
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
  paidDebtCard: {
    borderWidth: 2,
    borderColor: COLORS.success,
    backgroundColor: '#f8fff9',
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtDetails: {
    marginLeft: 12,
    flex: 1,
  },
  debtName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  debtType: {
    fontSize: 14,
    color: COLORS.textLight,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  paidLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 2,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  debtBalance: {
    marginBottom: 16,
  },
  currentBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  originalAmount: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  paidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  debtMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  paymentInputContainer: {
    position: 'relative',
  },
  paymentCurrencySymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    zIndex: 1,
  },
  paymentInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    paddingLeft: 50,
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
});