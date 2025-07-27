import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logoutUser, updateUserPreferences, updateUserProfile } from '@/store/slices/authSlice';
import { useGetDebtsQuery, useGetBudgetQuery } from '@/store/api/debtApi';
import { formatCurrency, getCurrencySymbol, AVAILABLE_CURRENCIES } from '@/src/utils/currencyUtils';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Download, 
  HelpCircle, 
  LogOut, 
  Trash2, 
  Settings,
  CreditCard,
  TrendingUp,
  FileText,
  Info,
  ChevronRight,
  Edit3,
  DollarSign,
} from 'lucide-react-native';

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

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: debtsData } = useGetDebtsQuery();
  const { data: budgetData } = useGetBudgetQuery();
  
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'name' | 'income' | null>(null);
  const [editValue, setEditValue] = useState('');

  // Calculate real statistics from API data
  const debts = Array.isArray(debtsData) ? debtsData : [];
  const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const activeDebts = debts.filter(debt => debt.status === 'active').length;
  const paidOffDebts = debts.filter(debt => debt.status === 'paid').length;
  const monthlyIncome = budgetData?.monthlyIncome || 0;
  const availableForDebt = budgetData ? 
    (Number(budgetData.monthlyIncome) || 0) - Object.values(budgetData.expenses || {}).reduce((sum, exp) => sum + (Number(exp) || 0), 0) : 0;

  const userCurrency = user?.preferences?.currency || 'USD';

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await dispatch(logoutUser() as any);
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              router.replace('/auth/login');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = (field: 'name' | 'income') => {
    setEditField(field);
    if (field === 'name') {
      setEditValue(`${user?.firstName || ''} ${user?.lastName || ''}`.trim());
    } else if (field === 'income') {
      setEditValue(monthlyIncome.toString());
    }
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editField || !editValue.trim()) return;

    try {
      setLoading(true);
      
      if (editField === 'name') {
        const [firstName, ...lastNameParts] = editValue.trim().split(' ');
        const lastName = lastNameParts.join(' ');
        
        await dispatch(updateUserProfile({
          firstName: firstName || '',
          lastName: lastName || '',
        }) as any);
      } else if (editField === 'income') {
        const income = parseFloat(editValue);
        if (!isNaN(income) && income >= 0) {
          await dispatch(updateUserProfile({
            monthlyIncome: income,
          }) as any);
        }
      }
      
      setEditModalVisible(false);
      setEditField(null);
      setEditValue('');
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = () => {
    Alert.alert(
      'Currency',
      'Select your preferred currency',
      AVAILABLE_CURRENCIES.slice(0, 10).map(currency => ({
        text: `${currency.symbol} ${currency.name}`,
        onPress: async () => {
          try {
            await dispatch(updateUserPreferences({ currency: currency.code }) as any);
            Alert.alert('Success', `Currency updated to ${currency.name}`);
          } catch (error) {
            Alert.alert('Error', 'Failed to update currency preference');
          }
        },
      })).concat([
        { text: 'Cancel', style: 'cancel' }
      ])
    );
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      await dispatch(updateUserPreferences({ notifications: enabled }) as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preference');
    }
  };

  const handleExportData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Export Complete', 'Your data has been exported successfully!');
    }, 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Updating...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Profile</Text>
          <Text style={styles.authSubtitle}>Please log in to access your profile</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.authButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* User Info Card */}
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email?.split('@')[0] || 'User'}
                </Text>
                <TouchableOpacity onPress={() => handleEditProfile('name')}>
                  <Edit3 size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.userIncomeRow}>
                <Text style={styles.userIncome}>
                  Monthly Income: {formatCurrency(monthlyIncome, userCurrency)}
                </Text>
                <TouchableOpacity onPress={() => handleEditProfile('income')}>
                  <Edit3 size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Financial Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <CreditCard size={24} color={COLORS.danger} />
                <Text style={styles.overviewValue}>{formatCurrency(totalDebt, userCurrency)}</Text>
                <Text style={styles.overviewLabel}>Total Debt</Text>
              </View>
              <View style={styles.overviewCard}>
                <TrendingUp size={24} color={COLORS.success} />
                <Text style={styles.overviewValue}>{formatCurrency(availableForDebt, userCurrency)}</Text>
                <Text style={styles.overviewLabel}>Available for Debt</Text>
              </View>
              <View style={styles.overviewCard}>
                <FileText size={24} color={COLORS.primary} />
                <Text style={styles.overviewValue}>{activeDebts}</Text>
                <Text style={styles.overviewLabel}>Active Debts</Text>
              </View>
              <View style={styles.overviewCard}>
                <TrendingUp size={24} color={COLORS.warning} />
                <Text style={styles.overviewValue}>{paidOffDebts}</Text>
                <Text style={styles.overviewLabel}>Paid Off</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/debts/add')}
              >
                <CreditCard size={24} color={COLORS.primary} />
                <Text style={styles.quickActionText}>Add Debt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/payments/record')}
              >
                <DollarSign size={24} color={COLORS.success} />
                <Text style={styles.quickActionText}>Record Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/budget/manage')}
              >
                <Settings size={24} color={COLORS.warning} />
                <Text style={styles.quickActionText}>Manage Budget</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.menuItem} onPress={handleCurrencyChange}>
                <View style={styles.menuItemLeft}>
                  <CreditCard size={20} color={COLORS.textLight} />
                  <View style={styles.menuItemTextContainer}>
                    <Text style={styles.menuItemText}>Currency</Text>
                    <Text style={styles.menuItemSubtitle}>
                      {getCurrencySymbol(userCurrency)} {userCurrency}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </TouchableOpacity>

              <View style={styles.toggleItem}>
                <View style={styles.toggleItemLeft}>
                  <Bell size={20} color={COLORS.textLight} />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>Push Notifications</Text>
                    <Text style={styles.toggleSubtitle}>Receive payment reminders</Text>
                  </View>
                </View>
                <Switch
                  value={user?.preferences?.notifications ?? true}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
                <View style={styles.menuItemLeft}>
                  <Download size={20} color={COLORS.textLight} />
                  <Text style={styles.menuItemText}>Export Data</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => Alert.alert('Help', 'Help & support will be implemented')}
              >
                <View style={styles.menuItemLeft}>
                  <HelpCircle size={20} color={COLORS.textLight} />
                  <Text style={styles.menuItemText}>Help & Support</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.dangerMenuItem} onPress={handleLogout}>
                <View style={styles.menuItemLeft}>
                  <LogOut size={20} color={COLORS.warning} />
                  <Text style={[styles.menuItemText, { color: COLORS.warning }]}>Logout</Text>
                </View>
                <ChevronRight size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <View style={styles.appInfoCard}>
              <Text style={styles.appName}>DebtFree Pro</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Your comprehensive debt management companion
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editField === 'name' ? 'Name' : 'Monthly Income'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editField === 'name' ? 'Enter your name' : 'Enter monthly income'}
              keyboardType={editField === 'income' ? 'numeric' : 'default'}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditField(null);
                  setEditValue('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  userIncomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userIncome: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
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
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  dangerMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  toggleItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  appInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 32,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  authButtonText: {
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
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
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
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});