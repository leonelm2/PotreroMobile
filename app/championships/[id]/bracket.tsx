import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../../api/client';
import { useAuth } from '../../../auth/_AuthProvider';

interface MatchItem {
  _id: string;
  round: string;
  status?: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  homeScore?: number;
  awayScore?: number;
}

const roundLabels: Record<string, string> = {
  quarterfinal: 'Cuartos de final',
  semifinal: 'Semifinales',
  final: 'Final'
};

export default function BracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [editing, setEditing] = useState<Record<string, { homeScore?: number; awayScore?: number }>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/championships/${id}/bracket`);
      setMatches(res.data || []);
    } catch (error) {
      console.error('Error loading bracket:', error);
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
      console.error('Error saving bracket result:', error);
    }
  };

  const grouped = useMemo(() => {
    return matches.reduce<Record<string, MatchItem[]>>((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});
  }, [matches]);

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
            <Text className="text-white/80 text-xs uppercase tracking-widest">Fase eliminatoria</Text>
          </View>
          <Text className="text-3xl tracking-wide text-white font-bold">Llaves del campeonato</Text>
          <Text className="text-white/60">Carga resultados para avanzar en las llaves.</Text>
        </View>

        <View className="mt-8 flex flex-col gap-4">
          {Object.keys(grouped).length === 0 && (
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Text className="text-white/60">Todavía no hay llaves generadas.</Text>
            </View>
          )}

          {Object.entries(grouped).map(([round, roundMatches]) => (
            <View key={round} className="rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 p-5">
              <Text className="text-xl text-white font-semibold">{roundLabels[round] || round}</Text>
              <View className="mt-4 flex flex-col gap-3">
                {roundMatches.map((match) => (
                  <View key={match._id} className="rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg shadow-black/30 p-4">
                    <Text className="text-lg text-white">
                      {match.homeTeam?.name || 'Por definir'} vs {match.awayTeam?.name || 'Por definir'}
                    </Text>
                    <Text className="text-sm text-white/60 mt-1">Estado: {match.status || 'pending'}</Text>

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
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
