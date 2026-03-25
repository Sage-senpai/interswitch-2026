import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, RootState } from '../src/store';
import { setTheme } from '../src/store/themeSlice';
import { darkTheme, lightTheme } from '../src/constants/theme';

function AppContent() {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();
  const colors = mode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    AsyncStorage.getItem('purse_theme').then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        dispatch(setTheme(saved));
      }
    });
  }, [dispatch]);

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.headerText,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lessons/[id]" options={{ title: 'Lesson' }} />
        <Stack.Screen name="payments/fund" options={{ title: 'Fund Wallet' }} />
        <Stack.Screen name="payments/bills" options={{ title: 'Pay Bills' }} />
        <Stack.Screen name="payments/transfer" options={{ title: 'Send Money' }} />
        <Stack.Screen name="savings/new-goal" options={{ title: 'New Goal' }} />
        <Stack.Screen name="savings/[id]" options={{ title: 'Savings Goal' }} />
        <Stack.Screen name="wag/[id]" options={{ title: 'WAG Group' }} />
        <Stack.Screen name="wag/create" options={{ title: 'Create WAG' }} />
        <Stack.Screen name="ai/chat" options={{ title: 'AI Advisor' }} />
        <Stack.Screen name="docs/index" options={{ title: 'Documentation', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
