import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../lib/colors";
import { CATEGORIES } from "../../../lib/categories";

type AccountType = "income" | "expense";

export default function NewAccountScreen() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
  const [value, setValue] = useState("");
  const [type, setType] = useState<AccountType>("expense");
  const [category, setCategory] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidDate = (d: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert("Erro", "Informe um rótulo");
      return;
    }
    if (!isValidDate(date)) {
      Alert.alert("Erro", "Data inválida. Use o formato YYYY-MM-DD");
      return;
    }
    const numValue = parseFloat(value.replace(",", "."));
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert("Erro", "Informe um valor maior que zero");
      return;
    }
    if (!category) {
      Alert.alert("Erro", "Selecione uma categoria");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("accounts").insert({
      label: label.trim(),
      date: new Date(date).toISOString(),
      value: numValue,
      type,
      category,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Nova conta</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.label}>Rótulo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Aluguel, Salário..."
          value={label}
          onChangeText={setLabel}
        />

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          keyboardType={Platform.OS === "ios" ? "default" : "number-pad"}
        />

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          value={value}
          onChangeText={setValue}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Categoria</Text>
        <Pressable
          style={styles.dropdownBtn}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text
            style={[
              styles.dropdownBtnText,
              !category && { color: colors.textMuted },
            ]}
          >
            {category || "Selecione uma categoria"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Pressable>

        {/* Modal de seleção de categoria */}
        <Modal
          visible={categoryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setCategoryModalVisible(false)}
          >
            <View style={styles.dropdownModal}>
              <Text style={styles.dropdownModalTitle}>Selecione a categoria</Text>
              <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.dropdownItem,
                      category === item && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setCategory(item);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        category === item && styles.dropdownItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {category === item && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeBtn,
              type === "income" && styles.typeBtnActiveIncome,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.typeText,
                type === "income" && styles.typeTextActive,
              ]}
            >
              Receita
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.typeBtn,
              type === "expense" && styles.typeBtnActiveExpense,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.typeText,
                type === "expense" && styles.typeTextActive,
              ]}
            >
              Despesa
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 24 }} />
      ) : (
        <View
          style={{
            marginTop: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Pressable
            style={[styles.btnSave, { flexDirection: "row" }]}
            onPress={handleSave}
          >
            <Ionicons
              name="checkmark-circle"
              size={25}
              color={colors.textInverse}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: colors.textInverse,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Salvar
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btnCancel, { flexDirection: "row" }]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="close-outline"
              size={25}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}
            >
              Cancelar
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: colors.background },
  titleContainer: {
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.textPrimary,
  },
  form: { marginTop: 8, padding: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },

  // --- Estilos do dropdown de categoria ---
  dropdownBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownBtnText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: "85%",
    maxHeight: "60%",
    padding: 16,
    elevation: 5,
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryMuted,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdownItemTextActive: {
    fontWeight: "bold",
    color: colors.primary,
  },
  // ------------------------------------------

  typeRow: { flexDirection: "row", gap: 12 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
  },
  typeBtnActiveIncome: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  typeBtnActiveExpense: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  typeText: { fontSize: 16 },
  typeTextActive: { fontWeight: "bold" },
  btnSave: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
