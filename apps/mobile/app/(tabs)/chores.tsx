import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Chore {
  id: string;
  title: string;
  assigned_to: string;
  due_date: string;
  completed: boolean;
  recurrence: 'täglich' | 'wöchentlich' | 'monatlich' | 'einmalig';
}

function useChores() {
  return useQuery({
    queryKey: ['chores'],
    queryFn: async (): Promise<Chore[]> => {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useToggleChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('chores')
        .update({ completed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores'] });
    },
  });
}

const RECURRENCE_COLORS: Record<string, string> = {
  täglich: '#EF4444',
  wöchentlich: '#4F46E5',
  monatlich: '#10B981',
  einmalig: '#6B7280',
};

function ChoreItem({ item }: { item: Chore }) {
  const toggleChore = useToggleChore();
  const recurrenceColor = RECURRENCE_COLORS[item.recurrence] ?? '#6B7280';

  return (
    <TouchableOpacity
      style={[styles.choreItem, item.completed && styles.choreItemCompleted]}
      onPress={() => toggleChore.mutate({ id: item.id, completed: !item.completed })}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </View>
      <View style={styles.choreInfo}>
        <Text style={[styles.choreTitle, item.completed && styles.choreTitleDone]}>
          {item.title}
        </Text>
        <View style={styles.choreMetaRow}>
          <View style={[styles.recurrenceBadge, { backgroundColor: `${recurrenceColor}15` }]}>
            <Text style={[styles.recurrenceText, { color: recurrenceColor }]}>
              {item.recurrence}
            </Text>
          </View>
          <Text style={styles.assignedTo}>
            <Ionicons name="person-outline" size={11} /> {item.assigned_to}
          </Text>
        </View>
      </View>
      <Text style={styles.dueDate}>{item.due_date}</Text>
    </TouchableOpacity>
  );
}

export default function ChoresScreen() {
  const { data: chores = [], isLoading } = useChores();
  const [filter, setFilter] = useState<'alle' | 'offen' | 'erledigt'>('alle');

  const filtered = chores.filter((c) => {
    if (filter === 'offen') return !c.completed;
    if (filter === 'erledigt') return c.completed;
    return true;
  });

  const completedCount = chores.filter((c) => c.completed).length;
  const progress = chores.length > 0 ? completedCount / chores.length : 0;

  return (
    <View style={styles.container}>
      {/* Fortschritts-Banner */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Wochenfortschritt</Text>
          <Text style={styles.progressFraction}>
            {completedCount}/{chores.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressPercent}>
          {Math.round(progress * 100)}% abgeschlossen
        </Text>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['alle', 'offen', 'erledigt'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Aufgabenliste */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChoreItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Alles erledigt!</Text>
            <Text style={styles.emptyText}>
              {filter === 'offen'
                ? 'Keine offenen Aufgaben — super!'
                : 'Noch keine Aufgaben angelegt.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  progressCard: {
    backgroundColor: '#4F46E5',
    margin: 16,
    borderRadius: 16,
    padding: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: { fontSize: 14, color: '#C7D2FE', fontWeight: '500' },
  progressFraction: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressPercent: { fontSize: 12, color: '#A5B4FC' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#4F46E5' },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  choreItem: {
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
  choreItemCompleted: { opacity: 0.6 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  choreInfo: { flex: 1 },
  choreTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  choreTitleDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  choreMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  recurrenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recurrenceText: { fontSize: 11, fontWeight: '600' },
  assignedTo: { fontSize: 12, color: '#9CA3AF' },
  dueDate: { fontSize: 12, color: '#9CA3AF' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
