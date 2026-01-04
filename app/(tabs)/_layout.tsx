// app/(tabs)/_layout.tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApi } from "@/contexts/ApiContext";
import { useTheme } from "@/contexts/ThemeContext";

// Import each screen statically
import HomeScreen from "./index";
import ProfileScreen from "./profile";
import ChatScreen from "./chat";
import MapScreen from "./map";

const { width: screenWidth } = Dimensions.get('window');

const screens = [
  {
    name: "map",
    title: "Map",
    icon: "map-pin",
    component: MapScreen,
  },
  { name: "index", title: "Home", icon: "home", component: HomeScreen },
  {
    name: "create",
    title: "Create",
    icon: "plus",
    component: null, // This will be handled specially
  },
  { name: "chat", title: "Chat", icon: "comment", component: ChatScreen },
  { name: "profile", title: "Profile", icon: "user", component: ProfileScreen },
];

// Filter screens based on authentication status
const getAvailableScreens = (isAuthenticated: boolean, isGuest: boolean) => {
  if (isGuest && !isAuthenticated) {
    // Guests can only see map, home, create, and chat
    return screens.filter(screen => 
      screen.name !== "profile"
    );
  }
  return screens;
};

function CustomTabBar({ currentIndex, onTabPress, insets, availableScreens }: any) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {availableScreens.map((screen: any, index: number) => {
        // Adjust currentIndex for the create tab since it's not in the view
        const adjustedIndex = screen.name === "create" ? -1 : 
          availableScreens.filter((s: any) => s.component !== null).findIndex((s: any) => s.name === screen.name);
        const isFocused = currentIndex === adjustedIndex;
        const color = isFocused ? colors.foreground : colors.muted;
        return (
          <TouchableOpacity
            key={screen.name}
            onPress={() => onTabPress(index)}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <FontAwesome name={screen.icon as any} size={28} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  // All hooks must be called before any early returns
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, isGuest, isLoading } = useApi();

  // All variables and calculations that don't depend on hooks
  const TOTAL_GAP = 12; // total gap between pages
  const availableScreens = getAvailableScreens(isAuthenticated, isGuest);
  const availableScreenComponents = availableScreens.filter(screen => screen.component !== null);
  const gapColor = colors.background;
  const pageColor = colors.background;

  // All useCallback hooks must be called before any early returns
  const handleTabPress = useCallback((index: number) => {
    const screen = availableScreens[index];
    if (screen.name === "create") {
      // Redirect guests to login when trying to create activity
      if (isGuest) {
        router.replace("/login?from=create-activity");
        return;
      }
      router.push("/create-activity");
      return;
    }
    
    const screenIndex = availableScreenComponents.findIndex(s => s.name === screen.name);
    if (screenIndex !== -1) {
      setCurrentIndex(screenIndex);
      scrollViewRef.current?.scrollTo({
        x: screenIndex * (screenWidth + TOTAL_GAP),
        animated: true,
      });
    }
  }, [availableScreens, availableScreenComponents, router, isGuest]);

  const handleScroll = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageWidth = screenWidth + TOTAL_GAP;
    const newIndex = Math.round(contentOffsetX / pageWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < availableScreenComponents.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, availableScreenComponents.length]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setIsScrolling(false);
  }, []);

  const renderScreen = useCallback((screen: any, index: number) => {
    const ScreenComponent = screen.component;
    
    return (
      <View
        key={screen.name}
        style={[
          styles.screenContainer,
          {
            backgroundColor: pageColor,
            width: screenWidth,
            marginRight: index < availableScreenComponents.length - 1 ? TOTAL_GAP : 0,
            borderTopLeftRadius: 42,
            borderTopRightRadius: 42,
          },
        ]}
      >
        <ScreenComponent />
      </View>
    );
  }, [pageColor, availableScreenComponents.length]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isGuest) {
      router.replace("/login");
    }
  }, [isAuthenticated, isGuest, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="users" size={48} color={colors.foreground} />
          <Text style={[styles.loadingText, { color: colors.foreground }]}>Link Up</Text>
          <Text style={[styles.loadingSubtext, { color: colors.muted }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated && !isGuest) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: gapColor, width: '100%' }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        snapToInterval={screenWidth + TOTAL_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {availableScreenComponents.map((screen, index) => renderScreen(screen, index))}
      </ScrollView>

      <View style={{ width: '100%' }}>
        <CustomTabBar currentIndex={currentIndex} onTabPress={handleTabPress} insets={insets} availableScreens={availableScreens} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  screenContainer: {
    flex: 1,
    height: '100%',
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    width: '100%',
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
});
