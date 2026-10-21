import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  TextInput,
  Keyboard,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/colors"; // <-- IMPORTAÇÃO DAS CORES

type Account = {
  id: string;
  label: string;
  date: string;
  value: number;
  type: string;
};

// Função auxiliar para remover acentos e deixar minúsculo (melhora a busca em português)
const normalizeString = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function AccountsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  async function loadAccounts() {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setAccounts(data ?? []);
    }
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  }, []);

  // --- NOVO: Cálculo do saldo total ---
  const balance = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      if (curr.type === "income") {
        return acc + curr.value;
      } else {
        return acc - curr.value;
      }
    }, 0);
  }, [accounts]);
  // ------------------------------------

  // --- NOVO: Filtragem reativa das contas ---
  const filteredAccounts = useMemo(() => {
    if (!searchText.trim()) return accounts;

    const searchNormalized = normalizeString(searchText);
    
    return accounts.filter((item) => {
      // Busca no rótulo (descrição)
      const labelMatch = normalizeString(item.label).includes(searchNormalized);
      
      // Busca na data formatada (DD/MM/AAAA)
      const dateStr = new Date(item.date).toLocaleDateString("pt-BR");
      const dateMatch = dateStr.includes(searchText);

      return labelMatch || dateMatch;
    });
  }, [accounts, searchText]);
  // -------------------------------------------

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const openMenu = (account: Account) => {
    setSelectedAccount(account);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedAccount(null);
  };

  const confirmDelete = (account: Account) => {
    Alert.alert(
      "Remover conta",
      `Tem certeza que deseja remover "${account.label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => handleDelete(account.id),
        },
      ],
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // --- NOVO: Implementação do handleSearch ---
  const handleSearch = () => {
    Keyboard.dismiss(); // Fecha o teclado ao clicar no botão
    // A filtragem já acontece automaticamente via useMemo enquanto o usuário digita
  };
  // -------------------------------------------

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas contas</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            style={{ opacity: searchVisible ? 0.5 : 1 }}
            onPress={() => {
              setSearchVisible(!searchVisible);
              if (searchVisible) setSearchText(""); // Limpa a busca ao fechar
            }}
          >
            <Ionicons
              name={searchVisible ? "close-circle" : "search-outline"}
              size={25}
              color={colors.primary}
              style={{ marginRight: 14 }}
            />
          </Pressable>

          <Pressable
            style={[styles.addBtn, { flexDirection: "row" }]}
            onPress={() => router.push("/(tabs)/accounts/new")}
          >
            <Ionicons
              name="add-circle"
              size={25}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.addBtnText}>Nova</Text>
          </Pressable>
        </View>
      </View>

      {/* --- NOVO: Campo de busca --- */}
      <View
        style={[
          styles.searchContainer,
          searchVisible === true ? { display: "flex" } : { display: "none" },
        ]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por descrição ou data"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Pressable
          style={[styles.searchBtn, { flexDirection: "row" }]}
          onPress={handleSearch}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.searchBtnText}>Buscar</Text>
        </Pressable>
      </View>

      {/* --- Exibição do Saldo --- */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text
          style={[
            styles.balanceValue,
            balance >= 0 ? styles.income : styles.expense,
          ]}
        >
          {balance.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Text>
      </View>
      {/* -------------------------------- */}

      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
            ]}
            onLongPress={() => openMenu(item)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString("pt-BR")}
              </Text>
              <Text
                style={[
                  styles.type,
                  item.type === "income" ? styles.income : styles.expense,
                ]}
              >
                {item.type === "income" ? "entrada" : "saída"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.label}>{item.label}</Text>
              <Text
                style={[
                  styles.value,
                  item.type === "income" ? styles.income : styles.expense,
                ]}
              >
                {item.type === "income" ? "+" : "-"}{" "}
                {item.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searchText.trim() !== ""
              ? "Nenhuma conta encontrada para esta busca."
              : "Nenhuma conta encontrada."}
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>{selectedAccount?.label}</Text>

            <Pressable
              style={[
                styles.menuItem,
                { flexDirection: "row", alignItems: "center" },
              ]}
              onPress={() => {
                closeMenu();
                router.push(`/(tabs)/accounts/${selectedAccount?.id}`);
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={25}
                color={colors.primaryDark}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.menuItemText}>Editar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.menuItem,
                styles.menuItemDanger,
                { flexDirection: "row", alignItems: "center" },
              ]}
              onPress={() => {
                closeMenu();
                confirmDelete(selectedAccount!);
              }}
            >
              <Ionicons
                name="trash-outline"
                size={25}
                color={colors.danger}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                Remover
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Pressable
        style={[
          styles.exitBtn,
          { flexDirection: "row", backgroundColor: colors.primary, marginTop: 16 },
        ]}
        onPress={signOut}
      >
        <Ionicons
          name="home-outline"
          size={25}
          color={colors.textInverse}
          style={{ marginRight: 4 }}
        />
        <Text style={styles.exitBtnText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.textPrimary },
  addBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  exitBtn: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exitBtnText: { color: colors.textInverse, fontSize: 16, fontWeight: "600" },

  // --- NOVO: Estilos para o campo de busca ---
  searchContainer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  searchInput: {
    fontSize: 12,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 2,
    paddingVertical: 4,
    width: "80%",
  },
  searchBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  searchBtnText: { fontSize: 12 },

  // --- ESTILOS PARA O SALDO ---
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // ----------------------------------

  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopColor: colors.primary,
    borderBottomColor: colors.primary,
    borderTopWidth: 2,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
    width: "60%",
  },
  date: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    justifyContent: "flex-end",
    width: "40%",
    textAlign: "right",
  },
  income: { color: "green" },
  expense: { color: "red" },
  type: { textTransform: "uppercase", fontSize: 10, fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 24, color: colors.textMuted },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: "80%",
    padding: 16,
    elevation: 5,
    shadowColor: colors.surfaceMuted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemText: { fontSize: 16 },
  menuItemDanger: { backgroundColor: colors.dangerLight },
  menuItemTextDanger: { color: colors.danger, fontWeight: "600" },
});
