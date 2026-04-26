import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  added_by: string;
  category: string;
  created_at: string;
}

function useShoppingList() {
  return useQuery({
    queryKey: ['shopping'],
    queryFn: async (): Promise<ShoppingItem[]> => {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<ShoppingItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  });
}

function useToggleItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from('shopping_items')
        .update({ checked })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  });
}

function useDeleteChecked() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('checked', true);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  });
}

function ShoppingListItem({ item }: { item: ShoppingItem }) {
  const toggleItem = useToggleItem();

  return (
    <TouchableOpacity
      style={[styles.listItem, item.checked && styles.listItemChecked]}
      onPress={() => toggleItem.mutate({ id: item.id, checked: !item.checked })}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameDone]}>
          {item.name}
        </Text>
        {item.quantity ? (
          <Text style={styles.itemQty}>{item.quantity}</Text>
        ) : null}
      </View>
      <Text style={styles.addedBy}>{item.added_by}</Text>
    </TouchableOpacity>
  );
}

export default function ShoppingScreen() {
  const { data: items = [] } = useShoppingList();
  const addItem = useAddItem();
  const deleteChecked = useDeleteChecked();
  const [newItem, setNewItem] = useState('');
  const [quantity, setQuantity] = useState('');

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await addItem.mutateAsync({
      name: newItem.trim(),
      quantity: quantity.trim(),
      checked: false,
      added_by: user?.email?.split('@')[0] ?? 'Unbekannt',
      category: 'Allgemein',
    });
    setNewItem('');
    setQuantity('');
  };

  const handleClearChecked = () => {
    if (checked.length === 0) return;
    Alert.alert(
      'Erledigte löschen',
      `${checked.length} erledigte Artikel entfernen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => deleteChecked.mutate() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Schnell-Eingabe */}
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.mainInput}
            placeholder="Artikel hinzufügen..."
            placeholderTextColor="#9CA3AF"
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TextInput
            style={styles.qtyInput}
            placeholder="Menge"
            placeholderTextColor="#9CA3AF"
            value={quantity}
            onChangeText={setQuantity}
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            disabled={!newItem.trim() || addItem.isPending}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[...unchecked, ...checked]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ShoppingListItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          unchecked.length > 0 ? (
            <Text style={styles.sectionHeader}>
              Noch kaufen ({unchecked.length})
            </Text>
          ) : null
        }
        ListFooterComponent={
          checked.length > 0 ? (
            <View>
              <View style={styles.checkedHeader}>
                <Text style={styles.sectionHeader}>Im Wagen ({checked.length})</Text>
                <TouchableOpacity onPress={handleClearChecked}>
                  <Text style={styles.clearText}>Alle entfernen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Liste ist leer</Text>
            <Text style={styles.emptyText}>Füge Artikel hinzu, die ihr einkaufen müsst.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inputCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  mainInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
  },
  qtyInput: {
    width: 80,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  checkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  clearText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  separator: { height: 6 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  listItemChecked: { opacity: 0.55 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: '#10B981', borderColor: '#10B981' },
  itemContent: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: '#111827' },
  itemNameDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  itemQty: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  addedBy: { fontSize: 12, color: '#D1D5DB' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
