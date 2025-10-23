# Link Up - Social Activities App

A comprehensive React Native app with Node.js backend for discovering and joining social activities in your area.

## 🚀 Features

### Frontend (React Native)
- **Modern Tab Navigation**: Custom PagerView with smooth animations and gaps
- **Activity Discovery**: Location-based activity search with filters
- **Real-time Chat**: Socket.io powered messaging for activity participants
- **User Profiles**: Comprehensive user management with stats and preferences
- **Subscription System**: Multiple tiers with Stripe integration
- **Notifications**: Real-time push notifications
- **Dark/Light Mode**: Complete theme support
- **Responsive Design**: Optimized for all screen sizes

### Backend (Node.js/Express/MongoDB)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication**: JWT-based auth with secure password hashing
- **Real-time Features**: Socket.io for live chat and notifications
- **Payment Processing**: Stripe integration for subscriptions
- **Geospatial Queries**: MongoDB location-based searches
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet, CORS, input validation
- **Comprehensive Testing**: Full API test suite

## 🛠 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **React Native PagerView** - Custom tab navigation
- **React Native Safe Area Context** - Safe area handling
- **React Native Gesture Handler** - Touch interactions
- **React Native Reanimated** - Smooth animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Socket.io** - Real-time communication
- **Bcrypt** - Password hashing

## 📱 App Screens

1. **Home** - Activity feed with location-based recommendations
2. **Map** - Interactive map view of nearby activities
3. **Create** - Create new activities with location and details
4. **Chat** - Real-time messaging for activity participants
5. **Profile** - User profile, settings, and subscription management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Expo CLI
- iOS Simulator or Android Emulator

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally
   ```

5. **Run setup script**
```bash
   chmod +x ../setup-backend.sh
   ../setup-backend.sh
```

6. **Start the server**
```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
```bash
   npx expo start
```

3. **Run on device/simulator**
```bash
   # iOS
   npx expo start --ios
   
   # Android
   npx expo start --android
   ```

## 🧪 Testing

### Backend API Tests
```bash
cd backend
node ../test-api.js
```

### Frontend Tests
```bash
npm test
```

## 📊 Database Models

### User
- Personal information and preferences
- Subscription tier and stats
- Location data and activity history

### Activity
- Activity details and location
- Participants and join requests
- Status tracking and timestamps

### Chat
- Activity-based chat rooms
- Messages with read receipts
- Participant management

### Notification
- User notifications
- Different types (join requests, messages, etc.)
- Read status and priority

### Subscription
- Stripe integration
- Billing history
- Usage tracking and limits

## 🔐 Authentication

The app uses JWT-based authentication with the following features:
- Secure password hashing with bcrypt
- Token-based session management
- Protected routes and API endpoints
- User profile management
- Password change functionality

## 💳 Subscription System

### Tiers
- **Free**: 3 activities/month, 10km radius
- **Silver**: Unlimited activities, 20km radius, priority support
- **Gold**: Unlimited activities, 50km radius, advanced features
- **Platinum**: Unlimited everything, premium support

### Payment Processing
- Stripe integration for secure payments
- Webhook handling for subscription updates
- Billing history and invoice management
- Automatic subscription renewals

## 🌍 Location Services

- Geospatial queries for nearby activities
- Radius-based filtering
- Location-based recommendations
- Address geocoding and reverse geocoding

## 💬 Real-time Features

- Live chat for activity participants
- Real-time notifications
- Online/offline status
- Message read receipts

## 🔔 Notifications

- Join request notifications
- Activity reminders
- New message alerts
- Achievement notifications
- Push notification support

## 🎨 UI/UX Features

- Custom tab navigation with animations
- Smooth page transitions
- Responsive design
- Dark/light mode support
- Gesture-based interactions
- Loading states and error handling

## 📱 Platform Support

- iOS (iPhone/iPad)
- Android (Phone/Tablet)
- Web (PWA support)
- Cross-platform compatibility

## 🚀 Deployment

### Backend
- Deploy to Heroku, AWS, or DigitalOcean
- Set up MongoDB Atlas for production
- Configure environment variables
- Set up Stripe webhooks

### Frontend
- Build for iOS App Store
- Build for Google Play Store
- Deploy as PWA
- Configure push notifications

## 📈 Performance

- Optimized database queries
- Image compression and caching
- Lazy loading and pagination
- Efficient state management
- Memory leak prevention

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS configuration
- Helmet security headers

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Activity Endpoints
- `GET /api/activities` - Get activities with filters
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Chat Endpoints
- `GET /api/chat` - Get user's chats
- `POST /api/chat/:id/messages` - Send message
- `GET /api/chat/:id/messages` - Get messages

### Subscription Endpoints
- `GET /api/subscription/tiers` - Get subscription tiers
- `POST /api/subscription/create` - Create subscription
- `PUT /api/subscription/update` - Update subscription

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API tests
- Contact the development team

## 🎯 Roadmap

- [ ] Push notifications
- [ ] Video chat integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Social media integration
- [ ] Activity recommendations
- [ ] User verification system

---

**Built with ❤️ by the Link Up Team**