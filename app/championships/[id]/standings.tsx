import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../../api/client';
import { useAuth } from '../../../auth/_AuthProvider';

interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface GroupStanding {
  name: string;
  standings: TeamStanding[];
}

interface MatchItem {
  _id: string;
  groupName?: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  homeScore?: number;
  awayScore?: number;
}

interface Championship {
  name: string;
}

export default function StandingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [editing, setEditing] = useState<Record<string, { homeScore?: number; awayScore?: number }>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    try {
      const [champ, table, matchRes] = await Promise.all([
        api.get(`/championships/${id}`),
        api.get(`/championships/${id}/standings`),
        api.get('/matches', { params: { championship: id, phase: 'group' } })
      ]);
      setChampionship(champ.data);
      setStandings(table.data.standings || []);
      setMatches(matchRes.data || []);
    } catch (error) {
      console.error('Error loading standings:', error);
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

  const updateScore = (matchId: string, field: 'homeScore' | 'awayScore', value: number) => {
    setEditing((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value }
    }));
  };

  const saveResult = async (matchId: string) => {
    const payload = editing[matchId];
    if (!payload) return;
    try {
      await api.put(`/matches/${matchId}/result`, payload);
      setEditing((prev) => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
      load();
    } catch (error) {
      console.error('Error saving result:', error);
    }
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
            <Text className="text-white/80 text-xs uppercase tracking-widest">Tabla de posiciones</Text>
          </View>
          <Text className="text-3xl tracking-wide text-white font-bold">{championship?.name || 'Campeonato'}</Text>
          <Text className="text-white/60">Consulta los puntos y resultados de la fase de grupos.</Text>
        </View>

        <View className="mt-8 flex flex-col gap-4">
          {standings.map((group) => (
            <View key={group.name} className="rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 p-5">
              <Text className="text-xl text-white font-semibold">{group.name}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                <View className="min-w-[760px]">
                  <View className="flex flex-row items-center border-b border-white/10 pb-2">
                    <Text className="text-white/60 w-56">Equipo</Text>
                    <Text className="text-white/60 w-8 text-right">PJ</Text>
                    <Text className="text-white/60 w-8 text-right">G</Text>
                    <Text className="text-white/60 w-8 text-right">E</Text>
                    <Text className="text-white/60 w-8 text-right">P</Text>
                    <Text className="text-white/60 w-10 text-right">GF</Text>
                    <Text className="text-white/60 w-10 text-right">GC</Text>
                    <Text className="text-white/60 w-10 text-right">DG</Text>
                    <Text className="text-white/60 w-12 text-right">Pts</Text>
                  </View>
                  {group.standings.map((row) => (
                    <View key={row.teamId} className="flex flex-row items-center py-2 border-b border-white/10">
                      <Text className="text-white w-56">{row.teamName}</Text>
                      <Text className="text-white/80 w-8 text-right">{row.played}</Text>
                      <Text className="text-white/80 w-8 text-right">{row.wins}</Text>
                      <Text className="text-white/80 w-8 text-right">{row.draws}</Text>
                      <Text className="text-white/80 w-8 text-right">{row.losses}</Text>
                      <Text className="text-white/80 w-10 text-right">{row.goalsFor}</Text>
                      <Text className="text-white/80 w-10 text-right">{row.goalsAgainst}</Text>
                      <Text className="text-white/80 w-10 text-right">{row.goalDiff}</Text>
                      <Text className="text-white font-semibold w-12 text-right">{row.points}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </View>

        <View className="mt-10">
          <Text className="text-2xl text-white font-bold">Partidos de grupo</Text>
          <View className="mt-4 flex flex-col gap-3">
            {matches.map((match) => (
              <View key={match._id} className="rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg shadow-black/30 p-4">
                <Text className="text-sm text-white/60">{match.groupName || 'Grupo'}</Text>
                <Text className="text-lg text-white mt-1">
                  {match.homeTeam?.name || 'Por definir'} vs {match.awayTeam?.name || 'Por definir'}
                </Text>
                <View className="flex flex-row items-center gap-2 mt-3">
                  <TextInput
                    keyboardType="number-pad"
                    className="w-20 p-2 rounded-lg bg-neutral-900/70 text-white border border-white/10 text-center"
                    value={String(editing[match._id]?.homeScore ?? match.homeScore ?? '')}
                    onChangeText={(text) => updateScore(match._id, 'homeScore', Number(text || 0))}
                    editable={!!isAdmin}
                    placeholder="0"
                    placeholderTextColor="#8b8b99"
                  />
                  <Text className="text-white/60">-</Text>
                  <TextInput
                    keyboardType="number-pad"
                    className="w-20 p-2 rounded-lg bg-neutral-900/70 text-white border border-white/10 text-center"
                    value={String(editing[match._id]?.awayScore ?? match.awayScore ?? '')}
                    onChangeText={(text) => updateScore(match._id, 'awayScore', Number(text || 0))}
                    editable={!!isAdmin}
                    placeholder="0"
                    placeholderTextColor="#8b8b99"
                  />
                  {isAdmin && (
                    <TouchableOpacity className="px-5 py-2.5 rounded-xl border border-white/30" onPress={() => saveResult(match._id)}>
                      <Text className="text-white">Guardar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
