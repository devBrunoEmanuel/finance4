import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Pressable } from 'expo-router/build/views/Pressable';
import { router } from 'expo-router';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      Alert.alert('Erro de login', error.message);
    }
    // Se não houver erro, o useEffect do _layout redireciona automaticamente
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View>
          <Button title="Entrar" onPress={handleSignIn} />
          <Pressable style={styles.link} onPress={() => router.replace('/sign-up')}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: "#b507c530" },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: "#26002b" },
  input: { borderWidth: 1, borderColor: '#', borderRadius: 8, padding: 12, marginBottom: 16 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#0066cc' },
});