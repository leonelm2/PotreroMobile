import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      className="flex-1 bg-ink"
    >
      <ScrollView className="flex-1 bg-ink" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 p-8 w-full max-w-md">
            <View className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 self-start">
              <Text className="text-white/80 text-xs uppercase tracking-widest">Registro</Text>
            </View>

            <Text className="text-4xl tracking-wide text-white mt-3 font-bold">Crear cuenta</Text>
            <Text className="text-white/60 text-sm">Registrate como entrenador para gestionar tus equipos.</Text>

            <View className="mt-6">
            <TextInput
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
              placeholder="Usuario"
              placeholderTextColor="#8b8b99"
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
              autoCapitalize="none"
            />
            
            <TextInput
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              placeholder="Email"
              placeholderTextColor="#8b8b99"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mt-4"
            />
            
            <TextInput
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholder="Contrasena"
              placeholderTextColor="#8b8b99"
              secureTextEntry
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mt-4"
              onSubmitEditing={submit}
            />
            
            {error ? (
              <Text className="text-red-400 text-sm mt-2">{error}</Text>
            ) : null}
            
            <TouchableOpacity 
              onPress={submit}
              className="w-full px-5 py-3 rounded-xl bg-red-600 mt-4"
            >
              <Text className="text-white font-semibold text-center">Crear cuenta</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
