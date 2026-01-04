import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "../contexts/ThemeContext";
import {
  PADDING,
  MARGIN,
  GAPS,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@/constants/spacing";

const { width } = Dimensions.get("window");

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  onClose: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = "info",
  buttons = [{ text: "OK", onPress: () => {} }],
  onClose,
}: CustomAlertProps) {
  const { colors } = useTheme();
  const getIcon = () => {
    switch (type) {
      case "success":
        return "check-circle";
      case "error":
        return "times-circle";
      case "warning":
        return "exclamation-triangle";
      default:
        return "info-circle";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.alertContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
            <FontAwesome name={getIcon()} size={24} color={colors.foreground} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              // Determine button background color based on style
              let buttonBgColor = colors.primary;
              if (button.style === "destructive") {
                buttonBgColor = colors.error || colors.primary;
              } else if (button.style === "cancel") {
                buttonBgColor = "transparent";
              }

              // Determine button text color based on style and theme
              // For colored buttons (primary/error), use background color for contrast
              // For cancel buttons, use foreground color
              let buttonTextColor: string;
              if (button.style === "cancel") {
                buttonTextColor = colors.foreground; // Foreground color for cancel buttons
              } else {
                // For primary and destructive buttons, use background color for contrast
                // This ensures: light mode (dark button → light text), dark mode (light button → dark text)
                buttonTextColor = colors.background;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    { backgroundColor: buttonBgColor },
                    button.style === "cancel" && {
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                    buttons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => {
                    button.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: buttonTextColor },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#212121",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.15,
  },
  message: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    minHeight: 48,
  },
  singleButton: {
    flex: 1,
    width: "100%",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.25,
  },
});
