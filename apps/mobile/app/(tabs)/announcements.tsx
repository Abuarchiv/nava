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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  pinned: boolean;
  emoji: string;
}

function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function usePostAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: Omit<Announcement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcement)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffH < 24) return `vor ${diffH} Std.`;
  if (diffD === 1) return 'gestern';
  return `vor ${diffD} Tagen`;
}

const EMOJIS = ['📌', '🏠', '🎉', '⚠️', '🛒', '🧹', '💬', '📅'];

function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <View style={[styles.card, item.pinned && styles.cardPinned]}>
      {item.pinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={10} color="#4F46E5" />
          <Text style={styles.pinnedText}>Angeheftet</Text>
        </View>
      )}
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardAuthorTime}>
            {item.author} · {formatRelativeTime(item.created_at)}
          </Text>
        </View>
      </View>
      <Text style={styles.cardContent}>{item.content}</Text>
    </View>
  );
}

export default function AnnouncementsScreen() {
  const { data: announcements = [] } = useAnnouncements();
  const postAnnouncement = usePostAnnouncement();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [pinned, setPinned] = useState(false);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await postAnnouncement.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      author: user?.email?.split('@')[0] ?? 'Unbekannt',
      pinned,
      emoji: selectedEmoji,
    });
    setTitle('');
    setContent('');
    setSelectedEmoji(EMOJIS[0]);
    setPinned(false);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnnouncementCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Noch keine Beiträge</Text>
            <Text style={styles.emptyText}>
              Teile etwas mit deiner WG.
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
        <Ionicons name="pencil" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Post-Modal */}
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
            <Text style={styles.modalTitle}>Beitrag erstellen</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Emoji Picker */}
            <Text style={styles.fieldLabel}>Emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === e && styles.emojiButtonSelected,
                  ]}
                  onPress={() => setSelectedEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Titel</Text>
            <TextInput
              style={styles.input}
              placeholder="Worum geht's?"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Nachricht</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Schreib etwas für deine WG..."
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Anheften Toggle */}
            <TouchableOpacity
              style={styles.pinToggle}
              onPress={() => setPinned(!pinned)}
            >
              <View style={[styles.pinIcon, pinned && styles.pinIconActive]}>
                <Ionicons
                  name="pin"
                  size={16}
                  color={pinned ? '#FFFFFF' : '#6B7280'}
                />
              </View>
              <Text style={[styles.pinLabel, pinned && styles.pinLabelActive]}>
                Beitrag anheften
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, postAnnouncement.isPending && styles.buttonDisabled]}
              onPress={handlePost}
              disabled={postAnnouncement.isPending || !title.trim() || !content.trim()}
            >
              <Text style={styles.submitButtonText}>Veröffentlichen</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPinned: {
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#FAFBFF',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  pinnedText: { fontSize: 11, color: '#4F46E5', fontWeight: '600' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardEmoji: { fontSize: 26, marginRight: 10 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardAuthorTime: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  cardContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  emptyText: { fontSize: 13, color: '#9CA3AF' },
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
  modalBody: { padding: 20, flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  emojiRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  emojiText: { fontSize: 22 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { height: 100 },
  pinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  pinIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIconActive: { backgroundColor: '#4F46E5' },
  pinLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  pinLabelActive: { color: '#4F46E5', fontWeight: '600' },
  submitButton: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
