import React, { useState } from 'react';
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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateDebtMutation } from '@/store/api/debtApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatCurrency, getCurrencySymbol } from '@/src/utils/currencyUtils';
import { router } from 'expo-router';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react-native';

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

const debtTypes = [
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Student Loan', value: 'student_loan' },
  { label: 'Auto Loan', value: 'auto_loan' },
  { label: 'Personal Loan', value: 'personal_loan' },
  { label: 'Home Loan', value: 'home_loan' },
  { label: 'Other', value: 'other' },
];

const paymentIntervals = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Half Yearly', value: 'half_yearly' },
  { label: 'Yearly', value: 'yearly' },
];

const schema = yup.object({
  name: yup.string().required('Debt name is required'),
  type: yup.string().required('Debt type is required'),
  balance: yup
    .number()
    .positive('Balance must be positive')
    .required('Current balance is required'),
  originalAmount: yup
    .number()
    .positive('Original amount must be positive')
    .required('Original amount is required'),
  minimumPayment: yup
    .number()
    .positive('Minimum payment must be positive')
    .required('Minimum payment is required'),
  interestRate: yup
    .number()
    .min(0, 'Interest rate must be 0 or higher')
    .max(100, 'Interest rate cannot exceed 100%')
    .required('Interest rate is required'),
  paymentInterval: yup.string().required('Payment interval is required'),
  dueDate: yup.string().required('Due date is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function AddDebtScreen() {
  const [createDebt, { isLoading }] = useCreateDebtMutation();
  const [selectedType, setSelectedType] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('monthly');
  
  // Get user preferences for currency
  const user = useSelector((state: RootState) => state.auth.user);
  const userCurrency = user?.preferences?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(userCurrency);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: '',
      balance: 0,
      originalAmount: 0,
      minimumPayment: 0,
      interestRate: 0,
      paymentInterval: 'monthly',
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  const balance = watch('balance');
  const originalAmount = watch('originalAmount');

  const onSubmit = async (data: FormData) => {
    try {
      // Only send fields that the backend expects
      const debtData = {
        name: data.name,
        type: data.type,
        originalAmount: data.originalAmount,
        currentBalance: data.balance, // Send the current balance from the form
        interestRate: data.interestRate,
        paymentInterval: data.paymentInterval,
        minimumPayment: data.minimumPayment,
        dueDate: data.dueDate,
        priority: 1, // Default priority
        notes: '', // Default empty notes
      };

      console.log('Submitting debt data:', debtData);
      await createDebt(debtData).unwrap();
      Alert.alert('Success', 'Debt added successfully!');
      router.back();
    } catch (error: any) {
      console.log('Error creating debt:', error);
      
      // Handle different error structures
      let errorMessage = 'Failed to add debt';
      
      if (error?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        Alert.alert('Session Expired', errorMessage, [
          { text: 'OK', onPress: () => router.replace('/auth/login') }
        ]);
        return;
      }
      
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
          <Text style={styles.headerTitle}>Add New Debt</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          >
            <Save size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Debt Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Debt Name *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g., Chase Credit Card"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.name && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.name.message}</Text>
              </View>
            )}
          </View>

          {/* Debt Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Debt Type *</Text>
            <View style={styles.typeContainer}>
              {debtTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    selectedType === type.value && styles.typeButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedType(type.value);
                    setValue('type', type.value);
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type.value && styles.typeButtonTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.type.message}</Text>
              </View>
            )}
          </View>

          {/* Payment Interval */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Interval *</Text>
            <View style={styles.typeContainer}>
              {paymentIntervals.map((interval) => (
                <TouchableOpacity
                  key={interval.value}
                  style={[
                    styles.typeButton,
                    selectedInterval === interval.value && styles.typeButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedInterval(interval.value);
                    setValue('paymentInterval', interval.value);
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedInterval === interval.value && styles.typeButtonTextSelected,
                    ]}
                  >
                    {interval.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.paymentInterval && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.paymentInterval.message}</Text>
              </View>
            )}
          </View>

          {/* Amount Fields */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Current Balance *</Text>
              <Controller
                control={control}
                name="balance"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                    <TextInput
                      style={[styles.input, styles.inputWithSymbol, errors.balance && styles.inputError]}
                      placeholder="0.00"
                      value={value.toString()}
                      onChangeText={(text) => onChange(parseFloat(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              />
              {errors.balance && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={COLORS.danger} />
                  <Text style={styles.errorText}>{errors.balance.message}</Text>
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Original Amount *</Text>
              <Controller
                control={control}
                name="originalAmount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                    <TextInput
                      style={[styles.input, styles.inputWithSymbol, errors.originalAmount && styles.inputError]}
                      placeholder="0.00"
                      value={value.toString()}
                      onChangeText={(text) => onChange(parseFloat(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              />
              {errors.originalAmount && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={COLORS.danger} />
                  <Text style={styles.errorText}>{errors.originalAmount.message}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress Indicator */}
          {balance > 0 && originalAmount > 0 && (
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Debt Progress</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(((originalAmount - balance) / originalAmount) * 100, 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.progressDetails}>
                <Text style={styles.progressText}>
                  {((originalAmount - balance) / originalAmount * 100).toFixed(1)}% paid off
                </Text>
                {/* <Text style={styles.progressAmount}>
                  {formatCurrency(balance, userCurrency)} remaining of {formatCurrency(originalAmount, userCurrency)}
                </Text> */}
              </View>
            </View>
          )}

          {/* Payment and Interest */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Minimum Payment ({selectedInterval === 'monthly' ? 'Monthly' : selectedInterval === 'half_yearly' ? 'Half Yearly' : 'Yearly'}) *</Text>
              <Controller
                control={control}
                name="minimumPayment"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                    <TextInput
                      style={[styles.input, styles.inputWithSymbol, errors.minimumPayment && styles.inputError]}
                      placeholder="0.00"
                      value={value.toString()}
                      onChangeText={(text) => onChange(parseFloat(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              />
              {errors.minimumPayment && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={COLORS.danger} />
                  <Text style={styles.errorText}>{errors.minimumPayment.message}</Text>
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Interest Rate (%) *</Text>
              <Controller
                control={control}
                name="interestRate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.percentageSymbol}>%</Text>
                    <TextInput
                      style={[styles.input, styles.inputWithSymbol, errors.interestRate && styles.inputError]}
                      placeholder="0.00"
                      value={value.toString()}
                      onChangeText={(text) => onChange(parseFloat(text) || 0)}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              />
              {errors.interestRate && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={COLORS.danger} />
                  <Text style={styles.errorText}>{errors.interestRate.message}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <Controller
              control={control}
              name="dueDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.dueDate && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.dueDate && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.dueDate.message}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  form: {
    padding: 24,
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
  inputWithSymbol: {
    paddingLeft: 40,
  },
  inputContainer: {
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    zIndex: 1,
  },
  percentageSymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    zIndex: 1,
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  typeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: COLORS.white,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
}); 