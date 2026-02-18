import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/client';
import { useAuth } from '../../auth/_AuthProvider';

export default function Teams() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', discipline: '', logoUrl: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [playerForm, setPlayerForm] = useState({ name: '', team: '', number: '', position: '', age: '' });
  const [playerError, setPlayerError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [disc, team, playerRes] = await Promise.all([
        api.get('/disciplines'),
        api.get('/teams'),
        api.get('/players')
      ]);
      setDisciplines(disc.data);
      setTeams(team.data);
      setPlayers(playerRes.data);
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
        await api.put(`/teams/${editing}`, form);
      } else {
        await api.post('/teams', form);
      }
      setForm({ name: '', discipline: '', logoUrl: '' });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const remove = async (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar equipo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/teams/${id}`);
            load();
          }
        }
      ]
    );
  };

  const addPlayer = async () => {
    setPlayerError('');
    try {
      await api.post('/players', playerForm);
      setPlayerForm({ name: '', team: '', number: '', position: '', age: '' });
      load();
    } catch (err: any) {
      setPlayerError(err.response?.data?.msg || 'Error al agregar jugador');
    }
  };

  const playersByTeam = players.reduce((acc: any, player: any) => {
    const teamId = player.team?._id || player.team;
    if (!teamId) return acc;
    acc[teamId] = acc[teamId] || [];
    acc[teamId].push(player);
    return acc;
  }, {});

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
            <Text className="text-white/80 text-xs uppercase tracking-widest">Planteles</Text>
          </View>
          <View className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <Text className="text-3xl tracking-wide text-white font-bold">Gestión de equipos</Text>
            <TouchableOpacity
              className="px-5 py-2.5 rounded-xl bg-ember"
              onPress={() => {
                setEditing(null);
                setForm({ name: '', discipline: '', logoUrl: '' });
              }}
            >
              <Text className="text-white font-semibold">Agregar equipo</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white/60 max-w-2xl">Crea equipos y asócialos a una disciplina deportiva.</Text>
        </View>

        <View className="mt-8">
          <View className="flex flex-col gap-6 mb-6">
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-2xl text-white font-bold mb-4">{editing ? 'Editar equipo' : 'Nuevo equipo'}</Text>

              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Nombre del equipo"
                placeholderTextColor="#8b8b99"
                className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4"
              />

              <View className="mb-4">
                <Text className="text-white/70 text-sm mb-2">Selecciona disciplina</Text>
                {disciplines.map(d => (
                  <TouchableOpacity
                    key={d._id}
                    onPress={() => setForm({ ...form, discipline: d._id })}
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

              <TextInput
                value={form.logoUrl}
                onChangeText={(text) => setForm({ ...form, logoUrl: text })}
                placeholder="URL del logo (opcional)"
                placeholderTextColor="#8b8b99"
                className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4"
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
                      setForm({ name: '', discipline: '', logoUrl: '' });
                    }}
                  >
                    <Text className="text-white text-center">Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-2xl text-white font-bold mb-4">Agregar jugador</Text>

              <TextInput
                value={playerForm.name}
                onChangeText={(text) => setPlayerForm({ ...playerForm, name: text })}
                placeholder="Nombre del jugador"
                placeholderTextColor="#8b8b99"
                className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4"
              />

              <View className="mb-4">
                <Text className="text-white/70 text-sm mb-2">Selecciona equipo</Text>
                {teams.map(team => (
                  <TouchableOpacity
                    key={team._id}
                    onPress={() => setPlayerForm({ ...playerForm, team: team._id })}
                    className={`p-3 rounded-xl border mb-2 ${
                      playerForm.team === team._id
                        ? 'bg-ember/20 border-ember'
                        : 'bg-neutral-900/70 border-white/10'
                    }`}
                  >
                    <Text className={playerForm.team === team._id ? 'text-white font-semibold' : 'text-white/70'}>
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex flex-row gap-3 mb-4">
                <TextInput
                  value={playerForm.number}
                  onChangeText={(text) => setPlayerForm({ ...playerForm, number: text })}
                  placeholder="Número"
                  placeholderTextColor="#8b8b99"
                  keyboardType="number-pad"
                  className="flex-1 p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
                />
                <View className="flex-1">
                  <TextInput
                    value={playerForm.age}
                    onChangeText={(text) => setPlayerForm({ ...playerForm, age: text })}
                    placeholder="Edad"
                    placeholderTextColor="#8b8b99"
                    keyboardType="number-pad"
                    className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
                  />
                </View>
              </View>

              <TextInput
                value={playerForm.position}
                onChangeText={(text) => setPlayerForm({ ...playerForm, position: text })}
                placeholder="Posición"
                placeholderTextColor="#8b8b99"
                className="w-full p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10 mb-4"
              />

              {playerError ? <Text className="text-red-400 text-sm mb-2">{playerError}</Text> : null}

              <TouchableOpacity className="px-5 py-2.5 rounded-xl bg-ember" onPress={addPlayer}>
                <Text className="text-white font-semibold text-center">Agregar jugador</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Teams List */}
          {teams.length === 0 && (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-white/60">No hay equipos registrados.</Text>
            </View>
          )}
          
          {teams.map(team => (
            <View key={team._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
              <View className="flex flex-row items-center justify-between mb-3">
                <View className="flex flex-row items-center gap-4 flex-1">
                  <View className="h-12 w-12 rounded-xl bg-white/10 items-center justify-center">
                    <Text className="text-lg text-white font-bold">
                      {team.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl text-white font-semibold">{team.name}</Text>
                    <Text className="text-sm text-white/60">
                      {team.discipline?.name} · {playersByTeam[team._id]?.length || 0} jugadores
                    </Text>
                  </View>
                </View>
                <View className="flex flex-row gap-2">
                  <TouchableOpacity
                    className="px-4 py-2 rounded-xl bg-white/5"
                    onPress={() => {
                      setEditing(team._id);
                      setForm({
                        name: team.name,
                        discipline: team.discipline?._id || '',
                        logoUrl: team.logoUrl || ''
                      });
                    }}
                  >
                    <Text className="text-white">Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="px-4 py-2 rounded-xl border border-white/30"
                    onPress={() => remove(team._id)}
                  >
                    <Text className="text-white">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Players List */}
              {playersByTeam[team._id] && playersByTeam[team._id].length > 0 && (
                <View className="mt-3 pt-3 border-t border-white/10">
                  <Text className="text-white font-semibold mb-2">
                    Jugadores ({playersByTeam[team._id].length})
                  </Text>
                  {playersByTeam[team._id].map((player: any) => (
                    <View key={player._id} className="flex flex-row items-center py-2">
                      <Text className="text-ember font-bold w-8">#{player.number}</Text>
                      <Text className="text-white flex-1">{player.name}</Text>
                      <Text className="text-white/60 text-sm">{player.position}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
