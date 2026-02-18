import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import api from "../../api/client";
import { useAuth } from "../../auth/_AuthProvider";

interface Championship {
  _id: string;
  name: string;
  status: string;
  discipline?: {
    name?: string;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  const [stats, setStats] = useState({ disciplines: 0, teams: 0, championships: 0 });
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [disc, team, champ] = await Promise.all([
        api.get('/disciplines'),
        api.get('/teams'),
        api.get('/championships')
      ]);
      setStats({
        disciplines: disc.data.length,
        teams: team.data.length,
        championships: champ.data.length
      });
      setChampionships(champ.data);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
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
        <View style={styles.heroWrap}>
          <View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Temporada 2026</Text>
            </View>
            <Text style={styles.title}>Panel principal</Text>
            <Text style={styles.subtitle}>
              Administra disciplinas, equipos y campeonatos desde un mismo lugar. Lleva los resultados al instante.
            </Text>
          </View>
          <View style={[styles.actionsRow, isCompact && styles.actionsColumn]}>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/equipos')}
              style={[styles.secondaryButton, isCompact && styles.fullWidth]}
            >
              <Text style={styles.secondaryButtonText}>Ver equipos</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/campeonatos')}
                style={[styles.primaryButton, isCompact && styles.fullWidth]}
              >
                <Text style={styles.primaryButtonText}>Nuevo campeonato</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.statsRow, isCompact && styles.actionsColumn]}>
          <View style={[styles.statCard, !isCompact && styles.flexCard]}>
            <Text style={styles.statLabel}>Disciplinas</Text>
            <Text style={styles.statValue}>{stats.disciplines}</Text>
            <Text style={styles.statHint}>Control total de deportes y formatos.</Text>
          </View>
          <View style={[styles.statCard, !isCompact && styles.flexCard]}>
            <Text style={styles.statLabel}>Equipos</Text>
            <Text style={styles.statValue}>{stats.teams}</Text>
            <Text style={styles.statHint}>Registro de planteles y entrenadores.</Text>
          </View>
          <View style={[styles.statCard, !isCompact && styles.flexCard]}>
            <Text style={styles.statLabel}>Campeonatos</Text>
            <Text style={styles.statValue}>{stats.championships}</Text>
            <Text style={styles.statHint}>Competencias activas y en planificación.</Text>
          </View>
        </View>

        <View style={styles.recentWrap}>
          <Text style={styles.recentTitle}>Campeonatos recientes</Text>
          <View style={styles.recentList}>
            {championships.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No hay campeonatos creados.</Text>
              </View>
            )}
            {championships.map((champ) => (
              <View key={champ._id} style={styles.champCard}>
                <View>
                  <Text style={styles.champName}>{champ.name}</Text>
                  <Text style={styles.champMeta}>{champ.discipline?.name} · Estado: {champ.status}</Text>
                </View>
                <View style={[styles.champActions, isCompact && styles.actionsColumn]}>
                  <TouchableOpacity 
                    style={styles.smallButton}
                    onPress={() => router.push(`/championships/${champ._id}/tabla` as any)}
                  >
                    <Text style={styles.smallButtonText}>Tabla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.smallButton}
                    onPress={() => router.push(`/championships/${champ._id}/llaves` as any)}
                  >
                    <Text style={styles.smallButtonText}>Llaves</Text>
                  </TouchableOpacity>
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
    paddingBottom: 36,
  },
  heroWrap: {
    gap: 14,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pillText: {
    color: '#e5e7eb',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 8,
    maxWidth: 620,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  actionsColumn: {
    flexDirection: 'column',
  },
  fullWidth: {
    width: '100%',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#c0162e',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  statsRow: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
  },
  flexCard: {
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  statValue: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
  },
  statHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 8,
  },
  recentWrap: {
    marginTop: 32,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  recentList: {
    marginTop: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.65)',
  },
  champCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 12,
  },
  champName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  champMeta: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 2,
  },
  champActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
