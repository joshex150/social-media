# Navigation Guard Implementation

## Overview
This document describes the comprehensive navigation guard system implemented to prevent double navigation throughout the entire app.

## Hooks Created

### 1. `useNavigationGuard` (`hooks/useNavigationGuard.ts`)
A custom hook that prevents double navigation by:
- Tracking navigation state with refs
- Debouncing navigation calls (300ms minimum between navigations)
- Preventing navigation to the same path within the debounce period
- Providing safe wrappers for `router.push()`, `router.replace()`, and `router.back()`

**Usage:**
```typescript
const { safePush, safeReplace, safeBack, isNavigating, reset } = useNavigationGuard();

// Instead of router.push('/path')
safePush('/path');

// Instead of router.replace('/path')
safeReplace('/path');

// Instead of router.back()
safeBack();
```

### 2. `usePreventDoublePress` (`hooks/usePreventDoublePress.ts`)
A custom hook that prevents double button presses by:
- Tracking processing state
- Ignoring rapid successive calls (default 500ms delay)
- Ensuring async handlers complete before allowing another press

**Usage:**
```typescript
const handlePress = usePreventDoublePress(() => {
  // Your handler code
}, 500); // Optional delay in ms

<TouchableOpacity onPress={handlePress}>
  ...
</TouchableOpacity>
```

## Files Updated

### Critical Navigation Points Protected:

1. **`app/login.tsx`**
   - All `router.replace()` calls in useEffect now use `safeReplace()`
   - Prevents double redirects when authentication state changes

2. **`app/(tabs)/_layout.tsx`**
   - `handleTabPress` uses `safePush()` and `safeReplace()`
   - useEffect redirect uses `safeReplace()`
   - Prevents double navigation when switching tabs or redirecting guests

3. **`app/create-activity.tsx`**
   - Success navigation uses `safeBack()`
   - Close button uses `safeReplace()` with `usePreventDoublePress`
   - Prevents double navigation on activity creation

## Best Practices

### For Navigation in useEffect:
```typescript
// ✅ GOOD - Use safe navigation guards
useEffect(() => {
  if (shouldNavigate) {
    safeReplace('/path');
  }
}, [shouldNavigate, safeReplace]);

// ❌ BAD - Direct router calls
useEffect(() => {
  if (shouldNavigate) {
    router.replace('/path'); // Can cause double navigation
  }
}, [shouldNavigate]);
```

### For Button Handlers:
```typescript
// ✅ GOOD - Use prevent double press
const handlePress = usePreventDoublePress(() => {
  safePush('/path');
});

// ❌ BAD - Direct handler
const handlePress = () => {
  router.push('/path'); // Can be called multiple times rapidly
};
```

### For Success Callbacks:
```typescript
// ✅ GOOD - Use safe navigation
showAlert('Success', 'Done!', 'success', [
  {
    text: 'OK',
    onPress: () => {
      safeBack(); // Safe navigation
    },
  },
]);

// ❌ BAD - Direct navigation
showAlert('Success', 'Done!', 'success', [
  {
    text: 'OK',
    onPress: () => {
      router.back(); // Can cause double navigation
    },
  },
]);
```

## Remaining Files to Update

The following files still have direct `router` calls that should be updated to use navigation guards:

- `app/edit-profile.tsx` - Update navigation calls
- `app/(tabs)/profile.tsx` - Update navigation calls
- `app/(tabs)/index.tsx` - Update navigation calls
- `app/(tabs)/explore.tsx` - Update navigation calls
- `app/(tabs)/map.tsx` - Update navigation calls
- `app/activity/[id].tsx` - Update navigation calls
- `app/activity/[id]/manage.tsx` - Update navigation calls
- `app/onboarding.tsx` - Update navigation calls
- Other screen files with navigation

## Testing Checklist

- [ ] Test rapid button clicks - should only navigate once
- [ ] Test authentication flow - no double redirects
- [ ] Test tab switching - smooth transitions, no duplicates
- [ ] Test modal open/close - no double navigation
- [ ] Test success callbacks - navigate only once
- [ ] Test back button - works correctly without errors
- [ ] Test guest flow - no double redirects to login

## Notes

- Navigation guards use refs to track state, so they persist across re-renders
- The debounce period (300ms) can be adjusted if needed
- The double press delay (500ms) can be customized per handler
- All navigation guards log warnings when blocking navigation (in development)
