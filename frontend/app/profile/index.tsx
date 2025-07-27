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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logoutUser, updateUserPreferences } from '@/store/slices/authSlice';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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
              // Even if logout fails, clear the state and redirect
              router.replace('/auth/login');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Account deletion will be implemented');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    setLoading(true);
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Export Complete', 'Your data has been exported successfully!');
    }, 2000);
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

  const menuItems = [
    {
      title: 'Account Settings',
      icon: User,
      onPress: () => Alert.alert('Info', 'Account settings will be implemented'),
    },
    {
      title: 'Currency',
      subtitle: `${getCurrencySymbol(user?.preferences?.currency || 'USD')} ${user?.preferences?.currency || 'USD'}`,
      icon: CreditCard,
      onPress: handleCurrencyChange,
    },
    {
      title: 'Notifications',
      icon: Bell,
      onPress: () => Alert.alert('Info', 'Notification settings will be implemented'),
    },
    {
      title: 'Security & Privacy',
      icon: Shield,
      onPress: () => Alert.alert('Info', 'Security settings will be implemented'),
    },
    {
      title: 'Export Data',
      icon: Download,
      onPress: handleExportData,
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => Alert.alert('Info', 'Help & support will be implemented'),
    },
    {
      title: 'About',
      icon: Info,
      onPress: () => Alert.alert('About', 'DebtFree Pro v1.0.0\n\nA comprehensive debt management app to help you achieve financial freedom.'),
    },
  ];

  const quickActions = [
    {
      title: 'Add New Debt',
      icon: CreditCard,
      onPress: () => router.push('/debts/add'),
    },
    {
      title: 'Record Payment',
      icon: TrendingUp,
      onPress: () => router.push('/payments/record'),
    },
    {
      title: 'View Reports',
      icon: FileText,
      onPress: () => Alert.alert('Info', 'Reports will be implemented'),
    },
  ];

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
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* User Info Card */}
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.userStatus}>Active Account</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickActionCard}
                    onPress={action.onPress}
                  >
                    <IconComponent size={24} color={COLORS.primary} />
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsCard}>
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuItemLeft}>
                      <IconComponent size={20} color={COLORS.textLight} />
                      <View style={styles.menuItemTextContainer}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        {item.subtitle && (
                          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                        )}
                      </View>
                    </View>
                    <ChevronRight size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Toggle Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsCard}>
              <View style={styles.toggleItem}>
                <View style={styles.toggleItemLeft}>
                  <Bell size={20} color={COLORS.textLight} />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>Push Notifications</Text>
                    <Text style={styles.toggleSubtitle}>Receive payment reminders and updates</Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
              
              <View style={styles.toggleItem}>
                <View style={styles.toggleItemLeft}>
                  <Shield size={20} color={COLORS.textLight} />
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleTitle}>Biometric Login</Text>
                    <Text style={styles.toggleSubtitle}>Use fingerprint or face ID</Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
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
              
              <TouchableOpacity style={styles.dangerMenuItem} onPress={handleDeleteAccount}>
                <View style={styles.menuItemLeft}>
                  <Trash2 size={20} color={COLORS.danger} />
                  <Text style={[styles.menuItemText, { color: COLORS.danger }]}>Delete Account</Text>
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

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Exporting your data...</Text>
          </View>
        </View>
      )}
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
  settingsButton: {
    padding: 8,
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
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    margin: 24,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
}); 