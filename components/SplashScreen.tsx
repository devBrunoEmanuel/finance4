import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors } from '../lib/colors';

// Nome exibido na splash e versão lida do app.json ("version")
export const APP_NAME = 'Finance 4.0';
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

// Tempo mínimo que a splash fica visível (ms)
const SPLASH_DURATION = 2500;

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // useNativeDriver não é suportado na web
    const useNativeDriver = Platform.OS !== 'web';

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver }),
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver }),
    ]).start();

    const timer = setTimeout(onFinish, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logo, { opacity, transform: [{ scale }] }]}>
        <Ionicons name="stats-chart-sharp" size={72} color={colors.primary} />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.name}>{APP_NAME}</Text>
        <Text style={styles.slogan}>Gerencie suas contas com facilidade</Text>
      </Animated.View>

      <Animated.Text style={[styles.version, { opacity: textOpacity }]}>
        v{APP_VERSION}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 24,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  name: {
    color: colors.textInverse,
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  slogan: {
    color: colors.textInverse,
    opacity: 0.85,
    fontSize: 15,
    marginTop: 8,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: colors.textInverse,
    opacity: 0.8,
    fontSize: 14,
    fontWeight: '600',
  },
});
