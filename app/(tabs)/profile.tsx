import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { logout, getToken } from "../auth/authStore";

export default function ProfileScreen() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const t = await getToken();
      if (mounted) setIsLogged(!!t);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {isLogged ? (
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await logout();
            setIsLogged(false);
            router.push("/(tabs)");
          }}
        >
          <Text style={styles.buttonText}>Cerrar sesion</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: "#1abc9c",
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1abc9c",
    padding: 15,
    borderRadius: 10,
    width: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
});
