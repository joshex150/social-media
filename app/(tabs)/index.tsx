import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaStyle } from "@/hooks/useSafeAreaStyle";
import { useRouter } from "expo-router";
import ActivityCard from "@/components/ActivityCard";
import VibeCheck from "@/components/VibeCheck";
import RequestBanner from "@/components/RequestBanner";

export default function HomeScreen() {
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const safeArea = useSafeAreaStyle();
  const router = useRouter();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // Load upcoming activities
      const activitiesResponse = await fetch('/api/events?upcoming=true&limit=3');
      const activitiesData = await activitiesResponse.json();
      setUpcomingActivities(activitiesData.activities || []);

      // Load join requests
      const requestsResponse = await fetch('/api/events/requests');
      const requestsData = await requestsResponse.json();
      setJoinRequests(requestsData.requests || []);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/events/requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        Alert.alert('Success', `Request ${action}ed successfully!`);
        loadHomeData(); // Refresh data
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} request`);
    }
  };

  const handleVibeFeedback = async (vibe: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vibe', emotion: vibe }),
      });
    } catch (error) {
      console.error('Failed to submit vibe feedback:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, safeArea.content]}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Link Up</Text>
        <Text style={styles.subtitle}>Connect with people around you</Text>
      </View>

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Requests</Text>
          {joinRequests.map((request) => (
            <RequestBanner
              key={request.id}
              request={request}
              onAccept={() => handleJoinRequest(request.id, 'accept')}
              onReject={() => handleJoinRequest(request.id, 'reject')}
            />
          ))}
        </View>
      )}

      {/* Vibe Check */}
      <View style={styles.section}>
        <VibeCheck onFeedback={handleVibeFeedback} />
      </View>

      {/* Upcoming Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingActivities.length > 0 ? (
          upcomingActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onJoin={() => console.log('Join activity:', activity.id)}
              onView={() => router.push(`/activity/${activity.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No upcoming activities</Text>
            <Text style={styles.emptySubtitle}>Check out the Explore tab to find activities</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/create-activity')}
          >
            <Text style={styles.quickActionText}>Create Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seeAllText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
});
