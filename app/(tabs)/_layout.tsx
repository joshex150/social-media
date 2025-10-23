// app/(tabs)/_layout.tsx
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  useColorScheme,
  Dimensions,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

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

function CustomTabBar({ currentIndex, onTabPress, insets }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: isDark ? "#0b0b0b" : "#fff",
          borderColor: isDark ? "#222" : "#eee",
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {screens.map((screen, index) => {
        // Adjust currentIndex for the create tab since it's not in the view
        const adjustedIndex = screen.name === "create" ? -1 : 
          screens.filter(s => s.component !== null).findIndex(s => s.name === screen.name);
        const isFocused = currentIndex === adjustedIndex;
        const color = isFocused
          ? isDark
            ? "#fff"
            : "#000"
          : isDark
          ? "#888"
          : "#999";
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const TOTAL_GAP = 12; // total gap between pages
  const availableScreens = screens.filter(screen => screen.component !== null);

  const gapColor = isDark ? "#111213" : "#e6e6e6";
  const pageColor = isDark ? "#0b0b0b" : "#fff";

  const handleTabPress = useCallback((index: number) => {
    const screen = screens[index];
    if (screen.name === "create") {
      router.push("/create-activity");
      return;
    }
    
    const screenIndex = availableScreens.findIndex(s => s.name === screen.name);
    if (screenIndex !== -1) {
      setCurrentIndex(screenIndex);
      scrollViewRef.current?.scrollTo({
        x: screenIndex * (screenWidth + TOTAL_GAP),
        animated: true,
      });
    }
  }, [availableScreens, router]);

  const handleScroll = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageWidth = screenWidth + TOTAL_GAP;
    const newIndex = Math.round(contentOffsetX / pageWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < availableScreens.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, availableScreens.length]);

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
            marginRight: index < availableScreens.length - 1 ? TOTAL_GAP : 0,
            borderTopLeftRadius: 42,
            borderTopRightRadius: 42,
          },
        ]}
      >
        <ScreenComponent />
      </View>
    );
  }, [pageColor, availableScreens.length]);

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
        {availableScreens.map((screen, index) => renderScreen(screen, index))}
      </ScrollView>

      <View style={{ width: '100%' }}>
        <CustomTabBar currentIndex={currentIndex} onTabPress={handleTabPress} insets={insets} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
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
