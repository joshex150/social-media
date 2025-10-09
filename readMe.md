# Link Up - Social Activity Platform

Link Up is a React Native mobile application built with Expo that connects people for meaningful activities. **We are not a dating platform** - we focus on bringing people together for shared interests and experiences.

## 🚀 Features

### Core Features
- **Onboarding Flow**: Simple profile setup with name, location, interests, and languages
- **Activity Discovery**: Browse and join nearby activities with customizable radius filters
- **Activity Creation**: Create activities with title, category, description, location, and time
- **Join Requests**: Accept/reject join requests with a banner interface
- **In-Activity Chat**: Real-time messaging during activities
- **Map Integration**: View activity locations and participant positions with Mapbox
- **Post-Event Feedback**: Capture emotional feedback and ratings after activities
- **Vibe Check**: Quick wellbeing feedback widget on dashboard

### Subscription Tiers
- **Free**: 3 activities, 10km radius
- **Silver** ($13.6/month or $10 for 3 months): Unlimited activities, 20km radius
- **Gold** ($21/month): Unlimited activities, 50km radius, rating system, badge matching
- **Platinum** ($45/month): Unlimited everything, unlimited radius, trending alerts

### Subscription Features
- Upgrade prompts after 8 days of use
- Daily activity suggestions after 3 days
- Server-side enforcement of tier limits
- Usage tracking and analytics

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS Simulator (for Mac) or Android Emulator
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for custom native builds): `npm install -g eas-cli`

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd "/Users/yelekachi/Desktop/Link Up"
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Configure Mapbox (Required)**
   - Get a Mapbox access token from https://account.mapbox.com/
   - Update `app.json` with your token:
     ```json
     {
       "plugins": [
         ["@rnmapbox/maps", {
           "RNMapboxMapsDownloadToken": "YOUR_TOKEN_HERE"
         }]
       ]
     }
     ```
   - Update `app/(tabs)/map.tsx` with your token:
     ```javascript
     MapboxGL.setAccessToken('YOUR_TOKEN_HERE');
     ```

## 🏃 Running the App

### Development

**Start Expo Dev Server:**
```bash
npm start
```

**Run on specific platform:**
```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

### Testing

**Run all tests:**
```bash
npm test
```

**Run specific test suite:**
```bash
npm test -- --testPathPattern=dashboard.spec
npm test -- --testPathPattern=activity.spec
npm test -- --testPathPattern=chat.spec
npm test -- --testPathPattern=subscription.spec
npm test -- --testPathPattern=feedback.spec
npm test -- --testPathPattern=appflow.spec
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

### Build for Production

**EAS Build (Recommended):**
```bash
# First time setup
eas build:configure

# iOS build
eas build --platform ios

# Android build
eas build --platform android
```

## 📁 Project Structure

```
Link Up/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Activity dashboard
│   │   ├── profile.tsx    # Subscription management
│   │   ├── chat.tsx       # Chat screen
│   │   └── map.tsx        # Map view
│   ├── api/               # API routes
│   │   ├── events+api.ts
│   │   ├── feedback+api.ts
│   │   └── subscription+api.ts
│   ├── onboarding.tsx     # Onboarding flow
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ActivityCard.jsx
│   ├── RequestBanner.jsx
│   ├── MapView.jsx
│   ├── ChatBox.jsx
│   ├── FeedbackModal.jsx
│   ├── VibeCheck.jsx
│   ├── SubscriptionTier.jsx
│   └── UpgradePrompt.jsx
├── contexts/              # React contexts
│   └── SubscriptionContext.tsx
├── data/                  # Data layer
│   ├── store.js          # In-memory data store
│   └── subscriptionTiers.js
├── __tests__/            # Test suites
│   └── screens/
│       ├── dashboard.spec.jsx
│       ├── activity.spec.jsx
│       ├── chat.spec.jsx
│       ├── subscription.spec.jsx
│       ├── feedback.spec.jsx
│       └── appflow.spec.jsx
└── assets/               # Static assets
```

## 🎨 Design System

### Color Palette (Monochrome Only)
- **Black**: `#000` - Primary actions, text
- **Dark Gray**: `#333` - Secondary text
- **Medium Gray**: `#999` - Disabled states, placeholders
- **White**: `#FFF` - Backgrounds, inverted text

### Typography
- Headings: System font, bold (600-700)
- Body: System font, regular (400-500)
- Sizes: 12-28px

### Components
All components follow minimalistic monochrome design with:
- Simple borders and shadows
- Clean padding and spacing
- No gradients or bright colors
- Accessible contrast ratios

## 🧪 Testing Strategy (TDD)

The project follows Test-Driven Development:

1. **Write Failing Tests**: Tests are written before implementation
2. **Implement Features**: Build features to make tests pass
3. **Refactor**: Improve code while keeping tests green

### Test Coverage
- ✅ Dashboard rendering and filtering
- ✅ Activity creation and join flows
- ✅ Request banner accept/reject
- ✅ Chat messaging
- ✅ Feedback modal submission
- ✅ Subscription tier enforcement
- ✅ Integration tests for complete flows

## 🔑 Key Features Implementation

### 1. Activity Lifecycle
```
Create → Join Request → Accept/Reject → Map View → Chat → Feedback
```

### 2. Subscription Enforcement
- Free tier: Max 3 activities, 10km radius
- Paid tiers: Unlimited or extended limits
- Server-side validation on event creation

### 3. Analytics
- Active user tracking
- Join count metrics
- Feedback collection

## 🚧 Data Storage

**Current**: In-memory JSON store (`data/store.js`)
**TODO**: Migrate to proper database (Firebase, Supabase, or PostgreSQL)

To replace the in-memory store:
1. Create database schema
2. Update `data/store.js` to use database client
3. Update API routes to use async database calls
4. Maintain same API interface for compatibility

## 🔄 Git Workflow

**Commit Message Format:**
```
type(scope): description

- Detail 1
- Detail 2
```

**Types**: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`

**Example commits:**
- `test(ui): add failing tests for dashboard and activity`
- `feat(activity): implement event create + join`
- `feat(linkup): implement core linkup features + tests (all green)`

## 📱 Platform-Specific Notes

### iOS
- Requires Mac with Xcode
- Location permissions configured in `app.json`
- Mapbox requires custom native build (EAS)

### Android
- Location permissions in `app.json`
- Edge-to-edge display enabled
- Mapbox requires custom native build (EAS)

### Web
- Limited Mapbox functionality
- AsyncStorage falls back to localStorage
- Some native features unavailable

## 🐛 Troubleshooting

**Tests failing with "act(...)" warnings:**
- Wrap async updates in `act()` or use `waitFor()`
- Ensure mocks return promises properly

**Mapbox not displaying:**
- Verify access token is correct
- Run custom EAS build (Mapbox not supported in Expo Go)
- Check network connectivity

**API routes not found:**
- Ensure Expo Router is configured correctly
- Check `app.json` for router configuration
- Restart dev server

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests first (TDD)
4. Implement feature
5. Ensure all tests pass
6. Submit pull request

## 📞 Support

For issues or questions:
- Check existing issues on GitHub
- Review test files for usage examples
- Consult Expo and React Native documentation

---

**Built with:**
- Expo ~53.0
- React Native 0.79
- Mapbox Maps
- Jest + React Native Testing Library
- TypeScript
- AsyncStorage

**Mission**: Connect people for meaningful activities, not dating. Build community through shared experiences.