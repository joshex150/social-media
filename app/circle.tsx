import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaStyle } from '@/hooks/useSafeAreaStyle';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApi } from '@/contexts/ApiContext';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import CustomAlert from '@/components/CustomAlert';
import { PADDING, MARGIN, GAPS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SPACING } from '@/constants/spacing';
import { circleAPI } from '@/services/api';
import { getAuthToken } from '@/services/api';

interface Connection {
  _id: string;
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export default function CircleScreen() {
  const { colors } = useTheme();
  const safeArea = useSafeAreaStyle();
  const router = useRouter();
  const { user } = useApi();
  const { alert, showAlert, hideAlert } = useCustomAlert();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [innerCircle, setInnerCircle] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'inner'>('all');

  useEffect(() => {
    loadCircle();
  }, []);

  const loadCircle = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        showAlert('Error', 'Please log in to view your circle', 'error');
        router.back();
        return;
      }

      const response = await circleAPI.getCircle(token);
      
      if (response.success && response.data) {
        setConnections(response.data.connections || []);
        setInnerCircle(response.data.innerCircle || []);
      } else {
        showAlert('Error', response.message || 'Failed to load circle', 'error');
      }
    } catch (error) {
      console.error('Error loading circle:', error);
      showAlert('Error', 'Failed to load circle', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInnerCircle = async (userId: string, isInInnerCircle: boolean) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        showAlert('Error', 'Please log in', 'error');
        return;
      }

      let response;
      if (isInInnerCircle) {
        response = await circleAPI.removeFromInnerCircle(userId, token);
      } else {
        response = await circleAPI.addToInnerCircle(userId, token);
      }

      if (response.success) {
        await loadCircle();
        showAlert(
          'Success',
          isInInnerCircle 
            ? 'Removed from Inner Circle' 
            : 'Added to Inner Circle',
          'success'
        );
      } else {
        showAlert('Error', response.message || 'Failed to update Inner Circle', 'error');
      }
    } catch (error) {
      console.error('Error updating inner circle:', error);
      showAlert('Error', 'Failed to update Inner Circle', 'error');
    }
  };

  const displayConnections = activeTab === 'inner' ? innerCircle : connections;
  const isInnerCircleEmpty = innerCircle.length === 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, safeArea.content, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.foreground} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading circle...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, safeArea.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>My Circle</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && [styles.activeTab, { borderBottomColor: colors.foreground }]]}
          onPress={() => setActiveTab('all')}
        >
          <FontAwesome name="users" size={18} color={activeTab === 'all' ? colors.foreground : colors.muted} />
          <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.foreground : colors.muted }]}>
            All ({connections.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inner' && [styles.activeTab, { borderBottomColor: colors.foreground }]]}
          onPress={() => setActiveTab('inner')}
        >
          <FontAwesome name="star" size={18} color={activeTab === 'inner' ? colors.foreground : colors.muted} />
          <Text style={[styles.tabText, { color: activeTab === 'inner' ? colors.foreground : colors.muted }]}>
            Inner Circle ({innerCircle.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'inner' && isInnerCircleEmpty && (
          <View style={styles.emptyState}>
            <FontAwesome name="star-o" size={64} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Inner Circle Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Add close friends to your Inner Circle. They'll be notified if you send a Hot Alert during an event.
            </Text>
          </View>
        )}

        {activeTab === 'all' && connections.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={64} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Connections Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              Start connecting with people by joining activities!
            </Text>
          </View>
        )}

        {displayConnections.map((connection) => {
          const isInInnerCircle = innerCircle.some(ic => ic._id === connection._id || ic.id === connection.id);
          
          return (
            <View 
              key={connection._id || connection.id} 
              style={[styles.connectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.connectionInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                  {connection.avatar ? (
                    <Text style={styles.avatarText}>{connection.name.charAt(0).toUpperCase()}</Text>
                  ) : (
                    <FontAwesome name="user" size={24} color={colors.foreground} />
                  )}
                </View>
                <View style={styles.connectionDetails}>
                  <Text style={[styles.connectionName, { color: colors.foreground }]}>
                    {connection.name}
                  </Text>
                  <Text style={[styles.connectionEmail, { color: colors.muted }]}>
                    {connection.email}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.innerCircleButton,
                  isInInnerCircle 
                    ? { backgroundColor: colors.accent } 
                    : { backgroundColor: colors.border }
                ]}
                onPress={() => handleToggleInnerCircle(connection._id || connection.id, isInInnerCircle)}
              >
                <FontAwesome 
                  name={isInInnerCircle ? "star" : "star-o"} 
                  size={18} 
                  color={isInInnerCircle ? colors.background : colors.foreground} 
                />
                <Text 
                  style={[
                    styles.innerCircleButtonText,
                    { color: isInInnerCircle ? colors.background : colors.foreground }
                  ]}
                >
                  {isInInnerCircle ? 'Inner' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
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
    paddingHorizontal: PADDING.content.horizontal,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    marginTop: MARGIN.section.top,
  },
  headerContainer: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING.content.horizontal,
    paddingVertical: PADDING.header.vertical,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    flex: 1,
    marginHorizontal: MARGIN.section.top,
  },
  headerSpacer: {
    width: 40,
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
    paddingVertical: PADDING.header.vertical + 2,
    paddingHorizontal: PADDING.content.horizontal,
    gap: GAPS.small,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: PADDING.content.horizontal,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PADDING.content.vertical * 3,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: MARGIN.section.top,
    marginBottom: MARGIN.text.bottom,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    paddingHorizontal: PADDING.content.horizontal,
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.large,
    padding: PADDING.card.horizontal,
    marginBottom: MARGIN.text.bottom + 4,
    borderWidth: 1,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: GAPS.medium,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  connectionDetails: {
    flex: 1,
  },
  connectionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs / 2,
  },
  connectionEmail: {
    fontSize: FONT_SIZES.sm,
  },
  innerCircleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PADDING.buttonSmall.vertical,
    paddingHorizontal: PADDING.button.horizontal,
    borderRadius: BORDER_RADIUS.medium,
    gap: GAPS.small,
  },
  innerCircleButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
