import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
            <Text style={styles.pillText}>Tabla de posiciones</Text>
          </View>
          <Text style={styles.title}>{championship?.name || 'Campeonato'}</Text>
          <Text style={styles.subtitle}>Consulta los puntos y resultados de la fase de grupos.</Text>
        </View>

        <View style={styles.blockWrap}>
          {standings.map((group) => (
            <View key={group.name} style={styles.card}>
              <Text style={styles.cardTitle}>{group.name}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
                <View style={styles.tableMinWidth}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderText, styles.colTeam]}>Equipo</Text>
                    <Text style={[styles.tableHeaderText, styles.colTiny]}>PJ</Text>
                    <Text style={[styles.tableHeaderText, styles.colTiny]}>G</Text>
                    <Text style={[styles.tableHeaderText, styles.colTiny]}>E</Text>
                    <Text style={[styles.tableHeaderText, styles.colTiny]}>P</Text>
                    <Text style={[styles.tableHeaderText, styles.colSmall]}>GF</Text>
                    <Text style={[styles.tableHeaderText, styles.colSmall]}>GC</Text>
                    <Text style={[styles.tableHeaderText, styles.colSmall]}>DG</Text>
                    <Text style={[styles.tableHeaderText, styles.colPoints]}>Pts</Text>
                  </View>
                  {group.standings.map((row) => (
                    <View key={row.teamId} style={styles.tableDataRow}>
                      <Text style={[styles.tableTeam, styles.colTeam]}>{row.teamName}</Text>
                      <Text style={[styles.tableValue, styles.colTiny]}>{row.played}</Text>
                      <Text style={[styles.tableValue, styles.colTiny]}>{row.wins}</Text>
                      <Text style={[styles.tableValue, styles.colTiny]}>{row.draws}</Text>
                      <Text style={[styles.tableValue, styles.colTiny]}>{row.losses}</Text>
                      <Text style={[styles.tableValue, styles.colSmall]}>{row.goalsFor}</Text>
                      <Text style={[styles.tableValue, styles.colSmall]}>{row.goalsAgainst}</Text>
                      <Text style={[styles.tableValue, styles.colSmall]}>{row.goalDiff}</Text>
                      <Text style={[styles.tablePoints, styles.colPoints]}>{row.points}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </View>

        <View style={styles.matchesWrap}>
          <Text style={styles.matchesTitle}>Partidos de grupo</Text>
          <View style={styles.matchesList}>
            {matches.map((match) => (
              <View key={match._id} style={styles.matchCard}>
                <Text style={styles.matchMeta}>{match.groupName || 'Grupo'}</Text>
                <Text style={styles.matchTeams}>
                  {match.homeTeam?.name || 'Por definir'} vs {match.awayTeam?.name || 'Por definir'}
                </Text>
                <View style={styles.matchActions}>
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
  blockWrap: {
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
  tableScroll: {
    marginTop: 12,
  },
  tableMinWidth: {
    minWidth: 760,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  tableHeaderText: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'right',
  },
  colTeam: {
    width: 220,
    textAlign: 'left',
  },
  colTiny: {
    width: 32,
  },
  colSmall: {
    width: 40,
  },
  colPoints: {
    width: 48,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
  },
  tableTeam: {
    color: '#fff',
  },
  tableValue: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },
  tablePoints: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'right',
  },
  matchesWrap: {
    marginTop: 28,
  },
  matchesTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  matchesList: {
    marginTop: 12,
    gap: 10,
  },
  matchCard: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
  },
  matchMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  matchTeams: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
  },
  matchActions: {
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
