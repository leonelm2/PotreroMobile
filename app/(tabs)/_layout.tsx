// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useAuth } from "../../auth/_AuthProvider";

export default function TabsLayout() {
  const { user, logout, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c0162e" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerBackTitleVisible: false,
        headerBackButtonDisplayMode: 'minimal',
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
        headerLeft: () => {
          if (!navigation.canGoBack()) return null;
          return (
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </Pressable>
          );
        },
        headerRight: () => (
          <View style={styles.headerRightWrap}>
            {!isCompact && (
              <View style={styles.userMeta}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.role}>{isAdmin ? 'Administrador' : 'Entrenador'}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={async () => {
                await logout();
              }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="equipos"
        options={{
          title: "Equipos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="campeonatos"
        options={{
          title: "Campeonatos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Ocultar otras pantallas del tab bar */}
      <Tabs.Screen
        name="biblioteca"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          href: null, // Ocultar del tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b0b0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 12,
  },
  headerRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  userMeta: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  role: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
  },
});
