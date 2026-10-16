import { View, Text, Button, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="bar-chart-outline" color="#b507c5" size={150} style={{ marginBottom: 48 }} />
      <Text style={styles.title}>Bem-vindo 👋</Text>
      <Text style={styles.subtitle}>Gerencie suas contas com facilidade</Text>
      
      <Pressable
        style={styles.btnSignIn} 
        onPress={() => router.push('/sign-in')}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Entrar</Text>
      </Pressable>

      <Pressable 
        style={styles.btnSignUp} 
        onPress={() => router.push('/sign-up')}
      >
        <Text style={{ color: '#b507c5', fontSize: 16, fontWeight: '600' }}>Criar conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: "#b507c530" },
  btnSignIn: { backgroundColor: '#b507c5', padding: 16, borderRadius: 8, marginTop: 24, width: '90%', justifyContent: 'center', alignItems: 'center' },
  btnSignUp: { backgroundColor: '#fff', borderWidth: 1, borderColor: "#b507c5", color: "#b507c5", padding: 16, borderRadius: 8, marginTop: 12, width: '90%', justifyContent: 'center', alignItems: 'center' },
  title: { color: "#26002b", fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
});