import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../../api/client';
import { useAuth } from '../../../auth/_AuthProvider';

interface Player {
  _id: string;
  name: string;
  number?: number;
  position?: string;
}

interface Team {
  _id: string;
  name: string;
  discipline?: { name?: string };
  players: Player[];
}

interface ChampionshipTeamsData {
  championship?: {
    name?: string;
    discipline?: { name?: string };
  };
  teams?: Team[];
}

export default function ChampionshipTeamsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  const [data, setData] = useState<ChampionshipTeamsData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/championships/${id}/teams`);
      setData(res.data);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (authLoading) {
    return (
      <View className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const startEditPlayer = (player: Player) => {
    setEditingPlayer(player._id);
    setPlayerName(player.name);
  };

  const savePlayer = async () => {
    if (!editingPlayer) return;
    try {
      await api.put(`/players/${editingPlayer}`, { name: playerName });
      setEditingPlayer(null);
      setPlayerName('');
      load();
    } catch (err) {
      console.error('Error saving player:', err);
    }
  };

  const cancelPlayerEdit = () => {
    setEditingPlayer(null);
    setPlayerName('');
  };

  const startEditTeam = (team: Team) => {
    setEditingTeam(team._id);
    setTeamName(team.name);
  };

  const saveTeam = async () => {
    if (!editingTeam) return;
    try {
      await api.put(`/teams/${editingTeam}`, { name: teamName });
      setEditingTeam(null);
      setTeamName('');
      load();
    } catch (err) {
      console.error('Error saving team:', err);
    }
  };

  const cancelTeamEdit = () => {
    setEditingTeam(null);
    setTeamName('');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-ink px-6 py-8">
        <View className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <Text className="text-red-300">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ink">
      <View className="max-w-6xl px-6 py-8">
        <View className="flex flex-col gap-2">
          <View className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 self-start">
            <Text className="text-white/80 text-xs uppercase tracking-widest">Equipos y jugadores</Text>
          </View>
          <Text className="text-3xl tracking-wide text-white font-bold">{data?.championship?.name || 'Campeonato'}</Text>
          <Text className="text-white/60">Disciplina: {data?.championship?.discipline?.name || '-'}</Text>
        </View>

        <View className="mt-8 flex flex-col gap-4">
          {data?.teams?.length === 0 && (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-white/60">No hay equipos cargados para este torneo.</Text>
            </View>
          )}

          {data?.teams?.map((team) => (
            <View key={team._id} className="rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 p-5">
              <View className="flex flex-row items-center justify-between">
                <View className="flex-1 flex flex-row items-center gap-3">
                  <View className="h-11 w-11 rounded-xl bg-white/10 items-center justify-center">
                    <Text className="text-white font-semibold">{team.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View className="flex-1">
                  {editingTeam === team._id ? (
                    <TextInput
                      value={teamName}
                      onChangeText={setTeamName}
                      className="p-3 rounded-xl bg-neutral-900/70 text-white border border-white/10"
                      placeholder="Nombre del equipo"
                      placeholderTextColor="#8b8b99"
                    />
                  ) : (
                    <Text className="text-xl text-white font-semibold">{team.name}</Text>
                  )}
                  <Text className="text-sm text-white/60 mt-1">{team.discipline?.name || '-'}</Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-xs text-white/70 mb-2">{team.players?.length || 0} jugadores</Text>
                  {isAdmin && (
                    editingTeam === team._id ? (
                      <View className="flex flex-row gap-2">
                        <TouchableOpacity className="px-4 py-2 rounded-xl border border-white/30" onPress={saveTeam}>
                          <Text className="text-white text-sm">Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="px-4 py-2 rounded-xl bg-white/5" onPress={cancelTeamEdit}>
                          <Text className="text-white text-sm">Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity className="px-4 py-2 rounded-xl border border-white/30" onPress={() => startEditTeam(team)}>
                        <Text className="text-white text-sm">Editar equipo</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View className="mt-4 flex flex-col gap-2">
                {team.players?.map((player) => (
                  <View key={player._id} className="rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg shadow-black/30 p-3 flex flex-row items-center justify-between gap-3">
                    <View className="flex-1">
                      {editingPlayer === player._id ? (
                        <TextInput
                          value={playerName}
                          onChangeText={setPlayerName}
                          className="p-2 rounded-lg bg-neutral-900/70 text-white border border-white/10"
                          placeholder="Nombre del jugador"
                          placeholderTextColor="#8b8b99"
                        />
                      ) : (
                        <Text className="text-white font-semibold">{player.name}</Text>
                      )}
                      <Text className="text-xs text-white/60 mt-1">{player.position || 'Sin posición'}</Text>
                    </View>

                    <View className="items-end gap-2">
                      <Text className="text-sm text-white/70">#{player.number || '-'}</Text>
                      {isAdmin && (
                        editingPlayer === player._id ? (
                          <View className="flex flex-row gap-2">
                            <TouchableOpacity className="px-3 py-1.5 rounded-lg border border-white/30" onPress={savePlayer}>
                              <Text className="text-white text-xs">Guardar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-3 py-1.5 rounded-lg bg-white/5" onPress={cancelPlayerEdit}>
                              <Text className="text-white text-xs">Cancelar</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity className="px-3 py-1.5 rounded-lg border border-white/30" onPress={() => startEditPlayer(player)}>
                            <Text className="text-white text-xs">Editar</Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
