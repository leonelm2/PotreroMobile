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

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const submit = async () => {
    try {
      await register(form.username, form.email, form.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al registrar');
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
              <Text style={styles.pillText}>Registro</Text>
            </View>

            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Registrate como entrenador para gestionar tus equipos.</Text>

            <View style={styles.formWrap}>
            <TextInput
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
              placeholder="Usuario"
              placeholderTextColor="#a3a3a3"
              style={[styles.input, styles.inputSpacing]}
              autoCapitalize="none"
            />
            
            <TextInput
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              placeholder="Email"
              placeholderTextColor="#a3a3a3"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, styles.inputSpacing]}
            />
            
            <TextInput
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholder="Contrasena"
              placeholderTextColor="#a3a3a3"
              secureTextEntry
              style={[styles.input, styles.inputSpacing]}
              onSubmitEditing={submit}
            />
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            
            <TouchableOpacity 
              onPress={submit}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Crear cuenta</Text>
            </TouchableOpacity>
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
});
