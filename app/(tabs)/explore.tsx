import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import ActivityCard from "@/components/ActivityCard";
import VibeCheck from "@/components/VibeCheck";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  useEffect(() => {
    loadActivities();
  }, [radius]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?radius=${radius}&lat=40.7128&lng=-74.006`);
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (activityId: string) => {
    try {
      const response = await fetch(`/api/events/${activityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          userId: 'user_123',
          userName: 'John Doe',
          message: 'Would love to join!',
        }),
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Join request sent!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send join request');
    }
  };

  const handleView = (activityId: string) => {
    router.push(`/activity/${activityId}`);
  };

  const handleVibeFeedback = async (vibe: string) => {
    console.log('Vibe feedback:', vibe);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No activities nearby</Text>
      <Text style={styles.emptySubtitle}>Create your first activity</Text>
    </View>
  );

  return (
    <View style={[styles.container, safeArea.content]}>
      <View style={[styles.header]}>
        <Text style={styles.title}>Discover Activities</Text>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by radius</Text>
          <View style={styles.radiusButtons}>
            {[5, 10, 20].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusButton, radius === r && styles.radiusButtonActive]}
                onPress={() => setRadius(r)}
              >
                <Text style={[styles.radiusButtonText, radius === r && styles.radiusButtonTextActive]}>
                  {r}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <VibeCheck onFeedback={handleVibeFeedback} />

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onJoin={handleJoin}
            onView={handleView}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: "row",
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  radiusButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  radiusButtonTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
