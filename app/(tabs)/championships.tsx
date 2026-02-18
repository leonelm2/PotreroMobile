import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import api from '../../api/client';
import { useAuth } from '../auth/_AuthProvider';

export default function Championships() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    discipline: '',
    teams: [] as string[],
    groupCount: 2,
    qualifiersPerGroup: 2
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async () => {
    try {
      const [disc, team, champ] = await Promise.all([
        api.get('/disciplines'),
        api.get('/teams'),
        api.get('/championships')
      ]);
      setDisciplines(disc.data);
      setTeams(team.data);
      setChampionships(champ.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTeams = useMemo(() => {
    if (!form.discipline) return [];
    return teams.filter(team => team.discipline?._id === form.discipline);
  }, [teams, form.discipline]);

  const toggleTeam = (id: string) => {
    setForm((prev) => {
      const exists = prev.teams.includes(id);
      return { ...prev, teams: exists ? prev.teams.filter(t => t !== id) : [...prev.teams, id] };
    });
  };

  const submit = async () => {
    setError('');
    try {
      if (editingId) {
        await api.put(`/championships/${editingId}`, form);
      } else {
        await api.post('/championships', form);
      }
      setForm({ name: '', discipline: '', teams: [], groupCount: 2, qualifiersPerGroup: 2 });
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al crear campeonato');
    }
  };

  const generateGroups = async (id: string) => {
    await api.post(`/championships/${id}/generate-groups`);
    load();
  };

  const generateBracket = async (id: string) => {
    await api.post(`/championships/${id}/generate-bracket`);
    load();
  };

  const advanceBracket = async (id: string) => {
    try {
      await api.post(`/championships/${id}/advance-knockout`);
      load();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || 'No se pudo avanzar la llave');
    }
  };

  const startEdit = (champ: any) => {
    setEditingId(champ._id);
    setForm({
      name: champ.name,
      discipline: champ.discipline?._id || champ.discipline,
      teams: champ.teams || [],
      groupCount: champ.groupCount || 2,
      qualifiersPerGroup: champ.qualifiersPerGroup || 2
    });
  };

  const deleteChampionship = async (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar torneo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/championships/${id}`);
            load();
          }
        }
      ]
    );
  };

  const finalizeChampionship = async (id: string) => {
    await api.put(`/championships/${id}`, { status: 'completed' });
    load();
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
            <Text className="text-white/80 text-xs uppercase tracking-widest">Organización</Text>
          </View>
          <Text className="text-3xl tracking-wide text-white font-bold">Gestión de campeonatos</Text>
          <Text className="text-white/60 max-w-2xl">Crea campeonatos, genera grupos y administra las llaves eliminatorias.</Text>
        </View>

        <View className="mt-8">
          {isAdmin ? (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
              <Text className="text-2xl text-white font-bold mb-4">{editingId ? 'Editar torneo' : 'Nuevo torneo'}</Text>
              
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Nombre del campeonato"
                placeholderTextColor="#8b8b99"
                className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4"
              />
              
              <View className="mb-4">
                <Text className="text-white/70 text-sm mb-2">Selecciona disciplina</Text>
                {disciplines.map(d => (
                  <TouchableOpacity
                    key={d._id}
                    onPress={() => setForm({ ...form, discipline: d._id, teams: [] })}
                    className={`p-3 rounded-xl border mb-2 ${
                      form.discipline === d._id 
                        ? 'bg-ember/20 border-ember' 
                        : 'bg-neutral-900/70 border-white/10'
                    }`}
                  >
                    <Text className={form.discipline === d._id ? 'text-white font-semibold' : 'text-white/70'}>
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex flex-row gap-3 mb-4">
                <TextInput
                  value={form.groupCount.toString()}
                  onChangeText={(text) => setForm({ ...form, groupCount: Number(text) || 2 })}
                  placeholder="Cantidad de grupos"
                  placeholderTextColor="#8b8b99"
                  keyboardType="number-pad"
                  className="flex-1 p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
                />
                <TextInput
                  value={form.qualifiersPerGroup.toString()}
                  onChangeText={(text) => setForm({ ...form, qualifiersPerGroup: Number(text) || 2 })}
                  placeholder="Clasificados por grupo"
                  placeholderTextColor="#8b8b99"
                  keyboardType="number-pad"
                  className="flex-1 p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-white/70 mb-2">Equipos disponibles</Text>
                {filteredTeams.length === 0 && (
                  <Text className="text-white/50 text-sm">Selecciona una disciplina para ver equipos.</Text>
                )}
                {filteredTeams.map(team => (
                  <TouchableOpacity
                    key={team._id}
                    onPress={() => toggleTeam(team._id)}
                    className="flex flex-row items-center gap-2 py-2"
                  >
                    <View className={`w-5 h-5 rounded border ${
                      form.teams.includes(team._id) 
                        ? 'bg-ember border-ember' 
                        : 'border-white/30'
                    }`}>
                      {form.teams.includes(team._id) && (
                        <Text className="text-white text-center text-xs">✓</Text>
                      )}
                    </View>
                    <Text className="text-white text-sm">{team.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? <Text className="text-red-400 text-sm mb-2">{error}</Text> : null}
              
              <View className="flex flex-row gap-3">
                <TouchableOpacity className="flex-1 px-5 py-2.5 rounded-xl bg-ember" onPress={submit}>
                  <Text className="text-white font-semibold text-center">Crear torneo</Text>
                </TouchableOpacity>
                {editingId && (
                  <TouchableOpacity
                    className="flex-1 px-5 py-2.5 rounded-xl border border-white/30"
                    onPress={() => {
                      setEditingId(null);
                      setForm({ name: '', discipline: '', teams: [], groupCount: 2, qualifiersPerGroup: 2 });
                    }}
                  >
                    <Text className="text-white text-center">Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-white/60">Solo el administrador puede crear o editar torneos.</Text>
            </View>
          )}

          {/* Championships List */}
          {championships.length === 0 && (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-white/60">No hay campeonatos creados.</Text>
            </View>
          )}
          
          {championships.map(champ => (
            <View key={champ._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
              <View className="flex flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-xl text-white font-semibold">{champ.name}</Text>
                  <Text className="text-sm text-white/60">
                    {champ.discipline?.name} · {champ.teams?.length || 0} equipos
                  </Text>
                </View>
                <Text className="text-sm text-white/60">Estado: {champ.status}</Text>
              </View>

              <View className="flex flex-row flex-wrap gap-2 mt-4">
                {isAdmin && (
                  <>
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl bg-white/5"
                      onPress={() => generateGroups(champ._id)}
                    >
                      <Text className="text-white text-sm">Generar grupos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl bg-white/5"
                      onPress={() => generateBracket(champ._id)}
                    >
                      <Text className="text-white text-sm">Generar llaves</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl bg-white/5"
                      onPress={() => advanceBracket(champ._id)}
                    >
                      <Text className="text-white text-sm">Avanzar fase</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl bg-white/5"
                      onPress={() => startEdit(champ)}
                    >
                      <Text className="text-white text-sm">Editar torneo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl bg-white/5"
                      onPress={() => finalizeChampionship(champ._id)}
                    >
                      <Text className="text-white text-sm">Finalizar torneo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="px-4 py-2 rounded-xl border border-white/30"
                      onPress={() => deleteChampionship(champ._id)}
                    >
                      <Text className="text-white text-sm">Eliminar torneo</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity 
                  className="px-4 py-2 rounded-xl border border-white/30"
                  onPress={() => router.push(`/championships/${champ._id}/teams` as any)}
                >
                  <Text className="text-white text-sm">Ver equipos</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-4 py-2 rounded-xl border border-white/30"
                  onPress={() => router.push(`/championships/${champ._id}/standings` as any)}
                >
                  <Text className="text-white text-sm">Ver tabla</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-4 py-2 rounded-xl border border-white/30"
                  onPress={() => router.push(`/championships/${champ._id}/bracket` as any)}
                >
                  <Text className="text-white text-sm">Ver llaves</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
