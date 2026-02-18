// app/game/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getToken } from "../../auth/_authStore";
import api from "../api/api";

interface Game {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function GameDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!id) return;

    api.get(`/games/${id}`)
      .then(r => setGame(r.data))
      .catch(console.log);
  }, [id]);

  // banner state and timer (must be declared unconditionally at top-level of component)
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function dismissBanner() {
    setShowBanner(false);
    setBannerMsg(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  async function handleBuy() {
    try {
      if (!id) {
        Alert.alert("Error", "ID del juego no disponible");
        return;
      }

      const token = await getToken();

      if (!token) {
        Alert.alert("Debes iniciar sesión", "Inicia sesión para comprar juegos.");
        router.push("/(auth)/login");
        return;
      }

      const endpoint = `/purchases/${id}`;

      const res = await api.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert("Éxito", `Compra iniciada para: ${game?.name || 'juego'}. Estado: ${res.data?.status}`);
      router.push("/cart");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.msg || error?.response?.data?.message;
      const statusCode = error?.response?.status;

      // Manejo específico de errores
      if (statusCode === 400 && errorMsg?.includes("Ya compraste")) {
        const msg = `Ya tienes "${game?.name}" en tu biblioteca.\n\nVe a tu biblioteca para acceder.`;
        // Mostrar banner en pantalla en vez de un Alert
        setBannerMsg(msg);
        setShowBanner(true);
        // redirigir automáticamente después de un corto delay
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          router.push("/(tabs)/library");
        }, 2600) as any;
      } else if (statusCode === 401 || statusCode === 403) {
        Alert.alert("Acceso denegado", "Debes iniciar sesión para comprar");
        router.push("/(auth)/login");
      } else {
        const serverMsg = errorMsg || error?.message || "No se pudo procesar la compra";
        Alert.alert("Error en compra", String(serverMsg));
      }
    }
  }


  if (!game) return (
    <View style={styles.page}>
      <Text style={{color:"#fff"}}>Cargando...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {showBanner && bannerMsg ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{bannerMsg}</Text>
          <TouchableOpacity onPress={dismissBanner} style={styles.bannerClose}>
            <Text style={styles.bannerCloseText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView style={styles.page}>
      <Image 
        source={{ uri: `http://192.168.0.17:5000${game.image}` }} 
        style={styles.cover} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>{game.name}</Text>
        <Text style={styles.desc}>{game.description}</Text>

        <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
            <Text style={styles.buyText}>Comprar ${game.price}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f13" },
  cover: { width: "100%", height: 220 },
  content: { padding: 16 },
  title: { color: "#e6eef3", fontSize: 22, fontWeight: "800" },
  desc: { color: "#99a1ab", marginTop: 8 },
  buyBtn: { backgroundColor: "#4caf50", padding: 12, borderRadius: 8 },
  buyText: { color: "#fff", fontWeight: "700" },
  banner: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: "#ffea9b",
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerText: { color: "#000", flex: 1, marginRight: 8 },
  bannerClose: { paddingHorizontal: 8, paddingVertical: 4 },
  bannerCloseText: { color: "#000", fontWeight: "700" },
});

