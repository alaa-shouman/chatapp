import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui, TamaguiProvider } from '@tamagui/core';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';
import store, { persistor } from '@/redux/store';
import { AuthProvider } from '@/context/AuthContext';
import { EchoContextProvider } from '@/context/EchoContext';

export default function RootLayout() {
  const config = createTamagui(defaultConfig)

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <EchoContextProvider>
        <TamaguiProvider config={config} >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </TamaguiProvider>
            </EchoContextProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}