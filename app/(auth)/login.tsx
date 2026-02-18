import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../auth/_AuthProvider';

export default function Login() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handle = async () => {
    try {
      await login(form.usernameOrEmail, form.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al iniciar sesión');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerWrap}>
          <View style={styles.card}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Acceso</Text>
            </View>

            <Text style={styles.title}>Bienvenido a POTRERO</Text>
            <Text style={styles.subtitle}>Inicia sesion para gestionar tus torneos.</Text>

            <View style={styles.formWrap}>
            <TextInput
              value={form.usernameOrEmail}
              onChangeText={(text) => setForm({ ...form, usernameOrEmail: text })}
              placeholder="Usuario o email"
              placeholderTextColor="#a3a3a3"
              style={[styles.input, styles.inputSpacing]}
              autoCapitalize="none"
            />

            <TextInput
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholder="Contrasena"
              placeholderTextColor="#a3a3a3"
              secureTextEntry
              style={[styles.input, styles.inputSpacing]}
              onSubmitEditing={handle}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity 
              onPress={handle}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 24,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pillText: {
    color: '#fff',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 6,
  },
  formWrap: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputSpacing: {
    marginTop: 12,
  },
  errorText: {
    color: '#f87171',
    marginTop: 8,
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: '#e11d1d',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  registerRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  registerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  registerLink: {
    color: '#e11d1d',
    fontSize: 13,
    fontWeight: '700',
  },
});
