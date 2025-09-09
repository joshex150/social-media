## 🔑 Core

```sh
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-vector-icons
npx expo install @react-native-async-storage/async-storage
```

---

## 👤 Auth & Security

```sh
npx expo install expo-auth-session expo-secure-store
```

---

## 🎨 UI & Styling

```sh
npx expo install nativewind
npx expo install react-native-paper
npx expo install lottie-react-native
npx expo install react-native-fast-image
```

---

## 📸 Media

```sh
npx expo install expo-image-picker expo-camera expo-av
```

---

## 🗺️ Maps & Location

```sh
npx expo install expo-location
```

---

## 💬 Realtime & Notifications

```sh
npx expo install expo-notifications
```

(For chat/real-time: you’d add either `npm install socket.io-client` or Firebase separately.)

---

## 📊 Analytics & Monitoring

```sh
npx expo install expo-firebase-analytics
npx expo install sentry-expo
```

---

⚡ **Optional but recommended**

- If you want **state management**:

  ```sh
  npm install zustand
  ```

- If you want **data fetching/caching**:

  ```sh
  npm install @tanstack/react-query
  ```

---

⚠️ Note: Some packages (like `react-native-fast-image`, `@rnmapbox/maps`) are not fully Expo Go–compatible and require **EAS Build** (like you did for Mapbox). Everything else here works in Expo Go.

---
