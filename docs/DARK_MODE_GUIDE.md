# Dark Mode Implementation Guide

This guide outlines the comprehensive dark mode system implemented in the Link Up app using your specified color scheme.

## 🎨 Color Scheme

### Dark Mode Colors (As Specified)
```css
--background: #111111;
--foreground: #ffffff;
--color-muted: #d4d4d4;
--color-border: #333333;
--color-surface: #111111;
--color-accent: #999999;
```

### Light Mode Colors
```css
--background: #ffffff;
--foreground: #000000;
--color-muted: #666666;
--color-border: #e5e5e5;
--color-surface: #f8f9fa;
--color-accent: #007AFF;
```

## 🏗️ Architecture

### 1. Color Constants
- **Location**: `constants/colors.ts`
- **Purpose**: Centralized color definitions for both light and dark modes
- **Features**: Type-safe color access, CSS-like variable naming

### 2. Theme Context
- **Location**: `contexts/ThemeContext.tsx`
- **Purpose**: Global theme state management
- **Features**: 
  - Automatic theme persistence with AsyncStorage
  - Theme toggle functionality
  - Context-based color access

### 3. Themed Components
- **Location**: `components/Themed.tsx`
- **Purpose**: Pre-styled components that automatically adapt to theme
- **Components**: Text, View, TouchableOpacity

### 4. Theme Toggle
- **Location**: `components/ThemeToggle.tsx`
- **Purpose**: User interface for switching themes
- **Features**: Animated icon, accessible design

## 🔧 Implementation

### Basic Usage

```typescript
import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { isDark, colors, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Using Themed Components

```typescript
import { Text, View, TouchableOpacity } from '@/components/Themed';

export default function MyComponent() {
  return (
    <View>
      <Text>This text automatically adapts to theme</Text>
      <TouchableOpacity>
        <Text>This button too!</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Custom Color Overrides

```typescript
import { Text } from '@/components/Themed';

export default function MyComponent() {
  return (
    <Text 
      lightColor="#000000" 
      darkColor="#ffffff"
    >
      Custom colored text
    </Text>
  );
}
```

## 📱 Component Updates

### Updated Components
- ✅ **CustomAlert**: Full dark mode support with theme-aware colors
- ✅ **ThemeToggle**: Toggle button with animated icons
- ✅ **Themed Components**: Text, View, TouchableOpacity with auto-theming
- ✅ **Home Screen**: Header, text, and background theming
- ✅ **Layout**: Loading screen and navigation theming

### Color Usage Guidelines

#### Background Colors
- **Primary Background**: `colors.background` - Main app background
- **Surface Background**: `colors.surface` - Cards, modals, overlays
- **Secondary Background**: `colors.accent` - Subtle backgrounds

#### Text Colors
- **Primary Text**: `colors.foreground` - Main text content
- **Secondary Text**: `colors.muted` - Subtitles, descriptions
- **Accent Text**: `colors.accent` - Highlights, labels

#### Border Colors
- **Borders**: `colors.border` - Card borders, dividers
- **Focus States**: `colors.accent` - Active states, focus rings

## 🎯 Best Practices

### 1. Always Use Theme Colors
```typescript
// ❌ Bad - Hardcoded colors
<Text style={{ color: '#000000' }}>Hello</Text>

// ✅ Good - Theme-aware colors
<Text style={{ color: colors.foreground }}>Hello</Text>
```

### 2. Use Themed Components When Possible
```typescript
// ❌ Bad - Manual styling
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.foreground }}>Hello</Text>
</View>

// ✅ Good - Themed components
<View>
  <Text>Hello</Text>
</View>
```

### 3. Provide Color Overrides for Special Cases
```typescript
// ✅ Good - Custom colors when needed
<Text 
  lightColor="#ff0000" 
  darkColor="#ff6666"
>
  Error message
</Text>
```

### 4. Test Both Themes
```typescript
// Test component in both themes
const { isDark, toggleTheme } = useTheme();

// Toggle theme for testing
<Button onPress={toggleTheme}>
  Switch to {isDark ? 'Light' : 'Dark'} Mode
</Button>
```

## 🧪 Testing

### Manual Testing
1. **Theme Toggle**: Use the toggle button in the header
2. **Persistence**: Restart app to verify theme is saved
3. **All Screens**: Navigate through all screens to check theming
4. **Components**: Test all components in both themes

### Automated Testing
```typescript
// Test theme context
const { result } = renderHook(() => useTheme());
expect(result.current.isDark).toBe(false);

// Test theme toggle
act(() => {
  result.current.toggleTheme();
});
expect(result.current.isDark).toBe(true);
```

## 📊 Theme States

### Light Mode
- **Background**: White (#ffffff)
- **Text**: Black (#000000)
- **Borders**: Light gray (#e5e5e5)
- **Accent**: Blue (#007AFF)

### Dark Mode
- **Background**: Dark gray (#111111)
- **Text**: White (#ffffff)
- **Borders**: Dark gray (#333333)
- **Accent**: Light gray (#999999)

## 🔄 Theme Switching

### Automatic Switching
- Theme preference is saved to AsyncStorage
- App remembers user's choice on restart
- Smooth transitions between themes

### Manual Switching
- Theme toggle button in header
- Instant theme switching
- All components update immediately

## 📚 Related Files

- `constants/colors.ts` - Color definitions
- `contexts/ThemeContext.tsx` - Theme state management
- `components/Themed.tsx` - Themed components
- `components/ThemeToggle.tsx` - Theme toggle button
- `components/CustomAlert.tsx` - Themed alert component
- `components/DarkModeTest.tsx` - Testing component

## 🚀 Future Enhancements

1. **System Theme Detection**: Auto-detect device theme preference
2. **Theme Animations**: Smooth transitions between themes
3. **Custom Themes**: User-defined color schemes
4. **Theme Presets**: Multiple predefined themes
5. **Accessibility**: High contrast mode support

## 🎯 Key Takeaways

1. **Consistent Colors**: Use theme colors throughout the app
2. **Themed Components**: Prefer themed components over manual styling
3. **Test Both Themes**: Ensure all screens work in both modes
4. **User Preference**: Respect user's theme choice
5. **Accessibility**: Ensure good contrast in both themes
6. **Performance**: Theme switching should be instant
7. **Persistence**: Theme choice should survive app restarts

## 🎨 Color Palette Reference

### Dark Mode (Your Specified Colors)
- **Background**: #111111 (Very dark gray)
- **Foreground**: #ffffff (White)
- **Muted**: #d4d4d4 (Light gray)
- **Border**: #333333 (Dark gray)
- **Surface**: #111111 (Same as background)
- **Accent**: #999999 (Medium gray)

### Light Mode (Complementary Colors)
- **Background**: #ffffff (White)
- **Foreground**: #000000 (Black)
- **Muted**: #666666 (Dark gray)
- **Border**: #e5e5e5 (Light gray)
- **Surface**: #f8f9fa (Very light gray)
- **Accent**: #007AFF (Blue)

This implementation provides a robust, user-friendly dark mode system that enhances the app's usability and visual appeal! 🌙✨
