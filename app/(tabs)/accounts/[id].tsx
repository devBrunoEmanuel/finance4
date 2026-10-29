import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../lib/colors";
import { CATEGORIES } from "../../../lib/categories";

type AccountType = "income" | "expense";

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<AccountType>("expense");
  const [category, setCategory] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        Alert.alert("Erro", "Conta não encontrada");
        router.back();
        return;
      }

      setLabel(data.label);
      setDate(new Date(data.date).toISOString().split("T")[0]);
      setValue(String(data.value));
      setType(data.type as AccountType);
      setCategory(data.category || "");
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert("Erro", "Informe um rótulo");
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

    setSaving(true);
    const { error } = await supabase
      .from("accounts")
      .update({
        label: label.trim(),
        date: new Date(date).toISOString(),
        value: numValue,
        type,
        category,
      })
      .eq("id", id);
    setSaving(false);

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
    } else {
      router.back(); // volta para a lista, que recarrega via useFocusEffect
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar conta</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.label}>Rótulo</Text>
        <TextInput style={styles.input} value={label} onChangeText={setLabel} />

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
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

      {saving ? (
        <ActivityIndicator size="large" style={{ marginTop: 24 }} />
      ) : (
        <View
          style={{
            marginTop: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
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
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.textPrimary,
  },
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
    marginBottom: 16,
    backgroundColor: colors.surface,
  },

  // --- Estilos do dropdown de categoria ---
  dropdownBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
