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
import { useUpdateDebtMutation, useGetDebtsQuery } from '@/store/api/debtApi';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react-native';
import { useDeleteDebtMutation } from '@/store/api/debtApi';

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
  { label: 'Car Loan', value: 'car_loan' },
  { label: 'Personal Loan', value: 'personal_loan' },
  { label: 'Mortgage', value: 'mortgage' },
  { label: 'Medical Debt', value: 'medical_debt' },
  { label: 'Other', value: 'other' },
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
  dueDate: yup.string().required('Due date is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function EditDebtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [updateDebt, { isLoading: updating }] = useUpdateDebtMutation();
  const [deleteDebt, { isLoading: deleting }] = useDeleteDebtMutation();
  const { data: debts, isLoading: loadingDebts } = useGetDebtsQuery();
  const [selectedType, setSelectedType] = useState('');

  const debt = debts?.find(d => d.id === id);

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
      name: '',
      type: '',
      balance: 0,
      originalAmount: 0,
      minimumPayment: 0,
      interestRate: 0,
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  const balance = watch('balance');
  const originalAmount = watch('originalAmount');

  useEffect(() => {
    if (debt) {
      reset({
        name: debt.name,
        type: debt.type,
        balance: debt.balance,
        originalAmount: debt.originalAmount,
        minimumPayment: debt.minimumPayment,
        interestRate: debt.interestRate,
        dueDate: debt.dueDate,
      });
      setSelectedType(debt.type);
    }
  }, [debt, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    
    try {
      await updateDebt({ id, ...data }).unwrap();
      Alert.alert('Success', 'Debt updated successfully!');
      router.back();
    } catch (error: any) {
      // Handle different error structures
      let errorMessage = 'Failed to update debt';
      
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

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Debt',
      'Are you sure you want to delete this debt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDebt(id).unwrap();
              Alert.alert('Success', 'Debt deleted successfully!');
              router.back();
            } catch (error: any) {
              // Handle different error structures
              let errorMessage = 'Failed to delete debt';
              
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
          },
        },
      ]
    );
  };

  if (loadingDebts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading debt information...</Text>
      </View>
    );
  }

  if (!debt) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Debt not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
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
          <Text style={styles.headerTitle}>Edit Debt</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
            >
              <Trash2 size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={updating}
              style={[styles.saveButton, updating && styles.saveButtonDisabled]}
            >
              <Save size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
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

          {/* Amount Fields */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Current Balance *</Text>
              <Controller
                control={control}
                name="balance"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.balance && styles.inputError]}
                    placeholder="0.00"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
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
                  <TextInput
                    style={[styles.input, errors.originalAmount && styles.inputError]}
                    placeholder="0.00"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
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
                    { width: `${Math.min((balance / originalAmount) * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {((balance / originalAmount) * 100).toFixed(1)}% remaining
              </Text>
              <Text style={styles.progressSubtext}>
                ${(originalAmount - balance).toLocaleString()} paid off
              </Text>
            </View>
          )}

          {/* Payment and Interest */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Minimum Payment *</Text>
              <Controller
                control={control}
                name="minimumPayment"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.minimumPayment && styles.inputError]}
                    placeholder="0.00"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
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
                  <TextInput
                    style={[styles.input, errors.interestRate && styles.inputError]}
                    placeholder="0.00"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
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

          {/* Debt Status */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Debt Status</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: debt.status === 'active' ? COLORS.warning : COLORS.success }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {debt.status === 'active' ? 'Active' : 'Paid Off'}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Priority:</Text>
              <Text style={styles.statusValue}>{debt.priority}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Created:</Text>
              <Text style={styles.statusValue}>
                {new Date(debt.createdAt).toLocaleDateString()}
              </Text>
            </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 8,
  },
  deleteButtonDisabled: {
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
  progressSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
}); 