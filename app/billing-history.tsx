import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function BillingHistoryScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const periods = [
    { id: "all", title: "All Time" },
    { id: "2024", title: "2024" },
    { id: "2023", title: "2023" },
    { id: "2022", title: "2022" }
  ];

  const billingHistory = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Silver Plan - Monthly",
      amount: 9.99,
      status: "paid",
      method: "Visa •••• 4242",
      invoiceId: "INV-2024-001"
    },
    {
      id: "2",
      date: "2023-12-15",
      description: "Silver Plan - Monthly",
      amount: 9.99,
      status: "paid",
      method: "Visa •••• 4242",
      invoiceId: "INV-2023-012"
    },
    {
      id: "3",
      date: "2023-11-15",
      description: "Silver Plan - Monthly",
      amount: 9.99,
      status: "paid",
      method: "Visa •••• 4242",
      invoiceId: "INV-2023-011"
    },
    {
      id: "4",
      date: "2023-10-15",
      description: "Free Plan",
      amount: 0.00,
      status: "paid",
      method: "N/A",
      invoiceId: "INV-2023-010"
    },
    {
      id: "5",
      date: "2023-09-15",
      description: "Gold Plan - Monthly",
      amount: 19.99,
      status: "failed",
      method: "Mastercard •••• 5555",
      invoiceId: "INV-2023-009"
    },
    {
      id: "6",
      date: "2023-08-15",
      description: "Gold Plan - Monthly",
      amount: 19.99,
      status: "paid",
      method: "Mastercard •••• 5555",
      invoiceId: "INV-2023-008"
    }
  ];

  const filteredHistory = selectedPeriod === "all" 
    ? billingHistory 
    : billingHistory.filter(item => item.date.startsWith(selectedPeriod));

  const totalAmount = filteredHistory
    .filter(item => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);

  const handleDownloadInvoice = (invoiceId: string) => {
    Alert.alert("Download Invoice", `Download invoice ${invoiceId}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Download", onPress: () => Alert.alert("Success", "Invoice downloaded successfully") }
    ]);
  };

  const handleRetryPayment = (invoiceId: string) => {
    Alert.alert("Retry Payment", `Retry payment for ${invoiceId}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Retry", onPress: () => Alert.alert("Success", "Payment retry initiated") }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#10b981";
      case "failed": return "#ff4444";
      case "pending": return "#f59e0b";
      default: return "#666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return "check-circle";
      case "failed": return "times-circle";
      case "pending": return "clock-o";
      default: return "question-circle";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Billing History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Spent</Text>
        <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
        <Text style={styles.summaryPeriod}>
          {selectedPeriod === "all" ? "All time" : `In ${selectedPeriod}`}
        </Text>
      </View>

      {/* Period Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodFilter}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.id && styles.periodTextActive
            ]}>
              {period.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Billing History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Billing History</Text>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="receipt" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No billing history</Text>
            <Text style={styles.emptySubtitle}>
              {selectedPeriod === "all" 
                ? "You haven't made any payments yet" 
                : `No payments found for ${selectedPeriod}`
              }
            </Text>
          </View>
        ) : (
          filteredHistory.map((item) => (
            <View key={item.id} style={styles.billingItem}>
              <View style={styles.billingLeft}>
                <View style={styles.billingIcon}>
                  <FontAwesome 
                    name={getStatusIcon(item.status)} 
                    size={20} 
                    color={getStatusColor(item.status)} 
                  />
                </View>
                <View style={styles.billingInfo}>
                  <Text style={styles.billingDescription}>{item.description}</Text>
                  <Text style={styles.billingDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.billingMethod}>{item.method}</Text>
                  <Text style={styles.billingInvoice}>Invoice: {item.invoiceId}</Text>
                </View>
              </View>
              <View style={styles.billingRight}>
                <Text style={[
                  styles.billingAmount,
                  { color: item.amount === 0 ? "#666" : "#000" }
                ]}>
                  {item.amount === 0 ? "Free" : `$${item.amount.toFixed(2)}`}
                </Text>
                <View style={styles.billingActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownloadInvoice(item.invoiceId)}
                  >
                    <FontAwesome name="download" size={14} color="#000" />
                  </TouchableOpacity>
                  {item.status === "failed" && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleRetryPayment(item.invoiceId)}
                    >
                      <FontAwesome name="refresh" size={14} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Export Options */}
      <View style={styles.exportSection}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <TouchableOpacity style={styles.exportButton}>
          <FontAwesome name="file-pdf-o" size={20} color="#000" />
          <Text style={styles.exportText}>Export as PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton}>
          <FontAwesome name="file-excel-o" size={20} color="#000" />
          <Text style={styles.exportText}>Export as CSV</Text>
        </TouchableOpacity>
      </View>
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
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: PADDING.content.vertical,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    marginBottom: GAPS.small,
  },
  summaryAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  summaryPeriod: {
    fontSize: FONT_SIZES.sm,
    color: "#999",
  },
  periodFilter: {
    marginBottom: PADDING.content.vertical,
  },
  periodButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical,
    marginRight: GAPS.small,
  },
  periodButtonActive: {
    backgroundColor: "#000",
  },
  periodText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    fontWeight: FONT_WEIGHTS.medium,
  },
  periodTextActive: {
    color: "#fff",
  },
  historySection: {
    marginBottom: PADDING.content.vertical,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#666",
    marginTop: GAPS.medium,
    marginBottom: GAPS.small,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: "#999",
    textAlign: "center",
  },
  billingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  billingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  billingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  billingInfo: {
    flex: 1,
  },
  billingDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  billingDate: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginBottom: GAPS.small,
  },
  billingMethod: {
    fontSize: FONT_SIZES.xs,
    color: "#999",
    marginBottom: GAPS.small,
  },
  billingInvoice: {
    fontSize: FONT_SIZES.xs,
    color: "#999",
  },
  billingRight: {
    alignItems: "flex-end",
  },
  billingAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: GAPS.small,
  },
  billingActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: GAPS.small,
  },
  exportSection: {
    marginBottom: PADDING.content.vertical,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  exportText: {
    fontSize: FONT_SIZES.md,
    color: "#000",
    marginLeft: GAPS.medium,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
