import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { useGetDebtsQuery } from '@/store/api/debtApi';
import { router } from 'expo-router';
import { ArrowLeft, Search, Filter, Calendar, DollarSign, Download, Trash2 } from 'lucide-react-native';

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

// Mock payment data - in real app this would come from API
const mockPayments = [
  {
    id: '1',
    debtId: '1',
    debtName: 'Chase Credit Card',
    amount: 500,
    date: '2024-01-15',
    method: 'online',
    notes: 'Monthly payment',
  },
  {
    id: '2',
    debtId: '2',
    debtName: 'Student Loan',
    amount: 300,
    date: '2024-01-10',
    method: 'bank_transfer',
    notes: 'Regular payment',
  },
  {
    id: '3',
    debtId: '1',
    debtName: 'Chase Credit Card',
    amount: 250,
    date: '2024-01-05',
    method: 'check',
    notes: 'Extra payment',
  },
  {
    id: '4',
    debtId: '3',
    debtName: 'Car Loan',
    amount: 400,
    date: '2024-01-01',
    method: 'online',
    notes: 'Monthly payment',
  },
];

const paymentMethods = {
  cash: 'Cash',
  check: 'Check',
  online: 'Online',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};

export default function PaymentHistoryScreen() {
  const { data: debts, isLoading: loadingDebts } = useGetDebtsQuery();
  const [payments, setPayments] = useState(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebt, setSelectedDebt] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    filterPayments();
  }, [searchQuery, selectedDebt, selectedMethod, dateRange, payments]);

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.debtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Debt filter
    if (selectedDebt) {
      filtered = filtered.filter(payment => payment.debtId === selectedDebt);
    }

    // Method filter
    if (selectedMethod) {
      filtered = filtered.filter(payment => payment.method === selectedMethod);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(payment => payment.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(payment => payment.date <= dateRange.end);
    }

    setFilteredPayments(filtered);
  };

  const getTotalPayments = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPaymentsByDebt = () => {
    return filteredPayments.reduce((acc, payment) => {
      acc[payment.debtName] = (acc[payment.debtName] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPayments(payments.filter(p => p.id !== paymentId));
            Alert.alert('Success', 'Payment deleted successfully!');
          },
        },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert('Export', 'Export functionality will be implemented');
  };

  const renderPayment = ({ item }: { item: any }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.debtName}>{item.debtName}</Text>
          <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
          <Text style={styles.paymentMethod}>
            {paymentMethods[item.method as keyof typeof paymentMethods]}
          </Text>
        </View>
        <View style={styles.paymentAmount}>
          <Text style={styles.amountText}>${item.amount.toLocaleString()}</Text>
        </View>
      </View>
      
      {item.notes && (
        <Text style={styles.paymentNotes}>{item.notes}</Text>
      )}
      
      <View style={styles.paymentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Payment Details', `Amount: $${item.amount}\nDate: ${formatDate(item.date)}\nMethod: ${paymentMethods[item.method as keyof typeof paymentMethods]}\nNotes: ${item.notes || 'None'}`);
          }}
        >
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() => handleDeletePayment(item.id)}
        >
          <Trash2 size={16} color={COLORS.danger} />
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loadingDebts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Download size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Search and Filters */}
          <View style={styles.section}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View style={styles.filtersCard}>
                {/* Debt Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Filter by Debt</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedDebt === '' && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSelectedDebt('')}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedDebt === '' && styles.filterOptionTextSelected,
                      ]}>
                        All Debts
                      </Text>
                    </TouchableOpacity>
                    {debts?.map((debt) => (
                      <TouchableOpacity
                        key={debt.id}
                        style={[
                          styles.filterOption,
                          selectedDebt === debt.id && styles.filterOptionSelected,
                        ]}
                        onPress={() => setSelectedDebt(debt.id)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedDebt === debt.id && styles.filterOptionTextSelected,
                        ]}>
                          {debt.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Method Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Filter by Method</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterOption,
                        selectedMethod === '' && styles.filterOptionSelected,
                      ]}
                      onPress={() => setSelectedMethod('')}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedMethod === '' && styles.filterOptionTextSelected,
                      ]}>
                        All Methods
                      </Text>
                    </TouchableOpacity>
                    {Object.entries(paymentMethods).map(([key, label]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.filterOption,
                          selectedMethod === key && styles.filterOptionSelected,
                        ]}
                        onPress={() => setSelectedMethod(key)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          selectedMethod === key && styles.filterOptionTextSelected,
                        ]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Date Range Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Date Range</Text>
                  <View style={styles.dateInputs}>
                    <View style={styles.dateInput}>
                      <Text style={styles.dateLabel}>From:</Text>
                      <TextInput
                        style={styles.dateInputField}
                        placeholder="YYYY-MM-DD"
                        value={dateRange.start}
                        onChangeText={(text) => setDateRange({ ...dateRange, start: text })}
                      />
                    </View>
                    <View style={styles.dateInput}>
                      <Text style={styles.dateLabel}>To:</Text>
                      <TextInput
                        style={styles.dateInputField}
                        placeholder="YYYY-MM-DD"
                        value={dateRange.end}
                        onChangeText={(text) => setDateRange({ ...dateRange, end: text })}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Summary Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{filteredPayments.length}</Text>
                <Text style={styles.summaryLabel}>Total Payments</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>${getTotalPayments().toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Amount</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  ${filteredPayments.length > 0 ? (getTotalPayments() / filteredPayments.length).toFixed(0) : 0}
                </Text>
                <Text style={styles.summaryLabel}>Average Payment</Text>
              </View>
            </View>
          </View>

          {/* Payments by Debt */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payments by Debt</Text>
            <View style={styles.debtBreakdown}>
              {Object.entries(getPaymentsByDebt()).map(([debtName, amount]) => (
                <View key={debtName} style={styles.debtItem}>
                  <Text style={styles.debtItemName}>{debtName}</Text>
                  <Text style={styles.debtItemAmount}>${amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Payment List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Records</Text>
            {filteredPayments.length > 0 ? (
              <FlatList
                data={filteredPayments}
                renderItem={renderPayment}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No payments found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your filters or add some payments
                </Text>
              </View>
            )}
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
  exportButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtersCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.background,
  },
  filterOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  filterOptionTextSelected: {
    color: COLORS.white,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  dateInputField: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryCards: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  debtBreakdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  debtItemName: {
    fontSize: 14,
    color: COLORS.text,
  },
  debtItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  paymentNotes: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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