import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/client';
import { useAuth } from '../../auth/_AuthProvider';

export default function Campeonatos() {
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
        api.get('/disciplinas'),
        api.get('/equipos'),
        api.get('/campeonatos')
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
        await api.put(`/campeonatos/${editingId}`, form);
      } else {
        await api.post('/campeonatos', form);
      }
      setForm({ name: '', discipline: '', teams: [], groupCount: 2, qualifiersPerGroup: 2 });
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al crear campeonato');
    }
  };

  const generateGroups = async (id: string) => {
    await api.post(`/campeonatos/${id}/generar-grupos`);
    load();
  };

  const generateBracket = async (id: string) => {
    await api.post(`/campeonatos/${id}/generar-llaves`);
    load();
  };

  const advanceBracket = async (id: string) => {
    try {
      await api.post(`/campeonatos/${id}/avanzar-eliminatoria`);
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
            await api.delete(`/campeonatos/${id}`);
            load();
          }
        }
      ]
    );
  };

  const finalizeChampionship = async (id: string) => {
    await api.put(`/campeonatos/${id}`, { status: 'completed' });
    load();
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
            <Text style={styles.pillText}>Organización</Text>
          </View>
          <Text style={styles.title}>Gestión de campeonatos</Text>
          <Text style={styles.subtitle}>Crea campeonatos, genera grupos y administra las llaves eliminatorias.</Text>
        </View>

        <View style={styles.mainWrap}>
          {isAdmin ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{editingId ? 'Editar torneo' : 'Nuevo torneo'}</Text>
              
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Nombre del campeonato"
                placeholderTextColor="#a3a3a3"
                style={styles.input}
              />
              
              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionLabel}>Selecciona disciplina</Text>
                {disciplines.map(d => (
                  <TouchableOpacity
                    key={d._id}
                    onPress={() => setForm({ ...form, discipline: d._id, teams: [] })}
                    style={[
                      styles.selectOption,
                      form.discipline === d._id ? styles.selectOptionActive : styles.selectOptionInactive,
                    ]}
                  >
                    <Text style={form.discipline === d._id ? styles.selectTextActive : styles.selectTextInactive}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}> 
                <TextInput
                  value={form.groupCount.toString()}
                  onChangeText={(text) => setForm({ ...form, groupCount: Number(text) || 2 })}
                  placeholder="Cantidad de grupos"
                  placeholderTextColor="#a3a3a3"
                  keyboardType="number-pad"
                  style={[styles.input, styles.flexOne]}
                />
                <TextInput
                  value={form.qualifiersPerGroup.toString()}
                  onChangeText={(text) => setForm({ ...form, qualifiersPerGroup: Number(text) || 2 })}
                  placeholder="Clasificados por grupo"
                  placeholderTextColor="#a3a3a3"
                  keyboardType="number-pad"
                  style={[styles.input, styles.flexOne]}
                />
              </View>

              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionLabel}>Equipos disponibles</Text>
                {filteredTeams.length === 0 && (
                  <Text style={styles.mutedText}>Selecciona una disciplina para ver equipos.</Text>
                )}
                {filteredTeams.map(team => (
                  <TouchableOpacity
                    key={team._id}
                    onPress={() => toggleTeam(team._id)}
                    style={styles.checkboxRow}
                  >
                    <View style={[styles.checkbox, form.teams.includes(team._id) && styles.checkboxChecked]}>
                      {form.teams.includes(team._id) && (
                        <Text style={styles.checkboxTick}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.teamText}>{team.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <View style={styles.row}>
                <TouchableOpacity style={[styles.primaryButton, styles.flexOne]} onPress={submit}>
                  <Text style={styles.primaryButtonText}>Crear torneo</Text>
                </TouchableOpacity>
                {editingId && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.flexOne]}
                    onPress={() => {
                      setEditingId(null);
                      setForm({ name: '', discipline: '', teams: [], groupCount: 2, qualifiersPerGroup: 2 });
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.mutedText}>Solo el administrador puede crear o editar torneos.</Text>
            </View>
          )}

          {championships.length === 0 && (
            <View style={styles.card}>
              <Text style={styles.mutedText}>No hay campeonatos creados.</Text>
            </View>
          )}
          
          {championships.map(champ => (
            <View key={champ._id} style={styles.listCard}>
              <View style={styles.listHeaderRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.listTitle}>{champ.name}</Text>
                  <Text style={styles.listMeta}>
                    {champ.discipline?.name} · {champ.teams?.length || 0} equipos
                  </Text>
                </View>
                <Text style={styles.listMeta}>Estado: {champ.status}</Text>
              </View>

              <View style={styles.actionsWrap}>
                {isAdmin && (
                  <>
                    <TouchableOpacity 
                      style={styles.smallButton}
                      onPress={() => generateGroups(champ._id)}
                    >
                      <Text style={styles.smallButtonText}>Generar grupos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.smallButton}
                      onPress={() => generateBracket(champ._id)}
                    >
                      <Text style={styles.smallButtonText}>Generar llaves</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.smallButton}
                      onPress={() => advanceBracket(champ._id)}
                    >
                      <Text style={styles.smallButtonText}>Avanzar fase</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.smallButton}
                      onPress={() => startEdit(champ)}
                    >
                      <Text style={styles.smallButtonText}>Editar torneo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.smallButton}
                      onPress={() => finalizeChampionship(champ._id)}
                    >
                      <Text style={styles.smallButtonText}>Finalizar torneo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.secondarySmallButton}
                      onPress={() => deleteChampionship(champ._id)}
                    >
                      <Text style={styles.smallButtonText}>Eliminar torneo</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity 
                  style={styles.secondarySmallButton}
                  onPress={() => router.push(`/campeonatos/${champ._id}/equipos` as any)}
                >
                  <Text style={styles.smallButtonText}>Ver equipos</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondarySmallButton}
                  onPress={() => router.push(`/campeonatos/${champ._id}/tabla` as any)}
                >
                  <Text style={styles.smallButtonText}>Ver tabla</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondarySmallButton}
                  onPress={() => router.push(`/campeonatos/${champ._id}/llaves` as any)}
                >
                  <Text style={styles.smallButtonText}>Ver llaves</Text>
                </TouchableOpacity>
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
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  mainWrap: {
    marginTop: 22,
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
    gap: 10,
    marginBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  mutedText: {
    color: 'rgba(255,255,255,0.6)',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#c0162e',
    borderColor: '#c0162e',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  teamText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#c0162e',
    borderRadius: 12,
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
    gap: 8,
  },
  listTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  listMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 2,
  },
  actionsWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
