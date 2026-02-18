import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/client';

export default function Disciplines() {
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/disciplinas');
      setDisciplines(res.data);
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
        await api.put(`/disciplinas/${editing}`, form);
      } else {
        await api.post('/disciplinas', form);
      }
      setForm({ name: '', description: '' });
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al guardar');
    }
  };

  const startEdit = (discipline: any) => {
    setEditing(discipline._id);
    setForm({ name: discipline.name, description: discipline.description || '' });
  };

  const remove = async (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar disciplina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/disciplinas/${id}`);
            load();
          }
        }
      ]
    );
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
            <Text style={styles.pillText}>Gestión central</Text>
          </View>
          <Text style={styles.title}>Disciplinas deportivas</Text>
          <Text style={styles.subtitle}>Define el catálogo de deportes disponibles para los campeonatos.</Text>
        </View>

        <View style={styles.mainWrap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{editing ? 'Editar disciplina' : 'Nueva disciplina'}</Text>
            
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Nombre de la disciplina"
              placeholderTextColor="#a3a3a3"
              style={styles.input}
            />
            
            <TextInput
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Descripción breve"
              placeholderTextColor="#a3a3a3"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.descriptionInput]}
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
                    setForm({ name: '', description: '' });
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {disciplines.length === 0 && (
            <View style={styles.card}>
              <Text style={styles.mutedText}>No hay disciplinas registradas.</Text>
            </View>
          )}
          
          {disciplines.map(discipline => (
            <View key={discipline._id} style={styles.listCard}>
              <View style={styles.listRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.listTitle}>{discipline.name}</Text>
                  <Text style={styles.listMeta}>{discipline.description || 'Sin descripción'}</Text>
                </View>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => startEdit(discipline)}
                  >
                    <Text style={styles.smallButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.secondarySmallButton}
                    onPress={() => remove(discipline._id)}
                  >
                    <Text style={styles.smallButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
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
  mainWrap: {
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
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
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flexOne: {
    flex: 1,
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
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  listTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  listMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 3,
  },
  smallButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondarySmallButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
  },
});
