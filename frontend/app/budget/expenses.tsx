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
  FlatList,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetTransactionsQuery, useAddTransactionMutation } from '@/store/api/debtApi';
import { router } from 'expo-router';
import { ArrowLeft, Plus, DollarSign, Calendar, AlertCircle, Trash2, Edit3 } from 'lucide-react-native';

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

const expenseCategories = [
  { key: 'housing', label: 'Housing', icon: '🏠', color: '#e74c3c' },
  { key: 'food', label: 'Food', icon: '🍽️', color: '#f39c12' },
  { key: 'transportation', label: 'Transportation', icon: '🚗', color: '#3498db' },
  { key: 'utilities', label: 'Utilities', icon: '⚡', color: '#9b59b6' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#e67e22' },
  { key: 'miscellaneous', label: 'Miscellaneous', icon: '📦', color: '#95a5a6' },
];

const schema = yup.object({
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().required('Description is required'),
  date: yup.string().required('Date is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function ExpensesScreen() {
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const { data: transactions, isLoading: loadingTransactions, refetch } = useGetTransactionsQuery({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (editingTransaction) {
      reset({
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        description: editingTransaction.description,
        date: editingTransaction.date,
      });
      setSelectedCategory(editingTransaction.category);
    }
  }, [editingTransaction, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await addTransaction(data).unwrap();
      Alert.alert('Success', 'Expense added successfully!');
      reset();
      setSelectedCategory('');
      setShowForm(false);
      setEditingTransaction(null);
      refetch();
    } catch (error: any) {
      // Handle different error structures
      let errorMessage = 'Failed to add expense';
      
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setValue('category', category);
  };

  const getCategorySpending = () => {
    if (!transactions) return {};
    
    return transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const getTotalSpending = () => {
    if (!transactions) return 0;
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>
            {expenseCategories.find(cat => cat.key === item.category)?.label}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={styles.amountText}>${item.amount.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.transactionActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingTransaction(item);
            setShowForm(true);
          }}
        >
          <Edit3 size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() => {
            Alert.alert(
              'Delete Expense',
              'Are you sure you want to delete this expense?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement delete transaction
                    Alert.alert('Info', 'Delete functionality will be implemented');
                  },
                },
              ]
            );
          }}
        >
          <Trash2 size={16} color={COLORS.danger} />
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Track Expenses</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setShowForm(!showForm);
              setEditingTransaction(null);
              reset();
              setSelectedCategory('');
            }}
          >
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Spending Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month's Spending</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.totalAmount}>${getTotalSpending().toLocaleString()}</Text>
              <Text style={styles.totalLabel}>Total Expenses</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <View style={styles.categoriesContainer}>
              {expenseCategories.map((category) => {
                const spending = getCategorySpending()[category.key] || 0;
                const percentage = getTotalSpending() > 0 ? (spending / getTotalSpending()) * 100 : 0;
                
                return (
                  <View key={category.key} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <View style={styles.categoryDetails}>
                        <Text style={styles.categoryName}>{category.label}</Text>
                        <Text style={styles.categoryAmount}>${spending.toLocaleString()}</Text>
                      </View>
                    </View>
                    <View style={styles.categoryProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${percentage}%`, backgroundColor: category.color },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Expense Form */}
          {showForm && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {editingTransaction ? 'Edit Expense' : 'Add New Expense'}
              </Text>
              <View style={styles.formCard}>
                {/* Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Amount *</Text>
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

                {/* Category */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category *</Text>
                  <View style={styles.categoryGrid}>
                    {expenseCategories.map((category) => (
                      <TouchableOpacity
                        key={category.key}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category.key && styles.categoryButtonSelected,
                        ]}
                        onPress={() => handleCategorySelect(category.key)}
                      >
                        <Text style={styles.categoryButtonIcon}>{category.icon}</Text>
                        <Text
                          style={[
                            styles.categoryButtonText,
                            selectedCategory === category.key && styles.categoryButtonTextSelected,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.category && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={COLORS.danger} />
                      <Text style={styles.errorText}>{errors.category.message}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description *</Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, errors.description && styles.inputError]}
                        placeholder="e.g., Grocery shopping"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  {errors.description && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={COLORS.danger} />
                      <Text style={styles.errorText}>{errors.description.message}</Text>
                    </View>
                  )}
                </View>

                {/* Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date *</Text>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, errors.date && styles.inputError]}
                        placeholder="YYYY-MM-DD"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  {errors.date && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={COLORS.danger} />
                      <Text style={styles.errorText}>{errors.date.message}</Text>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editingTransaction ? 'Update Expense' : 'Add Expense'}
                    </Text>
                  )}
                </TouchableOpacity>

                {editingTransaction && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingTransaction(null);
                      setShowForm(false);
                      reset();
                      setSelectedCategory('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Recent Expenses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {loadingTransactions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading expenses...</Text>
              </View>
            ) : transactions && transactions.length > 0 ? (
              <FlatList
                data={transactions.slice(0, 10)} // Show only last 10
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expenses recorded yet</Text>
                <Text style={styles.emptySubtext}>Add your first expense to start tracking</Text>
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
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    minWidth: 40,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.background,
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
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    gap: 6,
  },
  categoryButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  categoryButtonIcon: {
    fontSize: 16,
  },
  categoryButtonText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteAction: {
    marginLeft: 'auto',
  },
  actionText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
}); 