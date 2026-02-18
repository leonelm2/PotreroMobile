import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getToken } from "../../auth/_authStore";
import api from "../api/api";

interface JuegoComprado {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  status: string;
}

const numCols = 2;
const screenW = Dimensions.get("window").width;
const itemW = (screenW - 48) / numCols;

export default function BibliotecaScreen() {
  const [juegos, setJuegos] = useState<JuegoComprado[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarBiblioteca();
  }, []);

  const cargarBiblioteca = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        setJuegos([]);
        return;
      }

      const res = await api.get("/compras/biblioteca/yo", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJuegos(res.data || []);
    } catch (error: any) {
      console.error("Error cargando biblioteca:", error?.response?.data || error.message);
      setJuegos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (juegos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu biblioteca está vacía</Text>
          <Text style={styles.emptySubtext}>Compra juegos para agregarlos aquí</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.8}
          >
            <Text style={styles.shopBtnText}>Ir a la Tienda</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Biblioteca</Text>
      <Text style={styles.subtitle}>
        {juegos.length} juego{juegos.length > 1 ? "s" : ""} comprado{juegos.length > 1 ? "s" : ""}
      </Text>

      <FlatList
        data={juegos}
        keyExtractor={(item) => item._id}
        numColumns={numCols}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <View style={{ width: itemW }}>
            <View style={styles.gameCard}>
              <Image
                source={{
                  uri: item.image.startsWith("/uploads")
                    ? `http://192.168.0.17:5000${item.image}`
                    : item.image,
                }}
                style={styles.cover}
                resizeMode="cover"
              />
              <View style={styles.gameInfo}>
                <Text style={styles.gameName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.gameDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
                  <Text style={styles.downloadText}>Descargar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f13",
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#e6eef3",
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 12,
    color: "#99a1ab",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#e6eef3",
    marginBottom: 8,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#99a1ab",
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  gameCard: {
    backgroundColor: "#111418",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  cover: {
    width: "100%",
    height: 160,
    backgroundColor: "#0b0f13",
  },
  gameInfo: {
    padding: 10,
  },
  gameName: {
    color: "#e6eef3",
    fontSize: 16,
    fontWeight: "700",
  },
  gameDesc: {
    color: "#99a1ab",
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    backgroundColor: "#4caf50",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
    downloadBtn: {
      marginTop: 8,
      backgroundColor: "#4caf50",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      alignItems: "center",
      width: "100%",
    },
    downloadText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
    },
  });
