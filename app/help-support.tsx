import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  const categories = [
    { id: "all", title: "All Topics", icon: "list" },
    { id: "getting-started", title: "Getting Started", icon: "play-circle" },
    { id: "activities", title: "Activities", icon: "calendar" },
    { id: "account", title: "Account", icon: "user" },
    { id: "billing", title: "Billing", icon: "credit-card" },
    { id: "technical", title: "Technical", icon: "cog" }
  ];

  const faqItems = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I create my first activity?",
      answer: "To create an activity, tap the plus (+) button in the center of the bottom navigation, fill in the activity details, and tap 'Create Activity'."
    },
    {
      id: 2,
      category: "activities",
      question: "How do I join an activity?",
      answer: "Browse activities on the home screen or map, tap on an activity you're interested in, and tap 'Join Activity' to send a request."
    },
    {
      id: 3,
      category: "activities",
      question: "Can I cancel my activity participation?",
      answer: "Yes, you can leave an activity at any time by going to the activity details and tapping 'Leave Activity'."
    },
    {
      id: 4,
      category: "account",
      question: "How do I update my profile?",
      answer: "Go to the Profile tab, tap on your profile picture, and you can update your name, email, and other details."
    },
    {
      id: 5,
      category: "billing",
      question: "How do I upgrade my subscription?",
      answer: "Go to Profile > Subscription & Billing, choose your desired plan, and follow the payment process."
    },
    {
      id: 6,
      category: "technical",
      question: "The app is not loading properly. What should I do?",
      answer: "Try closing and reopening the app, check your internet connection, or restart your device. If the problem persists, contact support."
    },
    {
      id: 7,
      category: "technical",
      question: "How do I enable location services?",
      answer: "Go to your device Settings > Privacy & Security > Location Services, find Link Up, and enable location access."
    },
    {
      id: 8,
      category: "getting-started",
      question: "What is the difference between free and paid plans?",
      answer: "Free plans have limited activities per month, while paid plans offer unlimited activities and additional features like priority support."
    }
  ];

  const contactMethods = [
    {
      id: "email",
      title: "Email Support",
      subtitle: "Get help via email within 24 hours",
      icon: "envelope",
      action: () => Alert.alert("Email Support", "Send us an email at support@linkup.app")
    },
    {
      id: "chat",
      title: "Live Chat",
      subtitle: "Chat with our support team",
      icon: "comment",
      action: () => Alert.alert("Live Chat", "Live chat is available 9 AM - 6 PM EST")
    },
    {
      id: "phone",
      title: "Phone Support",
      subtitle: "Call us for immediate assistance",
      icon: "phone",
      action: () => Alert.alert("Phone Support", "Call us at +1 (555) 123-4567")
    }
  ];

  const filteredFaqs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help topics..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <FontAwesome 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? "#fff" : "#666"} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="book" size={24} color="#000" />
            <Text style={styles.actionText}>User Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="video-camera" size={24} color="#000" />
            <Text style={styles.actionText}>Tutorials</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="bug" size={24} color="#000" />
            <Text style={styles.actionText}>Report Bug</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="lightbulb-o" size={24} color="#000" />
            <Text style={styles.actionText}>Suggestions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFaqs.map((item) => (
          <TouchableOpacity key={item.id} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Support */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        {contactMethods.map((method) => (
          <TouchableOpacity key={method.id} style={styles.contactItem} onPress={method.action}>
            <View style={styles.contactLeft}>
              <View style={styles.contactIcon}>
                <FontAwesome name={method.icon as any} size={20} color="#000" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Link Up v1.0.0</Text>
        <Text style={styles.versionSubtext}>Last updated: January 2024</Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    marginBottom: PADDING.content.vertical,
  },
  searchIcon: {
    marginRight: GAPS.small,
  },
  searchInput: {
    flex: 1,
    paddingVertical: PADDING.input.vertical,
    fontSize: FONT_SIZES.md,
    color: "#000",
  },
  categoriesContainer: {
    marginBottom: PADDING.content.vertical,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical,
    marginRight: GAPS.small,
  },
  categoryButtonActive: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginLeft: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  categoryTextActive: {
    color: "#fff",
  },
  quickActions: {
    marginBottom: PADDING.content.vertical,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginBottom: GAPS.small,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: "#000",
    marginTop: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  faqSection: {
    marginBottom: PADDING.content.vertical,
  },
  faqItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  faqQuestion: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: PADDING.content.vertical,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: GAPS.small,
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: GAPS.medium,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.small,
  },
  contactSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
  },
  versionInfo: {
    alignItems: "center",
    paddingVertical: PADDING.content.vertical,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: "#999",
    fontWeight: FONT_WEIGHTS.medium,
  },
  versionSubtext: {
    fontSize: FONT_SIZES.xs,
    color: "#ccc",
    marginTop: GAPS.small,
  },
});
