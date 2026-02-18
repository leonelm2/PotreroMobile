// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../auth/_AuthProvider";

export default function TabsLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  // Si no hay usuario, redirigir al login
  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#c0162e",
        tabBarInactiveTintColor: "#8b8b99",
        tabBarStyle: {
          backgroundColor: "#0b0b0d",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: "#0b0b0d",
          borderBottomColor: "rgba(255,255,255,0.1)",
          borderBottomWidth: 1,
        },
        headerTintColor: "#fff",
        headerRight: () => (
          <View className="flex flex-row items-center gap-3 mr-4">
            <View className="text-right mr-2">
              <Text className="text-sm font-semibold text-white">{user.username}</Text>
              <Text className="text-xs text-white/60">{isAdmin ? 'Administrador' : 'Entrenador'}</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await logout();
                router.replace('/(auth)/login');
              }}
              className="px-4 py-2 rounded-xl border border-white/30"
            >
              <Text className="text-white text-sm">Salir</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="teams"
        options={{
          title: "Equipos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="championships"
        options={{
          title: "Campeonatos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Ocultar otras pantallas del tab bar */}
      <Tabs.Screen
        name="library"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
    </Tabs>
  );
}
