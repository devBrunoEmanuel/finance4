import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  ActivityIndicator, Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { colors } from '../../../lib/colors'; // <-- IMPORTAÇÃO DAS CORES

type AccountType = 'income' | 'expense';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<AccountType>('expense');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        Alert.alert('Erro', 'Conta não encontrada');
        router.back();
        return;
      }

      setLabel(data.label);
      setDate(new Date(data.date).toISOString().split('T')[0]);
      setValue(String(data.value));
      setType(data.type as AccountType);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('Erro', 'Informe um rótulo');
      return;
    }
    const numValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Erro', 'Informe um valor maior que zero');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('accounts')
      .update({
        label: label.trim(),
        date: new Date(date).toISOString(),
        value: numValue,
        type,
      })
      .eq('id', id);
    setSaving(false);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
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

      <Text style={styles.label}>Rótulo</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
      />

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

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.typeRow}>
        <Pressable
          style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
            Receita
          </Text>
        </Pressable>
        <Pressable
          style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
            Despesa
          </Text>
        </Pressable>
      </View>

      {saving ? (
        <ActivityIndicator size="large" style={{ marginTop: 24 }} />
      ) : (
        <View style={{ marginTop: 24 }}>
          <Button title="Salvar alterações" onPress={handleSave} />
          <View style={{ height: 12 }} />
          <Button title="Cancelar" color={colors.primaryLight} onPress={() => router.back()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: colors.textSecondary },
  input: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center',
  },
  typeBtnActiveIncome: { backgroundColor: colors.successLight, borderColor: colors.success },
  typeBtnActiveExpense: { backgroundColor: colors.dangerLight, borderColor: colors.danger },
  typeText: { fontSize: 16 },
  typeTextActive: { fontWeight: 'bold' },
});