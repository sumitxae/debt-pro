import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

function RootLayoutContent() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="debts" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="payments" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}