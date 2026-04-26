import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setErrorMessage('Bitte gib deine E-Mail-Adresse ein.');
      setState('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Bitte gib eine gültige E-Mail-Adresse ein.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: 'nava://auth/callback',
      },
    });

    if (error) {
      setState('error');
      setErrorMessage('Fehler beim Senden des Magic Links. Bitte versuche es erneut.');
    } else {
      setState('success');
    }
  };

  const handleReset = () => {
    setState('idle');
    setEmail('');
    setErrorMessage('');
  };

  if (state === 'success') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>E-Mail gesendet!</Text>
          <Text style={styles.successText}>
            Wir haben dir einen Magic Link an{' '}
            <Text style={styles.emailHighlight}>{email}</Text> gesendet.
            Klicke auf den Link in der E-Mail, um dich anzumelden.
          </Text>
          <TouchableOpacity onPress={handleReset} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Andere E-Mail verwenden</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Logo + Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>N</Text>
        </View>
        <Text style={styles.appName}>Nava</Text>
        <Text style={styles.tagline}>Dein WG-Zuhause</Text>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Willkommen zurück</Text>
        <Text style={styles.cardSubtitle}>
          Gib deine E-Mail-Adresse ein — wir schicken dir einen Magic Link.
        </Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>E-Mail-Adresse</Text>
          <TextInput
            style={[styles.input, state === 'error' && styles.inputError]}
            placeholder="name@beispiel.de"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (state === 'error') {
                setState('idle');
                setErrorMessage('');
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={state !== 'loading'}
          />
        </View>

        {state === 'error' && errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, state === 'loading' && styles.buttonDisabled]}
          onPress={handleMagicLink}
          disabled={state === 'loading'}
          activeOpacity={0.85}
        >
          {state === 'loading' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Magic Link senden</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Noch kein Konto? Warte auf eine Einladung von deiner WG.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 12,
    marginTop: 2,
  },
  button: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  // Success State
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emailHighlight: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});
