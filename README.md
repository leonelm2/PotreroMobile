# App Móvil - Potrero App

Aplicación móvil para la plataforma Potrero, construida con React Native y Expo.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v16 o superior)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app instalada en tu dispositivo móvil:
  - [Android](https://play.google.com/store/apps/details?id=host.exp/exponent)
  - [iOS](https://apps.apple.com/app/expo-go/id982107779)

### Instalación

```bash
npm install
```

### Configuración

**IMPORTANTE**: Debes configurar la IP de tu computadora en el archivo `.env`.

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Obtén la IP de tu computadora:

**Windows:**
```bash
ipconfig
```
Busca "Dirección IPv4" en tu adaptador de red activo (ejemplo: `192.168.1.10`)

**Mac/Linux:**
```bash
ifconfig
# o
ip addr
```

3. Edita el archivo `.env` y reemplaza la IP:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_AQUI:5000
```

Ejemplo:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000
```

### Ejecutar la App

```bash
npm start
```

Esto abrirá Expo Developer Tools en tu navegador y mostrará un código QR.

### Probar en tu Dispositivo

1. Asegúrate de que tu teléfono y computadora estén en la **misma red Wi-Fi**
2. Abre la app **Expo Go** en tu dispositivo
3. Escanea el código QR:
   - **Android**: Usa el escáner de la app Expo Go
   - **iOS**: Usa la cámara del iPhone (abrirá Expo Go automáticamente)

### Ejecutar en Emulador

**Android:**
```bash
npm run android
```

**iOS** (solo en Mac):
```bash
npm run ios
```

## 📁 Estructura

```
PotreroMobile/
├── app/                    # Rutas de la app (Expo Router)
│   ├── _layout.tsx        # Layout principal
│   ├── +html.tsx
│   ├── +not-found.tsx
│   ├── (auth)/            # Pantallas de autenticación
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── authStore.ts
│   ├── (tabs)/            # Pantallas con tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── championships.tsx
│   │   ├── teams.tsx
│   │   ├── library.tsx
│   │   └── profile.tsx
│   ├── admin/             # Pantallas de admin
│   │   ├── index.tsx
│   │   ├── createGame.tsx
│   │   └── editGame.tsx
│   ├── game/              # Detalles de juego
│   │   └── [id].tsx
│   ├── api/               # Cliente API
│   │   └── api.ts
│   └── auth/              # Autenticación
│       ├── AuthProvider.tsx
│       └── authStore.ts
├── api/                   # Cliente API alternativo
│   └── client.ts
├── components/            # Componentes reutilizables
│   ├── GameCard.tsx
│   └── useColorScheme.ts
├── assets/                # Recursos estáticos
│   ├── fonts/
│   └── images/
├── app.json              # Configuración de Expo
├── tsconfig.json         # Configuración de TypeScript
├── tailwind.config.cjs   # Configuración de NativeWind
└── package.json
```

## 🎨 Características

- 📱 React Native con Expo
- 🧭 Expo Router para navegación
- 🎨 NativeWind (TailwindCSS para React Native)
- 🔐 Autenticación con JWT
- 💾 AsyncStorage para persistencia
- ⚡️ TypeScript
- 🔄 Axios para peticiones HTTP

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | URL del backend (con tu IP local) | `http://192.168.1.10:5000` |

⚠️ **Importante**: En Expo, las variables de entorno deben tener el prefijo `EXPO_PUBLIC_` para ser accesibles desde el código.

### Cliente API

Hay dos clientes API configurados:

**app/api/api.ts:**
```typescript
import axios from "axios";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.36:5000";

const api = axios.create({
  baseURL: BASE_URL + "/api"
});

export default api;
```

**api/client.ts:**
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.36:5000') + '/api';

const api = axios.create({ 
  baseURL: BASE_URL 
});

// Interceptor para autenticación
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('potrero_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 🧭 Navegación

El proyecto usa **Expo Router** que utiliza el sistema de archivos para definir rutas:

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `app/index.tsx` | `/` | Pantalla principal |
| `app/(auth)/login.tsx` | `/login` | Iniciar sesión |
| `app/(tabs)/championships.tsx` | `/championships` | Lista de campeonatos |
| `app/game/[id].tsx` | `/game/123` | Detalle de juego |

### Navegación programática

```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  // Navegar
  router.push('/championships');
  
  // Navegar con parámetros
  router.push(`/game/${gameId}`);
  
  // Volver
  router.back();
}
```

## 🔐 Autenticación

El sistema de autenticación usa AsyncStorage para persistir el token:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar token
await AsyncStorage.setItem('potrero_token', token);

// Obtener token
const token = await AsyncStorage.getItem('potrero_token');

// Eliminar token
await AsyncStorage.removeItem('potrero_token');
```

## 🎨 Estilos con NativeWind

NativeWind permite usar clases de TailwindCSS en React Native:

```tsx
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800">
        Hola Mundo
      </Text>
    </View>
  );
}
```

## 📝 Scripts

- `npm start` - Iniciar Expo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS (solo Mac)
- `npm run web` - Ejecutar en navegador

## 🐛 Solución de Problemas

### Error: "Network request failed"

1. **Verifica que estés en la misma red Wi-Fi** que tu computadora
2. **Verifica la IP en `.env`**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
3. **Verifica que el backend esté corriendo**:
   ```bash
   # En el proyecto backend
   npm run dev
   ```
4. **Desactiva temporalmente el firewall** si es necesario
5. **Reinicia Expo**:
   ```bash
   # Ctrl+C para detener
   npm start -- --clear
   ```

### Error: "Unable to resolve module"

```bash
# Limpia la caché de Expo
npm start -- --clear

# Si persiste, reinstala dependencias
rm -rf node_modules
npm install
```

### La app no se actualiza

1. **Sacude el dispositivo** para abrir el menú de desarrollo
2. Selecciona **"Reload"**
3. O presiona `r` en la terminal donde corre Expo

### Problemas con AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

### Problemas con NativeWind

1. Verifica que `tailwind.config.cjs` esté correctamente configurado
2. Reinicia el servidor con caché limpia:
   ```bash
   npm start -- --clear
   ```

## 📦 Dependencias Principales

- `expo` - Framework de React Native
- `expo-router` - Sistema de rutas basado en archivos
- `react-native` - Framework móvil
- `axios` - Cliente HTTP
- `@react-native-async-storage/async-storage` - Almacenamiento local
- `nativewind` - TailwindCSS para React Native

## 🔄 Actualizar Dependencias de Expo

```bash
npx expo install --fix
```

Esto actualizará todas las dependencias de Expo a versiones compatibles.

## 📱 Compilar para Producción

### Android (APK)

```bash
eas build -p android --profile preview
```

### iOS (solo en Mac)

```bash
eas build -p ios --profile preview
```

Necesitarás configurar EAS (Expo Application Services) primero:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

## 🌐 Más Información

- [Documentación de Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [React Native](https://reactnative.dev/)
