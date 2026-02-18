// app/juegos.tsx
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import GameCard from "../components/GameCard";
import api from "./api/api";

interface Juego {
  _id: string;
  [key: string]: unknown;
}

const numCols = 2;
const screenW = Dimensions.get("window").width;
const itemW = (screenW - 48) / numCols;

export default function Juegos() {
  const [juegos, setJuegos] = useState<Juego[]>([]);

  useEffect(() => {
    api
      .get("/juegos")
      .then((res) => setJuegos(res.data))
      .catch(console.log);
  }, []);

  return (
    <View style={styles.page}>
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
            <GameCard
              game={item}
              onPress={() => router.push(`/juego/${item._id}` as any)}
              onBuy={() => router.push(`/carrito?add=${item._id}`)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f13", paddingTop: 8 },
});
