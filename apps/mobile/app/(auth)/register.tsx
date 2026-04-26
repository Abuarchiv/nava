import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

// Registrierung erfolgt über Einladungslink — kein klassisches Register-Flow
export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konto erstellen</Text>
      <Text style={styles.text}>
        Nava ist einladungsbasiert. Bitte wende dich an deine WG, um eine Einladung zu erhalten.
      </Text>
      <Link href="/(auth)/login" style={styles.link}>
        Zurück zum Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
