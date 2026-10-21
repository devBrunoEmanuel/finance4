import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/colors"; // <-- IMPORTAÇÃO DAS CORES

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons
        name="stats-chart-sharp"
        color={colors.primary}
        size={150}
        style={{ marginBottom: 48 }}
      />
      <Text style={styles.title}>Bem-vindo 👋</Text>
      <Text style={styles.subtitle}>Gerencie suas contas com facilidade</Text>

      <Pressable
        style={styles.btnSignIn}
        onPress={() => router.push("/sign-in")}
      >
        <Text
          style={{ color: colors.textInverse, fontSize: 16, fontWeight: "600" }}
        >
          Entrar
        </Text>
      </Pressable>

      <Pressable
        style={styles.btnSignUp}
        onPress={() => router.push("/sign-up")}
      >
        <Text
          style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}
        >
          Criar conta
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  btnSignIn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnSignUp: {
    backgroundColor: colors.textInverse,
    borderWidth: 1,
    borderColor: colors.primary,
    color: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
});
