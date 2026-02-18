import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      <View style={styles.loadingContainer}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerWrap}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Equipos y jugadores</Text>
          </View>
          <Text style={styles.title}>{data?.championship?.name || 'Campeonato'}</Text>
          <Text style={styles.subtitle}>Disciplina: {data?.championship?.discipline?.name || '-'}</Text>
        </View>

        <View style={styles.listWrap}>
          {data?.teams?.length === 0 && (
            <View style={styles.card}>
              <Text style={styles.mutedText}>No hay equipos cargados para este torneo.</Text>
            </View>
          )}

          {data?.teams?.map((team) => (
            <View key={team._id} style={styles.card}>
              <View style={styles.teamHeaderRow}>
                <View style={styles.teamSummary}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{team.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.flexOne}>
                  {editingTeam === team._id ? (
                    <TextInput
                      value={teamName}
                      onChangeText={setTeamName}
                      style={styles.input}
                      placeholder="Nombre del equipo"
                      placeholderTextColor="#a3a3a3"
                    />
                  ) : (
                    <Text style={styles.teamName}>{team.name}</Text>
                  )}
                  <Text style={styles.teamMeta}>{team.discipline?.name || '-'}</Text>
                  </View>
                </View>

                <View style={styles.teamActionsWrap}>
                  <Text style={styles.countText}>{team.players?.length || 0} jugadores</Text>
                  {isAdmin && (
                    editingTeam === team._id ? (
                      <View style={styles.row}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={saveTeam}>
                          <Text style={styles.secondaryButtonText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.smallButton} onPress={cancelTeamEdit}>
                          <Text style={styles.smallButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.secondaryButton} onPress={() => startEditTeam(team)}>
                        <Text style={styles.secondaryButtonText}>Editar equipo</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.playersList}>
                {team.players?.map((player) => (
                  <View key={player._id} style={styles.playerCard}>
                    <View style={styles.flexOne}>
                      {editingPlayer === player._id ? (
                        <TextInput
                          value={playerName}
                          onChangeText={setPlayerName}
                          style={styles.inputCompact}
                          placeholder="Nombre del jugador"
                          placeholderTextColor="#a3a3a3"
                        />
                      ) : (
                        <Text style={styles.playerName}>{player.name}</Text>
                      )}
                      <Text style={styles.playerPosition}>{player.position || 'Sin posición'}</Text>
                    </View>

                    <View style={styles.playerActionsWrap}>
                      <Text style={styles.playerNumber}>#{player.number || '-'}</Text>
                      {isAdmin && (
                        editingPlayer === player._id ? (
                          <View style={styles.row}>
                            <TouchableOpacity style={styles.secondaryCompactButton} onPress={savePlayer}>
                              <Text style={styles.secondaryButtonText}>Guardar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.smallCompactButton} onPress={cancelPlayerEdit}>
                              <Text style={styles.smallButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity style={styles.secondaryCompactButton} onPress={() => startEditPlayer(player)}>
                            <Text style={styles.secondaryButtonText}>Editar</Text>
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
  errorScreen: {
    flex: 1,
    backgroundColor: '#0b0b0d',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    backgroundColor: 'rgba(239,68,68,0.14)',
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    color: '#fca5a5',
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
  listWrap: {
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
  mutedText: {
    color: 'rgba(255,255,255,0.65)',
  },
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  teamSummary: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  flexOne: {
    flex: 1,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputCompact: {
    backgroundColor: '#1f1f1f',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  teamMeta: {
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
  },
  teamActionsWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  countText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryCompactButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  smallButton: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallCompactButton: {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  playersList: {
    marginTop: 10,
    gap: 8,
  },
  playerCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#151515',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  playerName: {
    color: '#fff',
    fontWeight: '600',
  },
  playerPosition: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  playerActionsWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  playerNumber: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
});
