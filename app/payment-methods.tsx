import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: "12",
      expiryYear: "2025",
      isDefault: true
    },
    {
      id: "2",
      type: "card",
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: "08",
      expiryYear: "2026",
      isDefault: false
    },
    {
      id: "3",
      type: "paypal",
      email: "john.doe@example.com",
      isDefault: false
    }
  ]);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  const handleAddPayment = () => {
    showAlert(
      "Add Payment Method",
      "Choose a payment method to add",
      "info",
      [
        { text: "Credit Card", onPress: () => showAlert("Coming Soon", "Credit card addition will be available soon", "info") },
        { text: "PayPal", onPress: () => showAlert("Coming Soon", "PayPal integration will be available soon", "info") },
        { text: "Apple Pay", onPress: () => showAlert("Coming Soon", "Apple Pay will be available soon", "info") },
        { text: "Cancel", style: "cancel", onPress: () => {} }
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleRemovePayment = (id: string) => {
    showAlert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      "warning",
      [
        { text: "Cancel", style: "cancel", onPress: () => {} },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          }
        }
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa": return "cc-visa";
      case "mastercard": return "cc-mastercard";
      case "amex": return "cc-amex";
      case "discover": return "cc-discover";
      default: return "credit-card";
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "card": return "credit-card";
      case "paypal": return "paypal";
      case "apple": return "apple";
      default: return "credit-card";
    }
  };

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Manage your payment methods for subscriptions and purchases.
      </Text>

      {/* Payment Methods List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Payment Methods</Text>
        {paymentMethods.map((method, index) => (
          <View key={method.id} style={styles.paymentMethod}>
            <View style={styles.methodLeft}>
              <View style={styles.methodIcon}>
                <FontAwesome 
                  name={method.type === "card" ? getCardIcon(method.brand || "") : getPaymentIcon(method.type) as any} 
                  size={24} 
                  color="#000" 
                />
              </View>
              <View style={styles.methodInfo}>
                {method.type === "card" ? (
                  <>
                    <Text style={styles.methodTitle}>
                      {method.brand} •••• {method.last4}
                    </Text>
                    <Text style={styles.methodSubtitle}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.methodTitle}>
                      {method.type === "paypal" ? "PayPal" : "Apple Pay"}
                    </Text>
                    <Text style={styles.methodSubtitle}>
                      {method.email || "Touch ID enabled"}
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View style={styles.methodActions}>
              {method.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.setDefaultButton}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Text style={styles.setDefaultText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemovePayment(method.id)}
              >
                <FontAwesome name="trash" size={16} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add Payment Method */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
        <FontAwesome name="plus" size={20} color="#000" />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <FontAwesome name="shield" size={20} color="#10b981" />
        <View style={styles.securityText}>
          <Text style={styles.securityTitle}>Secure Payment</Text>
          <Text style={styles.securitySubtitle}>
            Your payment information is encrypted and secure. We never store your full card details.
          </Text>
        </View>
      </View>

      {/* Billing Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Address</Text>
        <View style={styles.billingAddress}>
          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>John Doe</Text>
            <Text style={styles.addressText}>123 Main Street</Text>
            <Text style={styles.addressText}>New York, NY 10001</Text>
            <Text style={styles.addressText}>United States</Text>
          </View>
          <TouchableOpacity style={styles.editAddressButton}>
            <FontAwesome name="edit" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: PADDING.content.vertical,
  },
  backButton: {
    padding: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: PADDING.content.vertical,
    lineHeight: 22,
  },
  section: {
    marginBottom: PADDING.content.vertical,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  methodSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  methodActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: "#10b981",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: GAPS.medium,
    paddingVertical: GAPS.small,
    marginRight: GAPS.small,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    color: "#fff",
    fontWeight: FONT_WEIGHTS.medium,
  },
  setDefaultButton: {
    backgroundColor: "#000",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: GAPS.medium,
    paddingVertical: GAPS.small,
    marginRight: GAPS.small,
  },
  setDefaultText: {
    fontSize: FONT_SIZES.xs,
    color: "#fff",
    fontWeight: FONT_WEIGHTS.medium,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    marginLeft: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#d1fae5",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  securityText: {
    marginLeft: GAPS.medium,
    flex: 1,
  },
  securityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  securitySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    lineHeight: 18,
  },
  billingAddress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginBottom: GAPS.small,
  },
  editAddressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
