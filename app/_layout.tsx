import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';
export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = false;
  useEffect(() => {
    // if (isLoading) return; 
    // const inAuthGroup = segments[0] === '(auth)';
    // if (!isAuthenticated && !inAuthGroup) {
    //   router.replace('/(auth)/login');
    // } else if (isAuthenticated && inAuthGroup) {
    //   router.replace('/(tabs)');
    // }
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}