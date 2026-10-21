import { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  ActivityIndicator, Pressable, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../lib/colors'; // <-- IMPORTAÇÃO DAS CORES

type AccountType = 'income' | 'expense';

export default function NewAccountScreen() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [value, setValue] = useState('');
  const [type, setType] = useState<AccountType>('expense');
  const [loading, setLoading] = useState(false);

  const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('Erro', 'Informe um rótulo');
      return;
    }
    if (!isValidDate(date)) {
      Alert.alert('Erro', 'Data inválida. Use o formato YYYY-MM-DD');
      return;
    }
    const numValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Erro', 'Informe um valor maior que zero');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('accounts').insert({
      label: label.trim(),
      date: new Date(date).toISOString(),
      value: numValue,
      type,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova conta</Text>

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
        keyboardType={Platform.OS === 'ios' ? 'default' : 'number-pad'}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
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

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 24 }} />
      ) : (
        <View style={{ marginTop: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
          <Pressable
            style={[styles.btnSave, {flexDirection: 'row'}]} 
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={25} color="#fff" style={{ marginRight: 4 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Salvar</Text>
          </Pressable>

          <Pressable 
            style={[styles.btnCancel, {flexDirection: 'row'}]} 
            onPress={() => router.back()}
          >
            <Ionicons name="close-outline" size={25} color="#b507c5" style={{ marginRight: 4 }} />
            <Text style={{ color: '#b507c5', fontSize: 16, fontWeight: '600' }}>Cancelar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#b507c530' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: "#26002b" },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#837085' },
  input: { borderWidth: 1, borderColor: '#b507c5', borderRadius: 8, padding: 12, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b507c5', alignItems: 'center',
  },
  typeBtnActiveIncome: { backgroundColor: '#d4edda', borderColor: '#28a745' },
  typeBtnActiveExpense: { backgroundColor: '#f8d7da', borderColor: '#dc3545' },
  typeText: { fontSize: 16 },
  typeTextActive: { fontWeight: 'bold' },
  btnSave: { backgroundColor: '#b507c5', padding: 16, borderRadius: 8, marginTop: 24, width: '45%', justifyContent: 'center', alignItems: 'center' },
  btnCancel: { backgroundColor: '#8a129730', padding: 16, borderRadius: 8, marginTop: 24, width: '45%', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "#8a1297" },
});