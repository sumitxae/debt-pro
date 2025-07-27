import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Alert } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Listen for authentication state changes
    if (!isAuthenticated) {
      // User is not authenticated, they will be redirected to login
      console.log('User not authenticated, redirecting to login');
    }
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="debts" options={{ headerShown: false }} />
      <Stack.Screen name="payments" options={{ headerShown: false }} />
      <Stack.Screen name="budget" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}