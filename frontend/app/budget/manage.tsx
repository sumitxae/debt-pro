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
import { useGetBudgetQuery, useUpdateBudgetMutation } from '@/store/api/debtApi';
import { router } from 'expo-router';
import { ArrowLeft, Save, DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react-native';
import { formatCompactNumber, formatCurrency } from '@/src/utils/currencyUtils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

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
  homeContribution: yup.number().min(0, 'Amount cannot be negative').required(),
  housing: yup.number().min(0, 'Amount cannot be negative').required(),
  food: yup.number().min(0, 'Amount cannot be negative').required(),
  transportation: yup.number().min(0, 'Amount cannot be negative').required(),
  utilities: yup.number().min(0, 'Amount cannot be negative').required(),
  entertainment: yup.number().min(0, 'Amount cannot be negative').required(),
  miscellaneous: yup.number().min(0, 'Amount cannot be negative').required(),
});

type FormData = {
  homeContribution: number;
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  entertainment: number;
  miscellaneous: number;
};

export default function BudgetManageScreen() {
  const [updateBudget, { isLoading }] = useUpdateBudgetMutation();
  const { data: budgetData, isLoading: loadingBudget } = useGetBudgetQuery();
  const [showRecommendations, setShowRecommendations] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      homeContribution: 0,
      housing: 0,
      food: 0,
      transportation: 0,
      utilities: 0,
      entertainment: 0,
      miscellaneous: 0,
    },
  });
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const userCurrency = user?.preferences?.currency || 'USD';
  
  // Ensure userCurrency is a valid currency code
  const validCurrency = userCurrency && typeof userCurrency === 'string' ? userCurrency : 'USD';

  const watchedValues = watch();
  const monthlyIncome = user?.monthlyIncome || 0;
  const totalExpenses = Object.values(watchedValues).reduce((sum, value) => 
    typeof value === 'number' ? sum + value : sum, 0
  ) - watchedValues.homeContribution; // Exclude homeContribution from expenses
  const availableForDebt = monthlyIncome - totalExpenses - watchedValues.homeContribution;

  useEffect(() => {
    if (budgetData) {
      reset({
        homeContribution: budgetData.homeContribution,
        ...budgetData.expenses,
      });
    }
  }, [budgetData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateBudget({
        expenses: data,
      }).unwrap();
      Alert.alert('Success', 'Budget updated successfully!');
      router.back();
    } catch (error: any) {
      // Handle different error structures
      let errorMessage = 'Failed to update budget';
      
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

  const getCategoryProgress = (budgeted: number, actual: number) => {
    if (budgeted === 0) return 0;
    return Math.min((actual / budgeted) * 100, 100);
  };

  const getCategoryColor = (budgeted: number, actual: number) => {
    const progress = getCategoryProgress(budgeted, actual);
    if (progress >= 90) return COLORS.danger;
    if (progress >= 75) return COLORS.warning;
    return COLORS.success;
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (watchedValues.housing > monthlyIncome * 0.3) {
      recommendations.push('Consider reducing housing costs to stay under 30% of income');
    }
    
    if (watchedValues.food > monthlyIncome * 0.15) {
      recommendations.push('Food budget is high - consider meal planning to reduce costs');
    }
    
    if (watchedValues.entertainment > monthlyIncome * 0.1) {
      recommendations.push('Entertainment spending could be reduced to free up debt payment funds');
    }
    
    if (watchedValues.homeContribution > monthlyIncome * 0.4) {
      recommendations.push('Home contribution is quite high - consider if this can be optimized');
    }
    
    if (availableForDebt < 0) {
      recommendations.push('Your expenses exceed your income. Consider reducing spending in all categories.');
    } else if (availableForDebt < monthlyIncome * 0.2) {
      recommendations.push('Try to allocate at least 20% of income for debt payments');
    }
    
    return recommendations;
  };

  if (loadingBudget) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading budget...</Text>
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
          <Text style={styles.headerTitle}>Manage Budget</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          >
            <Save size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Monthly Income Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Income</Text>
            <View style={styles.incomeCard}>
              <Text style={styles.incomeDisplay}>
                {formatCurrency(monthlyIncome, validCurrency)}
              </Text>
              <Text style={styles.incomeNote}>
                Update your monthly income in your profile settings
              </Text>
            </View>
          </View>

          {/* Home Contribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home Contribution</Text>
            <View style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>🏠</Text>
                <Text style={styles.categoryLabel}>Home Contribution</Text>
              </View>
              
              <Controller
                control={control}
                name="homeContribution"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.categoryInput, errors.homeContribution && styles.inputError]}
                    placeholder="0.00"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
              
              {errors.homeContribution && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color={COLORS.danger} />
                  <Text style={styles.errorText}>
                    {errors.homeContribution?.message}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Expense Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
            <View style={styles.categoriesContainer}>
              {expenseCategories.map((category) => (
                <View key={category.key} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </View>
                  
                  <Controller
                    control={control}
                    name={category.key as keyof FormData}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.categoryInput, errors[category.key as keyof FormData] && styles.inputError]}
                        placeholder="0.00"
                        value={value.toString()}
                        onChangeText={(text) => onChange(parseFloat(text) || 0)}
                        onBlur={onBlur}
                        keyboardType="numeric"
                      />
                    )}
                  />
                  
                  {errors[category.key as keyof FormData] && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={12} color={COLORS.danger} />
                      <Text style={styles.errorText}>
                        {errors[category.key as keyof FormData]?.message}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Budget Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(monthlyIncome, validCurrency)}</Text>
              </View>
                              <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Expenses:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(Number(totalExpenses), validCurrency)}</Text>
                </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Home Contribution:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(watchedValues.homeContribution, validCurrency)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Available for Debt:</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: availableForDebt >= 0 ? COLORS.success : COLORS.danger }
                ]}>
                  {formatCurrency(Number(availableForDebt), validCurrency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Budget Recommendations */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.recommendationsHeader}
              onPress={() => setShowRecommendations(!showRecommendations)}
            >
              <Text style={styles.sectionTitle}>Budget Recommendations</Text>
              <TrendingUp size={20} color={COLORS.primary} />
            </TouchableOpacity>
            
            {showRecommendations && (
              <View style={styles.recommendationsCard}>
                {getRecommendations().length > 0 ? (
                  getRecommendations().map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Text style={styles.recommendationText}>• {recommendation}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRecommendationsText}>
                    Great job! Your budget looks well-balanced.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* 50/30/20 Rule Guide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>50/30/20 Budget Rule</Text>
            <View style={styles.ruleCard}>
              <View style={styles.ruleItem}>
                <View style={[styles.ruleIndicator, { backgroundColor: COLORS.danger }]} />
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleLabel}>50% - Needs</Text>
                  <Text style={styles.ruleDescription}>
                    Housing, utilities, food, transportation, insurance
                  </Text>
                </View>
              </View>
              <View style={styles.ruleItem}>
                <View style={[styles.ruleIndicator, { backgroundColor: COLORS.warning }]} />
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleLabel}>30% - Wants</Text>
                  <Text style={styles.ruleDescription}>
                    Entertainment, dining out, shopping, hobbies
                  </Text>
                </View>
              </View>
              <View style={styles.ruleItem}>
                <View style={[styles.ruleIndicator, { backgroundColor: COLORS.success }]} />
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleLabel}>20% - Savings/Debt</Text>
                  <Text style={styles.ruleDescription}>
                    Emergency fund, debt payments, investments
                  </Text>
                </View>
              </View>
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
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
  incomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  incomeDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  incomeNote: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  incomeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
  },
  categoriesContainer: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryInput: {
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  noRecommendationsText: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ruleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ruleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
  },
  ruleContent: {
    flex: 1,
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
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
}); 