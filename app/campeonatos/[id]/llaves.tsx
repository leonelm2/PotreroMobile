import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      const res = await api.get(`/campeonatos/${id}/llaves`);
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
      <View style={styles.loadingContainer}>
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
      await api.put(`/partidos/${matchId}/resultado`, payload);
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerWrap}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Fase eliminatoria</Text>
          </View>
          <Text style={styles.title}>Llaves del campeonato</Text>
          <Text style={styles.subtitle}>Carga resultados para avanzar en las llaves.</Text>
        </View>

        <View style={styles.roundsWrap}>
          {Object.keys(grouped).length === 0 && (
            <View style={styles.card}>
              <Text style={styles.mutedText}>Todavía no hay llaves generadas.</Text>
            </View>
          )}

          {Object.entries(grouped).map(([round, roundMatches]) => (
            <View key={round} style={styles.card}>
              <Text style={styles.cardTitle}>{roundLabels[round] || round}</Text>
              <View style={styles.matchesList}>
                {roundMatches.map((match) => (
                  <View key={match._id} style={styles.matchCard}>
                    <Text style={styles.matchTeams}>
                      {match.homeTeam?.name || 'Por definir'} vs {match.awayTeam?.name || 'Por definir'}
                    </Text>
                    <Text style={styles.matchStatus}>Estado: {match.status || 'pending'}</Text>

                    <View style={styles.actionsRow}>
                      <TextInput
                        keyboardType="number-pad"
                        style={styles.scoreInput}
                        value={String(editing[match._id]?.homeScore ?? match.homeScore ?? '')}
                        onChangeText={(text) => updateScore(match._id, 'homeScore', Number(text || 0))}
                        editable={!!isAdmin}
                        placeholder="0"
                        placeholderTextColor="#a3a3a3"
                      />
                      <Text style={styles.separator}>-</Text>
                      <TextInput
                        keyboardType="number-pad"
                        style={styles.scoreInput}
                        value={String(editing[match._id]?.awayScore ?? match.awayScore ?? '')}
                        onChangeText={(text) => updateScore(match._id, 'awayScore', Number(text || 0))}
                        editable={!!isAdmin}
                        placeholder="0"
                        placeholderTextColor="#a3a3a3"
                      />
                      {isAdmin && (
                        <TouchableOpacity style={styles.saveButton} onPress={() => saveResult(match._id)}>
                          <Text style={styles.saveButtonText}>Guardar</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0d',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b0b0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 34,
  },
  headerWrap: {
    gap: 6,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    color: '#e5e7eb',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
  },
  roundsWrap: {
    marginTop: 22,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  mutedText: {
    color: 'rgba(255,255,255,0.65)',
  },
  matchesList: {
    marginTop: 10,
    gap: 10,
  },
  matchCard: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
  },
  matchTeams: {
    color: '#fff',
    fontSize: 18,
  },
  matchStatus: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 4,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreInput: {
    width: 72,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    color: '#fff',
    textAlign: 'center',
  },
  separator: {
    color: 'rgba(255,255,255,0.65)',
  },
  saveButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#fff',
  },
});
