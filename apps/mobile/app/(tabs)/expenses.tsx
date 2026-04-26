import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Expense {
  id: string;
  title: string;
  amount: number;
  paid_by: string;
  created_at: string;
  category: string;
}

function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

const CATEGORIES = ['Lebensmittel', 'Haushalt', 'Miete', 'Nebenkosten', 'Sonstiges'];

const CATEGORY_COLORS: Record<string, string> = {
  Lebensmittel: '#10B981',
  Haushalt: '#4F46E5',
  Miete: '#EF4444',
  Nebenkosten: '#F59E0B',
  Sonstiges: '#6B7280',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function ExpenseItem({ item }: { item: Expense }) {
  const color = CATEGORY_COLORS[item.category] ?? '#6B7280';
  return (
    <View style={styles.expenseItem}>
      <View style={[styles.categoryDot, { backgroundColor: color }]} />
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseMeta}>
          {item.category} · {item.paid_by}
        </Text>
      </View>
      <Text style={[styles.expenseAmount, { color }]}>
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );
}

export default function ExpensesScreen() {
  const { data: expenses = [], isLoading } = useExpenses();
  const addExpense = useAddExpense();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Pflichtfelder', 'Bitte Titel und Betrag ausfüllen.');
      return;
    }
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Ungültiger Betrag', 'Bitte einen gültigen Betrag eingeben.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    await addExpense.mutateAsync({
      title: title.trim(),
      amount: parsed,
      paid_by: user?.email ?? 'Unbekannt',
      category,
    });
    setTitle('');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Zusammenfassung */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Gesamtausgaben</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalAmount)}</Text>
        <Text style={styles.summaryCount}>{expenses.length} Einträge</Text>
      </View>

      {/* Liste */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Keine Ausgaben</Text>
            <Text style={styles.emptyText}>
              Füge eure erste gemeinsame Ausgabe hinzu.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal: Ausgabe hinzufügen */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ausgabe hinzufügen</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Bezeichnung</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. Lebensmittel REWE"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Betrag (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Kategorie</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && { color: '#FFFFFF' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, addExpense.isPending && styles.buttonDisabled]}
              onPress={handleAdd}
              disabled={addExpense.isPending}
            >
              <Text style={styles.submitButtonText}>Speichern</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  summaryCard: {
    backgroundColor: '#4F46E5',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryLabel: { fontSize: 13, color: '#C7D2FE', marginBottom: 4 },
  summaryAmount: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  summaryCount: { fontSize: 13, color: '#A5B4FC', marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  expenseMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalBody: { padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  submitButton: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
