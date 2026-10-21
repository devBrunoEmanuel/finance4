import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, Button,
  ActivityIndicator, Modal, Pressable, RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Account = {
  id: string;
  label: string;
  date: string;
  value: number;
  type: string;
};

export default function AccountsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  async function loadAccounts() {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('date', { ascending: false });

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
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  }, []);

  // --- NOVO: Cálculo do saldo total ---
  const balance = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      if (curr.type === 'income') {
        return acc + curr.value;
      } else {
        return acc - curr.value;
      }
    }, 0);
  }, [accounts]);
  // ------------------------------------

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
      'Remover conta',
      `Tem certeza que deseja remover "${account.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => handleDelete(account.id),
        },
      ]
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSearch = () => {
    console.log(searchText);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas contas</Text>

        <Pressable style={searchVisible === true ? {{opacity: 0.5, duration: 400}} : {opacity: 1}} onPress={() => { setSearchVisible(!searchVisible); }}>
          <Ionicons name="search-outline" size={25} color="#b507c5" style={{ marginRight: 4 }} />
        </Pressable>

        <Pressable style={[styles.addBtn, { flexDirection: 'row' }]} onPress={() => router.push('/(tabs)/accounts/new')}>
          <Ionicons name="add-circle" size={25} color="#b507c5" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Nova</Text>
        </Pressable>
      </View>

      {/* --- NOVO: Campo de busca --- */}
      <View style={[styles.searchContainer, searchVisible === true ? {display: 'flex'} : {display: 'none'}]}>
        <TextInput style={styles.searchInput} placeholder="Buscar por descrição ou data" onChangeText={setSearchText} />
        <Pressable style={[styles.searchBtn, {flexDirection: 'row'}]} onPress={handleSearch}>
          <Ionicons name="search-outline" size={16} color="#b507c5" style={{ marginRight: 4 }} />
          <Text style={styles.searchBtnText}>Buscar</Text>
        </Pressable>
      </View>
      
      {/* --- Exibição do Saldo --- */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text style={[styles.balanceValue, balance >= 0 ? styles.income : styles.expense]}>
          {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>
      {/* -------------------------------- */}

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
            onLongPress={() => openMenu(item)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
              <Text style={[styles.type, item.type === 'income' ? styles.income : styles.expense]}>
                {item.type === 'income' ? 'entrada' : 'saída'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={[styles.value, item.type === 'income' ? styles.income : styles.expense]}>
                {item.type === 'income' ? '+' : '-'} {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma conta encontrada</Text>}
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
              style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                closeMenu();
                router.push(`/(tabs)/accounts/${selectedAccount?.id}`);
              }}
            >
              <Ionicons name="pencil-outline" size={25} color="#8a1297" style={{ marginRight: 4 }} />
              <Text style={styles.menuItemText}>Editar</Text>
            </Pressable>

            <Pressable
              style={[styles.menuItem, styles.menuItemDanger, { flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                closeMenu();
                confirmDelete(selectedAccount!);
              }}
            >
              <Ionicons name="trash-outline" size={25} color="#e53e3e" style={{ marginRight: 4 }} />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Remover</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Pressable style={[styles.addBtn, { flexDirection: 'row', backgroundColor: '#ff00000a', marginTop: 16 }]} onPress={signOut}>
        <Ionicons name="home-outline" size={25} color="#b507c5" style={{ marginRight: 4 }} />
        <Text style={styles.addBtnText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#b507c530' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: "#26002b" },
  addBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: "#b507c5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#b507c5', fontSize: 16, fontWeight: '600' },
  
  // --- NOVO: Estilos para o campo de busca ---
  searchContainer: { height: 40, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 4, marginBottom: 16, justifyContent: 'space-between' },
  searchInput: { fontSize: 12, color: '#26002b', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: "#b507c5", paddingHorizontal: 2, paddingVertical: 4, width: '80%' },
  searchBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: "#b507c5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  searchBtnText: { fontSize: 12 },

  // --- ESTILOS PARA O SALDO ---
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#b507c5',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // ----------------------------------

  card: { backgroundColor: '#fff', padding: 16, borderTopColor: '#b507c5', borderBottomColor: '#b507c5', borderTopWidth: 2, borderBottomWidth: 1, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: '#06060630', paddingBottom: 4, color: '#333', backgroundColor: '#fffa', width: '60%' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  value: { fontSize: 14, fontWeight: 'bold', marginTop: 8, justifyContent: 'flex-end', width: '40%', textAlign: 'right' },
  income: { color: 'green' },
  expense: { color: 'red' },
  type: { textTransform: 'uppercase', fontSize: 10, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 24, color: '#888' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#837085',
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemText: { fontSize: 16 },
  menuItemDanger: { backgroundColor: '#e53e3e30' },
  menuItemTextDanger: { color: '#e53e3e', fontWeight: '600' },
});