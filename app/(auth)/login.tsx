import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../auth/_AuthProvider';

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
    <ScrollView className="flex-1 bg-ink">
      <View className="min-h-screen flex items-center justify-center px-6 py-12">
        <View className="rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 p-8 w-full max-w-md">
          <View className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 self-start">
            <Text className="text-white/80 text-xs uppercase tracking-widest">Acceso</Text>
          </View>
          
          <Text className="text-3xl tracking-wide text-white mt-3 font-bold">Bienvenido a POTRERO</Text>
          <Text className="text-white/60 text-sm mt-2">Inicia sesión para gestionar tus torneos.</Text>
          
          <View className="mt-6">
            <TextInput
              value={form.usernameOrEmail}
              onChangeText={(text) => setForm({ ...form, usernameOrEmail: text })}
              placeholder="Usuario o email"
              placeholderTextColor="#8b8b99"
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
              autoCapitalize="none"
            />
            
            <TextInput
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              placeholder="Contraseña"
              placeholderTextColor="#8b8b99"
              secureTextEntry
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mt-4"
            />
            
            {error ? (
              <Text className="text-red-400 text-sm mt-2">{error}</Text>
            ) : null}
            
            <TouchableOpacity 
              onPress={handle}
              className="px-5 py-3 rounded-xl bg-ember mt-4"
            >
              <Text className="text-white font-semibold text-center">Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              className="mt-4"
            >
              <Text className="text-white/60 text-center text-sm">
                ¿No tienes cuenta? <Text className="text-ember">Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
