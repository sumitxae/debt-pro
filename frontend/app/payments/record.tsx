import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecordPaymentMutation, useGetDebtsQuery, useGetPaymentsQuery } from '@/store/api/debtApi';
import { router } from 'expo-router';
import { ArrowLeft, DollarSign, Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react-native';
import { formatCompactNumber } from '@/src/utils/currencyUtils';

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

const paymentMethods = [
  { label: 'Cash', value: 'cash', icon: DollarSign },
  { label: 'Check', value: 'check', icon: CheckCircle },
  { label: 'Online', value: 'online', icon: CreditCard },
  { label: 'Bank Transfer', value: 'bank_transfer', icon: CreditCard },
  { label: 'Other', value: 'other', icon: DollarSign },
];

const schema = yup.object({
  debtId: yup.string().required('Please select a debt'),
  amount: yup
    .number()
    .positive('Payment amount must be positive')
    .required('Payment amount is required'),
  paymentDate: yup.string().required('Payment date is required'),
  paymentType: yup.string().required('Payment method is required'),
  notes: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

export default function RecordPaymentScreen() {
  const [recordPayment, { isLoading }] = useRecordPaymentMutation();
  const { data: debts, isLoading: loadingDebts } = useGetDebtsQuery();
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeDebts = debts?.filter(debt => debt.status === 'active') || [];
  const selectedDebt = activeDebts.find(debt => debt.id === selectedDebtId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      debtId: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: '',
      notes: '',
    },
  });

  const amount = watch('amount');

  const onSubmit = async (data: FormData) => {
    try {
      await recordPayment({
        debtId: data.debtId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentType: data.paymentType,
        notes: data.notes,
      }).unwrap();

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        reset();
        setSelectedDebtId('');
        setSelectedMethod('');
        router.back();
      }, 2000);
    } catch (error: any) {
      // Handle different error structures
      let errorMessage = 'Failed to record payment';
      
      if (error?.data?.message) {
        if (Array.isArray(error.data.message)) {
          errorMessage = error.data.message.join(', ');
        } else if (typeof error.data.message === 'string') {
          errorMessage = error.data.message;
        }
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDebtSelect = (debtId: string) => {
    setSelectedDebtId(debtId);
    setValue('debtId', debtId);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setValue('paymentType', method);
  };

  if (loadingDebts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading debts...</Text>
      </View>
    );
  }

  if (activeDebts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Debts</Text>
        <Text style={styles.emptySubtitle}>
          You need to have active debts to record payments.
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/debts/add')}>
          <Text style={styles.emptyButtonText}>Add a Debt</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Debt Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Debt</Text>
            <View style={styles.debtGrid}>
              {activeDebts.map((debt) => (
                <TouchableOpacity
                  key={debt.id}
                  style={[
                    styles.debtCard,
                    selectedDebtId === debt.id && styles.debtCardSelected,
                  ]}
                  onPress={() => handleDebtSelect(debt.id)}
                >
                  <Text style={styles.debtName}>{debt.name}</Text>
                  <Text style={styles.debtBalance}>${formatCompactNumber(debt.balance)}</Text>
                  <View style={styles.debtProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${((debt.originalAmount - debt.balance) / debt.originalAmount) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {(((debt.originalAmount - debt.balance) / debt.originalAmount) * 100).toFixed(1)}% paid
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {errors.debtId && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.debtId.message}</Text>
              </View>
            )}
          </View>

          {/* Payment Form */}
          {selectedDebt && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              
              {/* Payment Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Amount *</Text>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.amount && styles.inputError]}
                      placeholder="0.00"
                      value={value.toString()}
                      onChangeText={(text) => onChange(parseFloat(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.amount && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={14} color={COLORS.danger} />
                    <Text style={styles.errorText}>{errors.amount.message}</Text>
                  </View>
                )}
              </View>

              {/* Payment Method */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Method *</Text>
                <View style={styles.methodGrid}>
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <TouchableOpacity
                        key={method.value}
                        style={[
                          styles.methodButton,
                          selectedMethod === method.value && styles.methodButtonSelected,
                        ]}
                        onPress={() => handleMethodSelect(method.value)}
                      >
                        <IconComponent
                          size={20}
                          color={selectedMethod === method.value ? COLORS.white : COLORS.text}
                        />
                        <Text
                          style={[
                            styles.methodButtonText,
                            selectedMethod === method.value && styles.methodButtonTextSelected,
                          ]}
                        >
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.paymentType && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={14} color={COLORS.danger} />
                    <Text style={styles.errorText}>{errors.paymentType.message}</Text>
                  </View>
                )}
              </View>

              {/* Payment Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Date *</Text>
                <Controller
                  control={control}
                  name="paymentDate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.paymentDate && styles.inputError]}
                      placeholder="YYYY-MM-DD"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.paymentDate && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={14} color={COLORS.danger} />
                    <Text style={styles.errorText}>{errors.paymentDate.message}</Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textArea}
                      placeholder="Add any notes about this payment..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={3}
                    />
                  )}
                />
              </View>

              {/* Payment Preview */}
              {amount > 0 && selectedDebt && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>Payment Preview</Text>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>New Balance:</Text>
                    <Text style={styles.previewValue}>
                      ${formatCompactNumber(Math.max(0, selectedDebt.balance - amount))}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Amount Paid:</Text>
                    <Text style={styles.previewValue}>${formatCompactNumber(amount)}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Remaining:</Text>
                    <Text style={styles.previewValue}>
                      ${formatCompactNumber(Math.max(0, selectedDebt.balance - amount))}
                    </Text>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Record Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Success Overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <CheckCircle size={48} color={COLORS.success} />
            <Text style={styles.successTitle}>Payment Recorded!</Text>
            <Text style={styles.successSubtitle}>Your payment has been successfully recorded.</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  debtGrid: {
    gap: 12,
  },
  debtCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debtCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  debtBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 12,
  },
  debtProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
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
    backgroundColor: COLORS.white,
  },
  textArea: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginLeft: 8,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  methodButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  methodButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  methodButtonTextSelected: {
    color: COLORS.white,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 8,
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
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
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
    color: COLORS.textLight,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 32,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    margin: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
}); 