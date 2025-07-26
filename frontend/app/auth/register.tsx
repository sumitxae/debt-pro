import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { registerUser } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, User, DollarSign, LogIn } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
  border: '#e9ecef',
};

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [monthlyIncomeError, setMonthlyIncomeError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setMonthlyIncomeError('');

    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else if (lastName.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters with uppercase, lowercase, and number');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    // Validate monthly income (optional but if provided, must be valid)
    if (monthlyIncome.trim() && isNaN(Number(monthlyIncome))) {
      setMonthlyIncomeError('Please enter a valid amount');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        monthlyIncome: monthlyIncome.trim() ? Number(monthlyIncome) : undefined,
      };

      const result = await dispatch(registerUser(userData) as any);
      
      if (registerUser.fulfilled.match(result)) {
        // Registration successful, navigate to dashboard
        Alert.alert(
          'Welcome!', 
          'Your account has been created successfully. You can now start managing your debts.',
          [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        // Registration failed, error is already in the state
        Alert.alert('Registration Failed', result.payload?.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Logo and Title */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>💰</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DebtFree Pro and start your journey to financial freedom</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, firstNameError ? styles.inputError : null]}
                  placeholder="First name"
                  placeholderTextColor={COLORS.textLight}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (firstNameError) setFirstNameError('');
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, lastNameError ? styles.inputError : null]}
                  placeholder="Last name"
                  placeholderTextColor={COLORS.textLight}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (lastNameError) setLastNameError('');
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Email address"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.gray} />
                ) : (
                  <Eye size={20} color={COLORS.gray} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                placeholder="Confirm password"
                placeholderTextColor={COLORS.textLight}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={COLORS.gray} />
                ) : (
                  <Eye size={20} color={COLORS.gray} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          {/* Monthly Income Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <DollarSign size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, monthlyIncomeError ? styles.inputError : null]}
                placeholder="Monthly income (optional)"
                placeholderTextColor={COLORS.textLight}
                value={monthlyIncome}
                onChangeText={(text) => {
                  setMonthlyIncome(text);
                  if (monthlyIncomeError) setMonthlyIncomeError('');
                }}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {monthlyIncomeError ? <Text style={styles.errorText}>{monthlyIncomeError}</Text> : null}
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading ? styles.registerButtonDisabled : null]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <LogIn size={20} color={COLORS.primary} />
            <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginTop: 8,
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginHorizontal: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 