import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaStyle } from '@/hooks/useSafeAreaStyle';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '@/contexts/ApiContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import CustomAlert from '@/components/CustomAlert';
import { activitiesAPI } from '@/services/api';
import { getAuthToken } from '@/services/api';
import type { Activity } from '@/services/api';
import {
  PADDING,
  MARGIN,
  GAPS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from '@/constants/spacing';

interface JoinRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function ManageActivityScreen() {
  const { colors } = useTheme();
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, loadActivities } = useApi();
  const { alert, showAlert, hideAlert } = useCustomAlert();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'participants' | 'edit' | 'settings'>('requests');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    maxParticipants: 10,
    duration: 60,
  });

  // Load activity data
  useEffect(() => {
    loadActivityData();
  }, [id]);

  const loadActivityData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        showAlert('Error', 'Please log in to manage activities', 'error');
        router.back();
        return;
      }

      const response = await activitiesAPI.getActivity(id as string, token);
      
      if (response.success && response.data?.activity) {
        const activityData = response.data.activity;
        setActivity(activityData);
        
        // Extract pending join requests
        const pendingRequests = (activityData.joinRequests || [])
          .filter((req: JoinRequest) => req.status === 'pending')
          .map((req: JoinRequest) => ({
            ...req,
            user: req.user || { _id: '', name: 'Unknown User' }
          }));
        setJoinRequests(pendingRequests);
        
        // Set edit form
        setEditForm({
          title: activityData.title,
          description: activityData.description,
          maxParticipants: activityData.maxParticipants,
          duration: activityData.duration,
        });
      } else {
        showAlert('Error', 'Activity not found', 'error');
        router.back();
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      showAlert('Error', 'Failed to load activity', 'error');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Check if user is the creator
  const isCreator = activity?.createdBy?._id === user?.id;

  // Handle join request response
  const handleJoinRequest = async (requestId: string, action: 'accept' | 'reject') => {
    if (!isCreator) {
      showAlert('Error', 'Only the activity creator can manage join requests', 'error');
      return;
    }

    try {
      setProcessing(true);
      const token = await getAuthToken();
      if (!token) {
        showAlert('Error', 'Please log in', 'error');
        return;
      }

      const response = await activitiesAPI.respondToJoinRequest(requestId, action, token);
      
      if (response.success) {
        showAlert(
          'Success',
          `Join request ${action}ed successfully`,
          'success'
        );
        // Reload activity data
        await loadActivityData();
        // Reload activities list
        if (loadActivities) {
          await loadActivities();
        }
      } else {
        showAlert('Error', response.message || 'Failed to process request', 'error');
      }
    } catch (error) {
      console.error('Error processing join request:', error);
      showAlert('Error', 'Failed to process request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Handle remove participant
  const handleRemoveParticipant = async (participantId: string) => {
    if (!isCreator) {
      showAlert('Error', 'Only the activity creator can remove participants', 'error');
      return;
    }

    if (participantId === activity?.createdBy?._id) {
      showAlert('Error', 'Cannot remove the activity creator', 'error');
      return;
    }

    showAlert(
      'Remove Participant',
      'Are you sure you want to remove this participant?',
      'warning',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              // Note: This would require a backend endpoint to remove participants
              // For now, we'll show an alert
              showAlert('Info', 'Participant removal feature coming soon', 'info');
            } catch (error) {
              console.error('Error removing participant:', error);
              showAlert('Error', 'Failed to remove participant', 'error');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Handle update activity
  const handleUpdateActivity = async () => {
    if (!isCreator) {
      showAlert('Error', 'Only the activity creator can edit the activity', 'error');
      return;
    }

    if (!activity) return;

    try {
      setProcessing(true);
      const token = await getAuthToken();
      if (!token) {
        showAlert('Error', 'Please log in', 'error');
        return;
      }

      const updateData = {
        title: editForm.title,
        description: editForm.description,
        maxParticipants: editForm.maxParticipants,
        duration: editForm.duration,
      };

      const response = await activitiesAPI.updateActivity(activity._id, updateData, token);
      
      if (response.success) {
        showAlert('Success', 'Activity updated successfully', 'success');
        await loadActivityData();
        if (loadActivities) {
          await loadActivities();
        }
        setActiveTab('requests');
      } else {
        showAlert('Error', response.message || 'Failed to update activity', 'error');
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      showAlert('Error', 'Failed to update activity', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete activity
  const handleDeleteActivity = () => {
    if (!isCreator) {
      showAlert('Error', 'Only the activity creator can delete the activity', 'error');
      return;
    }

    showAlert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      'warning',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const token = await getAuthToken();
              if (!token) {
                showAlert('Error', 'Please log in', 'error');
                return;
              }

              const response = await activitiesAPI.deleteActivity(activity!._id, token);
              
              if (response.success) {
                showAlert('Success', 'Activity deleted successfully', 'success');
                if (loadActivities) {
                  await loadActivities();
                }
                router.back();
              } else {
                showAlert('Error', response.message || 'Failed to delete activity', 'error');
              }
            } catch (error) {
              console.error('Error deleting activity:', error);
              showAlert('Error', 'Failed to delete activity', 'error');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.foreground} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading activity...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <FontAwesome name="exclamation-triangle" size={48} color={colors.muted} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Activity not found</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.foreground }]} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.background }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isCreator) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <FontAwesome name="lock" size={48} color={colors.muted} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>Access Denied</Text>
        <Text style={[styles.errorSubtitle, { color: colors.muted }]}>
          Only the activity creator can manage this activity
        </Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.foreground }]} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.background }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, safeArea.content, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          Manage Activity
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Activity Info Banner */}
      <View style={[styles.banner, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.bannerTitle, { color: colors.foreground }]}>{activity.title}</Text>
        <Text style={[styles.bannerSubtitle, { color: colors.muted }]}>
          {formatDate(activity.date)} • {formatTime(activity.date)}
        </Text>
        <Text style={[styles.bannerSubtitle, { color: colors.muted }]}>
          {activity.location.name}
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab, { borderBottomColor: colors.foreground }]}
          onPress={() => setActiveTab('requests')}
        >
          <FontAwesome 
            name="bell" 
            size={16} 
            color={activeTab === 'requests' ? colors.foreground : colors.muted} 
          />
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'requests' ? colors.foreground : colors.muted }
          ]}>
            Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'participants' && styles.activeTab, { borderBottomColor: colors.foreground }]}
          onPress={() => setActiveTab('participants')}
        >
          <FontAwesome 
            name="users" 
            size={16} 
            color={activeTab === 'participants' ? colors.foreground : colors.muted} 
          />
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'participants' ? colors.foreground : colors.muted }
          ]}>
            Participants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'edit' && styles.activeTab, { borderBottomColor: colors.foreground }]}
          onPress={() => setActiveTab('edit')}
        >
          <FontAwesome 
            name="edit" 
            size={16} 
            color={activeTab === 'edit' ? colors.foreground : colors.muted} 
          />
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'edit' ? colors.foreground : colors.muted }
          ]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab, { borderBottomColor: colors.foreground }]}
          onPress={() => setActiveTab('settings')}
        >
          <FontAwesome 
            name="cog" 
            size={16} 
            color={activeTab === 'settings' ? colors.foreground : colors.muted} 
          />
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'settings' ? colors.foreground : colors.muted }
          ]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.tabContent} 
        contentContainerStyle={styles.tabContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'requests' && (
          <View>
            {joinRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome name="check-circle" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No Pending Requests
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  All join requests have been processed
                </Text>
              </View>
            ) : (
              joinRequests.map((request) => (
                <View 
                  key={request._id} 
                  style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestUserInfo}>
                      <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                        <FontAwesome name="user" size={20} color={colors.foreground} />
                      </View>
                      <View style={styles.requestUserDetails}>
                        <Text style={[styles.requestUserName, { color: colors.foreground }]}>
                          {request.user?.name || 'Unknown User'}
                        </Text>
                        <Text style={[styles.requestTime, { color: colors.muted }]}>
                          {new Date(request.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {request.message && (
                    <Text style={[styles.requestMessage, { color: colors.muted }]}>
                      {request.message}
                    </Text>
                  )}
                  
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.rejectButton, { borderColor: colors.foreground }]}
                      onPress={() => handleJoinRequest(request._id, 'reject')}
                      disabled={processing}
                    >
                      <Text style={[styles.requestButtonText, { color: colors.foreground }]}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.acceptButton, { backgroundColor: colors.foreground }]}
                      onPress={() => handleJoinRequest(request._id, 'accept')}
                      disabled={processing}
                    >
                      <Text style={[styles.requestButtonText, { color: colors.background }]}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'participants' && (
          <View>
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoTitle, { color: colors.foreground }]}>
                Participants ({activity.participants.length}/{activity.maxParticipants})
              </Text>
            </View>
            
            {activity.participants.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome name="users" size={48} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No Participants
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  No one has joined this activity yet
                </Text>
              </View>
            ) : (
              activity.participants.map((participant) => {
                const isActivityCreator = participant.id === activity.createdBy?._id;
                return (
                  <View 
                    key={participant.id} 
                    style={[styles.participantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.participantInfo}>
                      <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                        <FontAwesome name="user" size={20} color={colors.foreground} />
                      </View>
                      <View style={styles.participantDetails}>
                        <Text style={[styles.participantName, { color: colors.foreground }]}>
                          {participant.name}
                          {isActivityCreator && (
                            <Text style={[styles.creatorBadge, { color: colors.muted }]}> (Creator)</Text>
                          )}
                        </Text>
                      </View>
                    </View>
                    {!isActivityCreator && (
                      <TouchableOpacity
                        style={[styles.removeButton, { borderColor: colors.error }]}
                        onPress={() => handleRemoveParticipant(participant.id)}
                        disabled={processing}
                      >
                        <FontAwesome name="times" size={14} color={colors.error} />
                        <Text style={[styles.removeButtonText, { color: colors.error }]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'edit' && (
          <View>
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoTitle, { color: colors.foreground }]}>Edit Activity</Text>
              <Text style={[styles.infoSubtitle, { color: colors.muted }]}>
                Update your activity details
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={editForm.title}
                onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                placeholder="Activity title"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={editForm.description}
                onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                placeholder="Activity description"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Max Participants</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  value={editForm.maxParticipants.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    if (num > 0 && num <= 100) {
                      setEditForm({ ...editForm, maxParticipants: num });
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={[styles.label, { color: colors.foreground }]}>Duration (minutes)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  value={editForm.duration.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    if (num > 0 && num <= 480) {
                      setEditForm({ ...editForm, duration: num });
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="60"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.foreground }]}
              onPress={handleUpdateActivity}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <FontAwesome name="save" size={16} color={colors.background} />
                  <Text style={[styles.saveButtonText, { color: colors.background }]}>
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'settings' && (
          <View>
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.infoTitle, { color: colors.foreground }]}>Activity Settings</Text>
              <Text style={[styles.infoSubtitle, { color: colors.muted }]}>
                Manage your activity settings
              </Text>
            </View>

            <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>Status</Text>
                  <Text style={[styles.settingValue, { color: colors.muted }]}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>Visibility</Text>
                  <Text style={[styles.settingValue, { color: colors.muted }]}>
                    {activity.isPublic ? 'Public' : 'Private'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>Chat</Text>
                  <Text style={[styles.settingValue, { color: colors.muted }]}>
                    {activity.chatEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleDeleteActivity}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <FontAwesome name="trash" size={16} color={colors.background} />
                  <Text style={[styles.deleteButtonText, { color: colors.background }]}>
                    Delete Activity
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    marginTop: MARGIN.component.top,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: MARGIN.component.top,
    marginBottom: MARGIN.card.bottom,
  },
  errorSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: MARGIN.section.bottom,
    paddingHorizontal: PADDING.content.horizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.header.horizontal,
    paddingVertical: PADDING.header.vertical,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    flex: 1,
    marginHorizontal: MARGIN.card.bottom,
  },
  headerSpacer: {
    width: 32,
  },
  banner: {
    padding: PADDING.card.horizontal,
    borderBottomWidth: 1,
  },
  bannerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: MARGIN.text.bottom,
  },
  bannerSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: MARGIN.text.top,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.content.vertical,
    paddingHorizontal: SPACING.xs,
    gap: GAPS.small,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    padding: PADDING.card.horizontal,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: MARGIN.component.top,
    marginBottom: MARGIN.text.bottom,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  requestCard: {
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: MARGIN.component.bottom,
    borderWidth: 1,
  },
  requestHeader: {
    marginBottom: MARGIN.card.bottom,
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: MARGIN.card.bottom,
  },
  requestUserDetails: {
    flex: 1,
  },
  requestUserName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  requestTime: {
    fontSize: FONT_SIZES.xs,
    marginTop: MARGIN.text.bottom / 2,
  },
  requestMessage: {
    fontSize: FONT_SIZES.sm,
    marginBottom: MARGIN.card.bottom,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    gap: GAPS.small,
    marginTop: MARGIN.card.bottom,
  },
  requestButton: {
    flex: 1,
    paddingVertical: PADDING.content.vertical,
    borderRadius: BORDER_RADIUS.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    borderWidth: 1,
  },
  acceptButton: {
    // backgroundColor handled by theme
  },
  requestButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  infoCard: {
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: MARGIN.component.bottom,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: MARGIN.text.bottom,
  },
  infoSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: MARGIN.card.bottom,
    borderWidth: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  creatorBadge: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: PADDING.content.vertical,
    borderRadius: BORDER_RADIUS.small,
    borderWidth: 1,
    gap: GAPS.small,
  },
  removeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  formGroup: {
    marginBottom: MARGIN.component.bottom,
  },
  formRow: {
    flexDirection: 'row',
    gap: GAPS.medium,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: MARGIN.text.bottom,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.small,
    padding: PADDING.input.horizontal,
    fontSize: FONT_SIZES.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.small,
    padding: PADDING.input.horizontal,
    fontSize: FONT_SIZES.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.card.vertical,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: MARGIN.component.bottom,
    gap: GAPS.small,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  settingCard: {
    borderRadius: BORDER_RADIUS.medium,
    padding: PADDING.card.horizontal,
    marginBottom: MARGIN.card.bottom,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: MARGIN.text.bottom / 2,
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.card.vertical,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: MARGIN.section.bottom,
    gap: GAPS.small,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

