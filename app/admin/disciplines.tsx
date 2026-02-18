import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import api from '../../api/client';

export default function Disciplines() {
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/disciplines');
      setDisciplines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    setError('');
    try {
      if (editing) {
        await api.put(`/disciplines/${editing}`, form);
      } else {
        await api.post('/disciplines', form);
      }
      setForm({ name: '', description: '' });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const startEdit = (discipline: any) => {
    setEditing(discipline._id);
    setForm({ name: discipline.name, description: discipline.description || '' });
  };

  const remove = async (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar disciplina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/disciplines/${id}`);
            load();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ink">
      <View className="max-w-6xl px-6 py-8">
        <View className="flex flex-col gap-2">
          <View className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 self-start">
            <Text className="text-white/80 text-xs uppercase tracking-widest">Gestión central</Text>
          </View>
          <Text className="text-3xl tracking-wide text-white font-bold">Disciplinas deportivas</Text>
          <Text className="text-white/60 max-w-2xl">Define el catálogo de deportes disponibles para los campeonatos.</Text>
        </View>

        <View className="mt-8">
          {/* Form Card */}
          <View className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <Text className="text-2xl text-white font-bold mb-4">{editing ? 'Editar disciplina' : 'Nueva disciplina'}</Text>
            
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Nombre de la disciplina"
              placeholderTextColor="#8b8b99"
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4"
            />
            
            <TextInput
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Descripción breve"
              placeholderTextColor="#8b8b99"
              multiline
              numberOfLines={4}
              className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4 min-h-[100px]"
            />
            
            {error ? <Text className="text-red-400 text-sm mb-2">{error}</Text> : null}
            
            <View className="flex flex-row gap-3">
              <TouchableOpacity className="flex-1 px-5 py-2.5 rounded-xl bg-ember" onPress={submit}>
                <Text className="text-white font-semibold text-center">Guardar</Text>
              </TouchableOpacity>
              {editing && (
                <TouchableOpacity
                  className="flex-1 px-5 py-2.5 rounded-xl border border-white/30"
                  onPress={() => {
                    setEditing(null);
                    setForm({ name: '', description: '' });
                  }}
                >
                  <Text className="text-white text-center">Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Disciplines List */}
          {disciplines.length === 0 && (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-white/60">No hay disciplinas registradas.</Text>
            </View>
          )}
          
          {disciplines.map(discipline => (
            <View key={discipline._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
              <View className="flex flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xl text-white font-semibold">{discipline.name}</Text>
                  <Text className="text-sm text-white/60">{discipline.description || 'Sin descripción'}</Text>
                </View>
                <View className="flex flex-row gap-2">
                  <TouchableOpacity
                    className="px-4 py-2 rounded-xl bg-white/5"
                    onPress={() => startEdit(discipline)}
                  >
                    <Text className="text-white">Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="px-4 py-2 rounded-xl border border-white/30"
                    onPress={() => remove(discipline._id)}
                  >
                    <Text className="text-white">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
