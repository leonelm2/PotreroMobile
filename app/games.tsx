// app/(tabs)/games.tsx
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import api from "../app/api/api";
import GameCard from "../components/GameCard";

interface Game {
  _id: string;
  [key: string]: unknown;
}

const numCols = 2;
const screenW = Dimensions.get("window").width;
const itemW = (screenW - 48) / numCols;

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    api
      .get("/games")
      .then((res) => setGames(res.data))
      .catch(console.log);
  }, []);

  return (
    <View style={styles.page}>
      <FlatList
        data={games}
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
              onPress={() => router.push(`/game/${item._id}`)}
              onBuy={() => router.push(`/cart?add=${item._id}`)}
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
