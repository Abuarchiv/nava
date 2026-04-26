import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bgColor: string;
}

function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });
}

export default function DashboardScreen() {
  const { data: user } = useCurrentUser();

  const cards: DashboardCard[] = [
    {
      title: 'Offene Ausgaben',
      value: '3',
      subtitle: 'noch nicht abgerechnet',
      icon: 'wallet',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
    },
    {
      title: 'Heutige Aufgaben',
      value: '2',
      subtitle: 'Putzplan',
      icon: 'sparkles',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      title: 'Einkaufsliste',
      value: '5',
      subtitle: 'Artikel ausstehend',
      icon: 'cart',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      title: 'Neue Pinnwand',
      value: '1',
      subtitle: 'ungelesene Nachricht',
      icon: 'megaphone',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
  ];

  const displayName = user?.email?.split('@')[0] ?? 'WG-Mitglied';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Begrüßung */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetingSmall}>Guten Tag,</Text>
          <Text style={styles.greetingName}>{displayName} 👋</Text>
        </View>
        <TouchableOpacity style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Karten-Grid */}
      <Text style={styles.sectionTitle}>Übersicht</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: card.bgColor }]}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, { backgroundColor: card.color }]}>
              <Ionicons name={card.icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardValue, { color: card.color }]}>
              {card.value}
            </Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Letzte Aktivitäten */}
      <Text style={styles.sectionTitle}>Letzte Aktivitäten</Text>
      <View style={styles.activityList}>
        {[
          { icon: 'receipt-outline' as const, text: 'Lebensmittel hinzugefügt', time: 'vor 2h', color: '#4F46E5' },
          { icon: 'checkmark-circle-outline' as const, text: 'Badezimmer geputzt', time: 'vor 5h', color: '#10B981' },
          { icon: 'cart-outline' as const, text: 'Milch auf die Liste', time: 'gestern', color: '#F59E0B' },
        ].map((item, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={[styles.activityIconBg, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={styles.activityText}>{item.text}</Text>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  greetingSmall: {
    fontSize: 14,
    color: '#6B7280',
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  avatarButton: {
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
