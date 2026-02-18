// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useAuth } from "../../auth/_AuthProvider";

export default function TabsLayout() {
  const { user, logout, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  if (loading) {
    return (
      <View className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
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
          height: isCompact ? 64 : 72,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: isCompact ? 11 : 12,
          paddingBottom: isCompact ? 2 : 4,
        },
        headerStyle: {
          backgroundColor: "#0b0b0d",
          borderBottomColor: "rgba(255,255,255,0.1)",
          borderBottomWidth: 1,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          letterSpacing: 0.4,
        },
        headerRight: () => (
          <View className="flex flex-row items-center gap-3 mr-4">
            {!isCompact && (
              <View className="text-right mr-2">
                <Text className="text-sm font-semibold text-white">{user.username}</Text>
                <Text className="text-xs text-white/60">{isAdmin ? 'Administrador' : 'Entrenador'}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={async () => {
                await logout();
              }}
              className="px-3 py-2 rounded-xl border border-white/30"
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
