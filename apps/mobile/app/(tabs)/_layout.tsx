import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

const TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Übersicht',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    name: 'expenses',
    title: 'Ausgaben',
    icon: 'wallet-outline',
    iconFocused: 'wallet',
  },
  {
    name: 'chores',
    title: 'Putzplan',
    icon: 'sparkles-outline',
    iconFocused: 'sparkles',
  },
  {
    name: 'shopping',
    title: 'Einkaufen',
    icon: 'cart-outline',
    iconFocused: 'cart',
  },
  {
    name: 'announcements',
    title: 'Pinnwand',
    icon: 'megaphone-outline',
    iconFocused: 'megaphone',
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: 'transparent',
          borderBottomColor: '#F3F4F6',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#111827',
        },
        headerTintColor: '#4F46E5',
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
