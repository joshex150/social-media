#!/bin/bash

echo "🚀 Setting up Link Up Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use Docker."
    echo "   Docker command: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/linkup
MONGODB_TEST_URI=mongodb://localhost:27017/linkup_test

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ .env file created. Please update with your actual values."
else
    echo "✅ .env file already exists."
fi

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    echo "🔄 Starting MongoDB..."
    if command -v mongod &> /dev/null; then
        mongod --fork --logpath /tmp/mongodb.log
    else
        echo "⚠️  MongoDB not found. Please start MongoDB manually or use Docker."
    fi
fi

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to start..."
sleep 3

# Run setup script to create sample data
echo "🗄️  Creating sample data..."
node setup.js

# Start the server
echo "🚀 Starting the server..."
echo "   Backend will be available at: http://localhost:5000"
echo "   API documentation: http://localhost:5000/api/health"
echo ""
echo "📋 Test Credentials:"
echo "   Email: alex.johnson@example.com | Password: password123"
echo "   Email: sarah.chen@example.com | Password: password123"
echo "   Email: mike.rodriguez@example.com | Password: password123"
echo ""
echo "🛑 Press Ctrl+C to stop the server"

npm run dev
