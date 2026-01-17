import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ActivityCard from "@/components/ActivityCard";
import VibeCheck from "@/components/VibeCheck";
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from "@/constants/spacing";
import { useApi } from "@/contexts/ApiContext";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import type { Activity } from "@/services/api";

const RADIUS_OPTIONS = [5, 10, 20];
const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'th' },
  { id: 'social', name: 'Social', icon: 'users' },
  { id: 'fitness', name: 'Fitness', icon: 'heart' },
  { id: 'learning', name: 'Learning', icon: 'book' },
  { id: 'food', name: 'Food', icon: 'cutlery' },
  { id: 'travel', name: 'Travel', icon: 'plane' },
  { id: 'music', name: 'Music', icon: 'music' },
  { id: 'sports', name: 'Sports', icon: 'futbol-o' },
  { id: 'tech', name: 'Tech', icon: 'laptop' }
];

export default function ExploreScreen() {
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [vibeFeedback, setVibeFeedback] = useState<string | null>(null);

  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { user, activities, loadActivities, refreshData, joinActivity, leaveActivity } = useApi();
  const { alert, showAlert, hideAlert } = useCustomAlert();

  // Filter activities when they change
  const loadActivitiesData = async () => {
    filterActivities(activities, selectedRadius, selectedCategory);
  };

  const filterActivities = (activitiesList: Activity[], radius: number, category: string) => {
    let filtered = activitiesList.filter(activity => activity.radius <= radius);
    
    if (category !== 'all') {
      filtered = filtered.filter(activity => activity.category === category);
    }
    
    setFilteredActivities(filtered);
  };

  useEffect(() => {
    loadActivitiesData();
  }, []);

  useEffect(() => {
    filterActivities(activities, selectedRadius, selectedCategory);
  }, [activities, selectedRadius, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    filterActivities(activities, radius, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterActivities(activities, selectedRadius, category);
  };

  const handleJoinActivity = async (activityId: string) => {
    try {
      const result = await joinActivity(activityId);
      if (result.success) {
        showAlert('Success', 'You have joined the activity!', 'success');
        await refreshData();
      } else {
        showAlert('Error', result.error || 'Failed to join activity', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Failed to join activity', 'error');
    }
  };

  const handleLeaveActivity = async (activityId: string) => {
    try {
      const result = await leaveActivity(activityId);
      if (result.success) {
        showAlert('Success', 'You have left the activity', 'success');
        await refreshData();
      } else {
        showAlert('Error', result.error || 'Failed to leave activity', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Failed to leave activity', 'error');
    }
  };

  const handleViewActivity = (activityId: string) => {
    router.push(`/activity/${activityId}`);
  };

  const handleVibeFeedback = async (vibe: string) => {
    setVibeFeedback(vibe);
    showAlert('Thank you!', 'Your feedback has been recorded.', 'success');
  };

  return (
    <ScrollView 
      style={[styles.container]} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={[styles.header, safeArea.header]}>
        <Text style={styles.title}>Explore Activities</Text>
        <TouchableOpacity style={styles.filterButton}>
          <FontAwesome name="filter" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Vibe Check */}
      <VibeCheck onFeedback={handleVibeFeedback} />

      {/* Radius Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Search Radius</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.radiusFilter}>
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusButton,
                selectedRadius === radius && styles.radiusButtonActive
              ]}
              onPress={() => handleRadiusChange(radius)}
            >
              <Text style={[
                styles.radiusText,
                selectedRadius === radius && styles.radiusTextActive
              ]}>
                {radius}km
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryChange(category.id)}
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
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredActivities.length} activities found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <FontAwesome name="sort" size={16} color="#666" />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              currentUserId={user?.id}
              onJoin={() => handleJoinActivity(activity._id)}
              onLeave={() => handleLeaveActivity(activity._id)}
              onView={() => handleViewActivity(activity._id)}
              onManage={(activityId: string) => router.push(`/activity/${activityId}/manage`)}
            />
          ))
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="search" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No activities found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your radius or category filters
          </Text>
          <TouchableOpacity 
            style={styles.emptyActionButton}
            onPress={() => {
              setSelectedRadius(20);
              setSelectedCategory('all');
              filterActivities(activities, 20, 'all');
            }}
          >
            <Text style={styles.emptyActionText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Activity CTA */}
      <View style={styles.createCta}>
        <Text style={styles.createCtaTitle}>Don't see what you're looking for?</Text>
        <Text style={styles.createCtaSubtitle}>Create your own activity and invite others to join!</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/create-activity')}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Activity</Text>
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
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: "#000",
  },
  filterButton: {
    padding: GAPS.small,
  },
  filterSection: {
    marginBottom: PADDING.content.vertical,
  },
  filterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: "#000",
    marginBottom: GAPS.medium,
  },
  radiusFilter: {
    marginBottom: GAPS.small,
  },
  radiusButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.buttonSmall.vertical,
    marginRight: GAPS.small,
  },
  radiusButtonActive: {
    backgroundColor: "#000",
  },
  radiusText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    fontWeight: FONT_WEIGHTS.medium,
  },
  radiusTextActive: {
    color: "#fff",
  },
  categoryFilter: {
    marginBottom: GAPS.small,
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
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: GAPS.small,
  },
  categoryTextActive: {
    color: "#fff",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: GAPS.medium,
  },
  resultsCount: {
    fontSize: FONT_SIZES.md,
    color: "#666",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: GAPS.small,
  },
  sortText: {
    fontSize: FONT_SIZES.sm,
    color: "#666",
    marginLeft: GAPS.small,
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
    marginBottom: GAPS.large,
  },
  emptyActionButton: {
    backgroundColor: "#000",
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.button.vertical,
    borderRadius: BORDER_RADIUS.medium,
  },
  emptyActionText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  createCta: {
    backgroundColor: "#f8f9fa",
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    alignItems: "center",
    marginTop: PADDING.content.vertical,
  },
  createCtaTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: "#000",
    marginBottom: GAPS.small,
  },
  createCtaSubtitle: {
    fontSize: FONT_SIZES.md,
    color: "#666",
    textAlign: "center",
    marginBottom: GAPS.large,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: PADDING.button.horizontal,
    paddingVertical: PADDING.button.vertical,
    borderRadius: BORDER_RADIUS.medium,
  },
  createButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: GAPS.small,
  },
});