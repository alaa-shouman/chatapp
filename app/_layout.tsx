import '../global.css';
import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui, TamaguiProvider } from '@tamagui/core';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const config = createTamagui(defaultConfig)

  return (
    <TamaguiProvider config={config} >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TamaguiProvider>
  );
}