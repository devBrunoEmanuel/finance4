import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Button,
  ActivityIndicator, Modal, Pressable, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

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

  // Recarrega sempre que a tela ganha foco (ex.: voltar de /accounts/new)
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
      // Remove localmente para feedback imediato
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas contas</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/(tabs)/accounts/new')}>
          <Text style={styles.addBtnText}>+ Nova</Text>
        </Pressable>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
            onLongPress={() => openMenu(item)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={[styles.type, item.type === 'income' ? styles.income : styles.expense]}>{item.type === 'income' ? 'entrada' : 'saída'}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={[styles.value, item.type === 'income' ? styles.income : styles.expense]}>
                {item.type === 'income' ? '+' : '-'} R$ {item.value.toFixed(2)}
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
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push(`/(tabs)/accounts/${selectedAccount?.id}`);
              }}
            >
              <Text style={styles.menuItemText}>✏️ Editar</Text>
            </Pressable>

            <Pressable
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                closeMenu();
                confirmDelete(selectedAccount!);
              }}
            >
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                🗑️ Remover
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Pressable style={styles.addBtn} onPress={signOut}>
        <Text style={styles.addBtnText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#0066cc', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: '#f5f5f5', padding: 16, borderColor: '#06060630', borderWidth: 1, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  value: { fontSize: 14, fontWeight: 'bold', marginTop: 8, justifyContent: 'flex-end' },
  income: { color: 'green' },
  expense: { color: 'red' },
  type: { textTransform: 'uppercase', fontSize: 10 },
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
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemText: { fontSize: 16 },
  menuItemDanger: { backgroundColor: '#fff5f5' },
  menuItemTextDanger: { color: '#dc3545', fontWeight: '600' },
});