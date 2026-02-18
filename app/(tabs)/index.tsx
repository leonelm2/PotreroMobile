import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import api from "../../api/client";
import { useAuth } from "../auth/_AuthProvider";

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
      <View className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ink">
      <View className="max-w-6xl px-6 py-8">
        <View className="flex flex-col gap-4">
          <View>
            <View className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 self-start">
              <Text className="text-white/80 text-xs uppercase tracking-widest">Temporada 2026</Text>
            </View>
            <Text className="text-3xl tracking-wide text-white mt-3 font-bold">Panel principal</Text>
            <Text className="text-white/70 max-w-xl mt-2">
              Administra disciplinas, equipos y campeonatos desde un mismo lugar. Lleva los resultados al instante.
            </Text>
          </View>
          <View className="flex flex-row gap-3 mt-2">
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/teams')}
              className="px-5 py-2.5 rounded-xl border border-white/30"
            >
              <Text className="text-white">Ver equipos</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/championships')}
                className="px-5 py-2.5 rounded-xl bg-ember"
              >
                <Text className="text-white font-semibold">Nuevo campeonato</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Statistics Cards */}
        <View className="flex flex-row gap-4 mt-8">
          <View className="flex-1 rounded-2xl border border-white/10 bg-white/5 shadow-lg p-5">
            <Text className="text-sm text-white/60">Disciplinas</Text>
            <Text className="text-3xl mt-2 font-bold text-white">{stats.disciplines}</Text>
            <Text className="text-white/60 text-sm mt-2">Control total de deportes y formatos.</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-white/10 bg-white/5 shadow-lg p-5">
            <Text className="text-sm text-white/60">Equipos</Text>
            <Text className="text-3xl mt-2 font-bold text-white">{stats.teams}</Text>
            <Text className="text-white/60 text-sm mt-2">Registro de planteles y entrenadores.</Text>
          </View>
        </View>

        <View className="rounded-2xl border border-white/10 bg-white/5 shadow-lg p-5 mt-4">
          <Text className="text-sm text-white/60">Campeonatos</Text>
          <Text className="text-3xl mt-2 font-bold text-white">{stats.championships}</Text>
          <Text className="text-white/60 text-sm mt-2">Competencias activas y en planificación.</Text>
        </View>

        {/* Recent Championships */}
        <View className="mt-10">
          <Text className="text-2xl text-white font-bold">Campeonatos recientes</Text>
          <View className="mt-4">
            {championships.length === 0 && (
              <View className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <Text className="text-white/60">No hay campeonatos creados.</Text>
              </View>
            )}
            {championships.map((champ) => (
              <View key={champ._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col mb-4">
                <View>
                  <Text className="text-xl text-white">{champ.name}</Text>
                  <Text className="text-sm text-white/60">{champ.discipline?.name} · Estado: {champ.status}</Text>
                </View>
                <View className="flex flex-row gap-3 mt-3">
                  <TouchableOpacity 
                    className="px-4 py-2 rounded-xl bg-white/5"
                    onPress={() => router.push(`/championships/${champ._id}/standings` as any)}
                  >
                    <Text className="text-white">Tabla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="px-4 py-2 rounded-xl bg-white/5"
                    onPress={() => router.push(`/championships/${champ._id}/bracket` as any)}
                  >
                    <Text className="text-white">Llaves</Text>
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
