import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Chrome as Home, CreditCard, Calculator, Trophy, ChartBar as BarChart3, User } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const COLORS = {
  primary: '#3498db',
  success: '#2ecc71',
  danger: '#e74c3c',
  gray: '#95a5a6',
  white: '#ffffff',
  background: '#f8f9fa',
};

export default function TabLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If user is not authenticated, hide the tab bar
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide the tab bar
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ size, color }) => (
                <Home size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="debts"
            options={{
              title: 'Debts',
              tabBarIcon: ({ size, color }) => (
                <CreditCard size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="projections"
            options={{
              title: 'Projections',
              tabBarIcon: ({ size, color }) => (
                <Calculator size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="gamification"
            options={{
              title: 'Progress',
              tabBarIcon: ({ size, color }) => (
                <Trophy size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              tabBarIcon: ({ size, color }) => (
                <BarChart3 size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ size, color }) => (
                <User size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </>
    );
  }

  // If user is authenticated, show the full tab bar
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: '#e9ecef',
            height: 88,
            paddingBottom: 20,
            paddingTop: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="debts"
          options={{
            title: 'Debts',
            tabBarIcon: ({ size, color }) => (
              <CreditCard size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="projections"
          options={{
            title: 'Projections',
            tabBarIcon: ({ size, color }) => (
              <Calculator size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gamification"
          options={{
            title: 'Progress',
            tabBarIcon: ({ size, color }) => (
              <Trophy size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ size, color }) => (
              <BarChart3 size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}