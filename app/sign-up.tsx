import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { colors } from "../lib/colors"; // <-- IMPORTAÇÃO DAS CORES
import { authErrorMessage } from "../lib/authErrors";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  // Mensagem na própria tela: Alert.alert não aparece no navegador (web)
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUp = async () => {
    setErrorMsg("");
    if (!email.trim() || !password || !confirm) {
      setErrorMsg("Preencha todos os campos.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("As senhas não conferem.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMsg(authErrorMessage(error.message));
    } else {
      Alert.alert("Sucesso", "Conta criada! Faça login para continuar.", [
        { text: "OK", onPress: () => router.replace("/sign-in") },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <View style={{ alignItems: "center" }}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Pressable style={styles.btnSignIn} onPress={handleSignUp}>
            <Text
              style={{
                color: colors.textInverse,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Cadastrar
            </Text>
          </Pressable>
        )}

        <Pressable
          style={styles.link}
          onPress={() => router.replace("/sign-in")}
        >
          <Text style={styles.linkText}>Já tem conta? Entrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: colors.textLink, fontSize: 16, fontWeight: "600" },
  btnSignIn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
});
