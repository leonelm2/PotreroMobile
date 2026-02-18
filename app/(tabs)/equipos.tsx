import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
            <Text style={styles.pillText}>Planteles</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Gestión de equipos</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setEditing(null);
                setForm({ name: '', discipline: '', logoUrl: '' });
              }}
            >
              <Text style={styles.primaryButtonText}>Agregar equipo</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Crea equipos y asócialos a una disciplina deportiva.</Text>
        </View>

        <View style={styles.mainWrap}>
          <View style={styles.formsWrap}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{editing ? 'Editar equipo' : 'Nuevo equipo'}</Text>

              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Nombre del equipo"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
              />

              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionLabel}>Selecciona disciplina</Text>
                {disciplines.map(d => (
                  <TouchableOpacity
                    key={d._id}
                    onPress={() => setForm({ ...form, discipline: d._id })}
                    style={[
                      styles.selectOption,
                      form.discipline === d._id ? styles.selectOptionActive : styles.selectOptionInactive,
                    ]}
                  >
                    <Text style={form.discipline === d._id ? styles.selectTextActive : styles.selectTextInactive}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                value={form.logoUrl}
                onChangeText={(text) => setForm({ ...form, logoUrl: text })}
                placeholder="URL del logo (opcional)"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.row}>
                <TouchableOpacity style={[styles.primaryButton, styles.flexOne]} onPress={submit}>
                  <Text style={styles.primaryButtonText}>Guardar</Text>
                </TouchableOpacity>
                {editing && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.flexOne]}
                    onPress={() => {
                      setEditing(null);
                      setForm({ name: '', discipline: '', logoUrl: '' });
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Agregar jugador</Text>

              <TextInput
                value={playerForm.name}
                onChangeText={(text) => setPlayerForm({ ...playerForm, name: text })}
                placeholder="Nombre del jugador"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
              />

              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionLabel}>Selecciona equipo</Text>
                {teams.map(team => (
                  <TouchableOpacity
                    key={team._id}
                    onPress={() => setPlayerForm({ ...playerForm, team: team._id })}
                    style={[
                      styles.selectOption,
                      playerForm.team === team._id ? styles.selectOptionActive : styles.selectOptionInactive,
                    ]}
                  >
                    <Text style={playerForm.team === team._id ? styles.selectTextActive : styles.selectTextInactive}>{team.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <TextInput
                  value={playerForm.number}
                  onChangeText={(text) => setPlayerForm({ ...playerForm, number: text })}
                  placeholder="Número"
                  placeholderTextColor="#a3a3a3"
                  keyboardType="number-pad"
                  style={[styles.input, styles.flexOne]}
                />
                <View style={styles.flexOne}>
                  <TextInput
                    value={playerForm.age}
                    onChangeText={(text) => setPlayerForm({ ...playerForm, age: text })}
                    placeholder="Edad"
                    placeholderTextColor="#a3a3a3"
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>
              </View>

              <TextInput
                value={playerForm.position}
                onChangeText={(text) => setPlayerForm({ ...playerForm, position: text })}
                placeholder="Posición"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
              />

              {playerError ? <Text style={styles.errorText}>{playerError}</Text> : null}

              <TouchableOpacity style={styles.primaryButton} onPress={addPlayer}>
                <Text style={styles.primaryButtonText}>Agregar jugador</Text>
              </TouchableOpacity>
            </View>
          </View>

          {teams.length === 0 && (
            <View style={styles.card}>
              <Text style={styles.mutedText}>No hay equipos registrados.</Text>
            </View>
          )}
          
          {teams.map(team => (
            <View key={team._id} style={styles.listCard}>
              <View style={styles.listHeaderRow}>
                <View style={styles.teamSummary}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {team.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.flexOne}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamMeta}>
                      {team.discipline?.name} · {playersByTeam[team._id]?.length || 0} jugadores
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => {
                      setEditing(team._id);
                      setForm({
                        name: team.name,
                        discipline: team.discipline?._id || '',
                        logoUrl: team.logoUrl || ''
                      });
                    }}
                  >
                    <Text style={styles.smallButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.secondarySmallButton}
                    onPress={() => remove(team._id)}
                  >
                    <Text style={styles.smallButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {playersByTeam[team._id] && playersByTeam[team._id].length > 0 && (
                <View style={styles.playersWrap}>
                  <Text style={styles.playersTitle}>
                    Jugadores ({playersByTeam[team._id].length})
                  </Text>
                  {playersByTeam[team._id].map((player: any) => (
                    <View key={player._id} style={styles.playerRow}>
                      <Text style={styles.playerNumber}>#{player.number}</Text>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerPosition}>{player.position}</Text>
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
    paddingBottom: 36,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
  },
  mainWrap: {
    marginTop: 22,
    gap: 14,
  },
  formsWrap: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    marginBottom: 10,
  },
  sectionSpacing: {
    marginBottom: 10,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginBottom: 8,
  },
  selectOption: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  selectOptionActive: {
    backgroundColor: 'rgba(192,22,46,0.25)',
    borderColor: '#c0162e',
  },
  selectOptionInactive: {
    backgroundColor: '#1f1f1f',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  selectTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  selectTextInactive: {
    color: 'rgba(255,255,255,0.72)',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#c0162e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  mutedText: {
    color: 'rgba(255,255,255,0.65)',
  },
  listCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  teamSummary: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  teamName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  teamMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 2,
  },
  smallButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondarySmallButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
  },
  playersWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  playersTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  playerNumber: {
    color: '#c0162e',
    fontWeight: '700',
    width: 34,
  },
  playerName: {
    color: '#fff',
    flex: 1,
  },
  playerPosition: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
});
