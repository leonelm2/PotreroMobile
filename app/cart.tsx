import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getToken } from "../auth/_authStore";
import api from "./api/api";

interface Order {
  _id: string;
  game: string;
  price: number;
  status: string;
  createdAt: string;
  gameData?: {
    name: string;
    price: number;
    image: string;
    description: string;
  };
}

interface PaymentForm {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  email: string;
  address: string;
}

export default function Cart() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState<PaymentForm>({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        Alert.alert("Error", "No hay sesión activa");
        return;
      }

      const res = await api.get("/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filtrar solo órdenes pendientes
      const ordersData = (res.data || []).filter((order: Order) => order.status === "pending");
      setOrders(ordersData);

      const totalAmount = ordersData.reduce(
        (sum: number, order: Order) => sum + order.price,
        0
      );
      setTotal(totalAmount);
    } catch (error: any) {
      console.error("Error cargando órdenes:", error?.response?.data || error.message);
      Alert.alert("Error", "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.cardHolder.trim()) {
      Alert.alert("Error", "Ingresa el nombre del titular");
      return false;
    }
    if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
      Alert.alert("Error", "El número de tarjeta debe tener 16 dígitos");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      Alert.alert("Error", "Usa formato MM/AA para la fecha");
      return false;
    }
    if (formData.cvv.length !== 3) {
      Alert.alert("Error", "El CVV debe tener 3 dígitos");
      return false;
    }
    if (!formData.email.includes("@")) {
      Alert.alert("Error", "Email inválido");
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Ingresa tu dirección");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);
      const token = await getToken();

      if (!token) {
        Alert.alert("Error", "Sesión expirada");
        return;
      }

      // Confirmar pago para cada orden pendiente
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];

        const response = await api.post(
          `/purchases/${order._id}/pay`,
          {
            cardHolder: formData.cardHolder,
            cardNumber: formData.cardNumber,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setProcessing(false);
      
      // Mostrar éxito
      setPaymentSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/(tabs)/library");
      }, 2000);
    } catch (error: any) {
      setProcessing(false);
      console.error("Error en pago:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.msg || "No se pudo procesar el pago"
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (paymentSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎮</Text>
          <Text style={styles.successTitle}>¡Felicidades!</Text>
          <Text style={styles.successMsg}>
            Has adquirido {orders.length} juego{orders.length > 1 ? "s" : ""} exitosamente
          </Text>
          <Text style={styles.successAmount}>
            Total pagado: ${total.toFixed(2)}
          </Text>
          <Text style={styles.redirectMsg}>
            Redirigiendo a tu biblioteca...
          </Text>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtext}>Añade juegos desde la tienda</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Completar Compra</Text>

      {/* Resumen de órdenes */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Juegos a comprar:</Text>
        {orders.map((order) => (
          <View key={order._id} style={styles.orderSummary}>
            <Text style={styles.gameName} numberOfLines={1}>
              {order.gameData?.name || "Juego"}
            </Text>
            <Text style={styles.gamePrice}>${order.price}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Formulario de pago */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Datos de la Tarjeta</Text>

        <Text style={styles.label}>Nombre del Titular</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          placeholderTextColor="#666"
          value={formData.cardHolder}
          onChangeText={(text) =>
            setFormData({ ...formData, cardHolder: text })
          }
        />

        <Text style={styles.label}>Número de Tarjeta</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#666"
          value={formData.cardNumber}
          keyboardType="numeric"
          maxLength={19}
          onChangeText={(text) => {
            const formatted = text.replace(/\s/g, "").slice(0, 16);
            const spaced = formatted
              .replace(/(\d{4})/g, "$1 ")
              .trim();
            setFormData({ ...formData, cardNumber: spaced });
          }}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Vencimiento</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/AA"
              placeholderTextColor="#666"
              value={formData.expiryDate}
              maxLength={5}
              onChangeText={(text) => {
                let formatted = text.replace(/\D/g, "");
                if (formatted.length >= 2) {
                  formatted =
                    formatted.slice(0, 2) + "/" + formatted.slice(2, 4);
                }
                setFormData({ ...formData, expiryDate: formatted });
              }}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#666"
              value={formData.cvv}
              keyboardType="numeric"
              maxLength={3}
              onChangeText={(text) =>
                setFormData({ ...formData, cvv: text.replace(/\D/g, "") })
              }
            />
          </View>
        </View>
      </View>

      {/* Datos personales */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Datos Personales</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor="#666"
          value={formData.email}
          keyboardType="email-address"
          onChangeText={(text) =>
            setFormData({ ...formData, email: text })
          }
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          placeholder="Calle, número, ciudad..."
          placeholderTextColor="#666"
          value={formData.address}
          multiline
          onChangeText={(text) =>
            setFormData({ ...formData, address: text })
          }
        />
      </View>

      {/* Botón de pago */}
      <TouchableOpacity
        style={[styles.paymentBtn, processing && styles.disabled]}
        onPress={handlePayment}
        disabled={processing}
        activeOpacity={0.8}
      >
        {processing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.paymentBtnText}>
            Confirmar Pago - ${total.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        * Este es un simulador de pago. No se procesarán datos reales.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f13",
    padding: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4caf50",
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 16,
    color: "#e6eef3",
    marginBottom: 16,
    textAlign: "center",
  },
  successAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4caf50",
    marginBottom: 20,
  },
  redirectMsg: {
    fontSize: 14,
    color: "#99a1ab",
    fontStyle: "italic",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#e6eef3",
    marginBottom: 20,
    marginTop: 16,
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
  },
  summaryBox: {
    backgroundColor: "#111418",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  summaryTitle: {
    color: "#e6eef3",
    fontWeight: "700",
    marginBottom: 8,
  },
  orderSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gameName: {
    color: "#e6eef3",
    flex: 1,
  },
  gamePrice: {
    color: "#4caf50",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    color: "#99a1ab",
    fontWeight: "600",
  },
  totalPrice: {
    color: "#4caf50",
    fontWeight: "800",
    fontSize: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e6eef3",
    marginBottom: 12,
    marginTop: 8,
  },
  label: {
    color: "#99a1ab",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#111418",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 6,
    padding: 12,
    color: "#e6eef3",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  paymentBtn: {
    backgroundColor: "#4caf50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  paymentBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  disclaimer: {
    color: "#666",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 30,
    fontStyle: "italic",
  },
});
