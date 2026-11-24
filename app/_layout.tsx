import { useState } from 'react';
import { Stack, Redirect, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import SplashScreen from '../components/SplashScreen';

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [splashDone, setSplashDone] = useState(false);

  // Splash Screen: primeira tela do app. Fica visível pelo tempo mínimo
  // da animação e também enquanto a sessão do usuário ainda está carregando.
  if (!splashDone || loading) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  const inAuthGroup = segments[0] === '(tabs)';

  if (!user && inAuthGroup) {
    return <Redirect href="/" />;
  }

  if (user && !inAuthGroup) {
    return <Redirect href="/(tabs)/accounts" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}