import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Pressable } from 'expo-router/build/views/Pressable';

type Account = {
  id: string;
  label: string;
  date: string;
  value: number;
  type: string;
};

export default function AccountsScreen() {
  const { signOut } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async)
  async function loadAccounts() {
    setLoading(true);
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

  useEffect(() => {
    loadAccounts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const router = useRouter();

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
          <View style={styles.card}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={[styles.value, item.type === 'income' ? styles.income : styles.expense]}>
              {item.type === 'income' ? '+' : '-'} R$ {item.value.toFixed(2)}
            </Text>
            <Text style={styles.type}>{item.type}</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma conta encontrada</Text>}
      />
      <Button title="Sair" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 18, fontWeight: '600' },
  date: { color: '#666', marginTop: 4 },
  value: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  income: { color: 'green' },
  expense: { color: 'red' },
  type: { textTransform: 'uppercase', fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 24, color: '#888' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#0066cc', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
});