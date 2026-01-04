import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  PADDING,
  MARGIN,
  GAPS,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";
import CustomAlert from "@/components/CustomAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export default function CreateActivityScreen() {
  const { colors } = useTheme();
  const errorHandler = useErrorHandler();
  const { isGuest } = useApi();
  const [formData, setFormData] = useState({
    title: "",
    category: "social",
    description: "",
    location: "",
    address: "",
    latitude: 9.0765, // Default Abuja coordinates
    longitude: 7.3986, // Default Abuja coordinates
    maxParticipants: 10,
    startDate: "",
    startTime: "",
    duration: 60,
    radius: 5,
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [{ text: "OK", onPress: () => {} }],
  });

  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { createActivity } = useApi();

  // Redirect guests to login
  React.useEffect(() => {
    if (isGuest) {
      router.replace("/login?from=create-activity");
    }
  }, [isGuest, router]);

  const categories = [
    { id: "social", name: "Social", icon: "users" },
    { id: "fitness", name: "Fitness", icon: "heart" },
    { id: "learning", name: "Learning", icon: "book" },
    { id: "food", name: "Food", icon: "cutlery" },
    { id: "travel", name: "Travel", icon: "plane" },
    { id: "music", name: "Music", icon: "music" },
    { id: "sports", name: "Sports", icon: "futbol-o" },
    { id: "tech", name: "Tech", icon: "laptop" },
  ];

  const radiusOptions = [1, 3, 5, 10, 15, 20, 30];
  const durationOptions = [30, 60, 90, 120, 180, 240];
  const maxParticipantsOptions = [5, 10, 15, 20, 25, 50];

  const popularTags = [
    "outdoor",
    "indoor",
    "free",
    "paid",
    "beginner",
    "intermediate",
    "advanced",
    "family-friendly",
    "pet-friendly",
    "wheelchair-accessible",
    "networking",
    "creative",
    "educational",
    "relaxing",
    "energetic",
    "cultural",
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }> = [{ text: "OK", onPress: () => {} }]
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location) {
      showAlert("Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO8601 format
      const combinedDateTime = `${formData.startDate}T${formData.startTime}:00.000Z`;

      const activityData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as
          | "social"
          | "fitness"
          | "learning"
          | "food"
          | "travel"
          | "music"
          | "sports"
          | "tech",
        location: {
          name: formData.location,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        date: combinedDateTime,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        radius: formData.radius,
        tags: selectedTags,
      };

      const result = await createActivity(activityData);

      if (result.success) {
        showAlert(
          "Success!",
          "Your activity has been created successfully!",
          "success",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        showAlert(
          "Error",
          result.error || "Failed to create activity",
          "error"
        );
      }
    } catch (error) {
      errorHandler.handleError(error, "Creating activity");
      showAlert(
        "Error",
        "Failed to create activity. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          safeArea.header,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            router.replace("/(tabs)");
          }}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Create Activity
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Activity Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={formData.title}
              onChangeText={(text) => handleInputChange("title", text)}
              placeholder="What's your activity about?"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Category *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    formData.category === category.id && [
                      styles.categoryButtonActive,
                      {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ],
                  ]}
                  onPress={() => handleInputChange("category", category.id)}
                >
                  <FontAwesome
                    name={category.icon as any}
                    size={16}
                    color={
                      formData.category === category.id
                        ? colors.background
                        : colors.muted
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.foreground },
                      formData.category === category.id && [
                        styles.categoryTextActive,
                        { color: colors.background },
                      ],
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Description *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Describe your activity in detail..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Location *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={formData.location}
              onChangeText={(text) => handleInputChange("location", text)}
              placeholder="Where will this take place?"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={formData.address}
              onChangeText={(text) => handleInputChange("address", text)}
              placeholder="Full address (optional)"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Date and Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Date *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={formData.startDate}
                onChangeText={(text) => handleInputChange("startDate", text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Time *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={formData.startTime}
                onChangeText={(text) => handleInputChange("startTime", text)}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          {/* Duration and Max Participants */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Duration (minutes)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionScroll}
              >
                {durationOptions.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      formData.duration === duration && [
                        styles.optionButtonActive,
                        {
                          backgroundColor: colors.accent,
                          borderColor: colors.accent,
                        },
                      ],
                    ]}
                    onPress={() => handleInputChange("duration", duration)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.foreground },
                        formData.duration === duration && [
                          styles.optionTextActive,
                          { color: colors.background },
                        ],
                      ]}
                    >
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Max Participants
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionScroll}
              >
                {maxParticipantsOptions.map((max) => (
                  <TouchableOpacity
                    key={max}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      formData.maxParticipants === max && [
                        styles.optionButtonActive,
                        {
                          backgroundColor: colors.accent,
                          borderColor: colors.accent,
                        },
                      ],
                    ]}
                    onPress={() => handleInputChange("maxParticipants", max)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.foreground },
                        formData.maxParticipants === max && [
                          styles.optionTextActive,
                          { color: colors.background },
                        ],
                      ]}
                    >
                      {max}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Search Radius */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Search Radius (km)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.radiusScroll}
            >
              {radiusOptions.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    formData.radius === radius && [
                      styles.radiusButtonActive,
                      {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ],
                  ]}
                  onPress={() => handleInputChange("radius", radius)}
                >
                  <Text
                    style={[
                      styles.radiusText,
                      { color: colors.foreground },
                      formData.radius === radius && [
                        styles.radiusTextActive,
                        { color: colors.background },
                      ],
                    ]}
                  >
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Tags (optional)
            </Text>
            <Text style={[styles.subLabel, { color: colors.muted }]}>
              Help others find your activity
            </Text>
            <View style={styles.tagsContainer}>
              {popularTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    selectedTags.includes(tag) && [
                      styles.tagActive,
                      {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ],
                  ]}
                  onPress={() => handleTagToggle(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: colors.foreground },
                      selectedTags.includes(tag) && [
                        styles.tagTextActive,
                        { color: colors.background },
                      ],
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.foreground },
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesome
                  name="spinner"
                  size={20}
                  color={colors.background}
                />
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: colors.background },
                  ]}
                >
                  Creating...
                </Text>
              </>
            ) : (
              <>
                <FontAwesome name="plus" size={20} color={colors.background} />
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: colors.background },
                  ]}
                >
                  Create Activity
                </Text>
              </>
            )}
          </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: PADDING.content.horizontal,
    paddingTop: 130, // Account for fixed header + safe area + extra spacing
    paddingBottom: PADDING.content.vertical,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.content.vertical,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 44,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    marginLeft: GAPS.small,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  placeholder: {
    width: 60,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: PADDING.content.vertical,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: GAPS.small,
  },
  subLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: GAPS.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical + 4,
    fontSize: FONT_SIZES.md,
    minHeight: 56,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.input.horizontal,
    paddingVertical: PADDING.input.vertical + 4,
    fontSize: FONT_SIZES.md,
    height: 140,
    textAlignVertical: "top",
  },
  categoryScroll: {
    marginBottom: GAPS.small,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 4,
    marginRight: GAPS.small,
    minHeight: 42,
  },
  categoryButtonActive: {
    // Active state handled by theme colors
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    marginLeft: GAPS.small,
    fontWeight: FONT_WEIGHTS.medium,
  },
  categoryTextActive: {
    // Active state handled by theme colors
  },
  optionScroll: {
    marginBottom: GAPS.small,
  },
  optionButton: {
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 4,
    marginRight: GAPS.small,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonActive: {
    // Active state handled by theme colors
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  optionTextActive: {
    // Active state handled by theme colors
  },
  radiusScroll: {
    marginBottom: GAPS.small,
  },
  radiusButton: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 4,
    marginRight: GAPS.small,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusButtonActive: {
    // Active state handled by theme colors
  },
  radiusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  radiusTextActive: {
    // Active state handled by theme colors
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical + 2,
    marginRight: GAPS.small,
    marginBottom: GAPS.small,
    borderWidth: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tagActive: {
    // Active state handled by theme colors
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  tagTextActive: {
    // Active state handled by theme colors
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: PADDING.button.vertical + 8,
    marginTop: PADDING.content.vertical,
    minHeight: 56,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: GAPS.small,
  },
});
