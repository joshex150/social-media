#!/usr/bin/env node

/**
 * Script to help update Alert.alert calls to use CustomAlert
 * Run this to see which files need to be updated
 */

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/onboarding.tsx',
  'app/login.tsx', 
  'app/(tabs)/profile.tsx',
  'app/system-notifications.tsx',
  'app/(tabs)/explore.tsx',
  'app/activity/[id].tsx',
  'app/subscription-settings.tsx',
  'app/billing-history.tsx',
  'app/about.tsx',
  'app/help-support.tsx',
  'app/privacy-settings.tsx',
  'app/payment-methods.tsx'
];

// console.log('🔍 Files that need Alert.alert replacement:');
// console.log('==========================================');

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const alertCount = (content.match(/Alert\.alert/g) || []).length;
    if (alertCount > 0) {
      // console.log(`📄 ${file} - ${alertCount} Alert.alert calls`);
    }
  }
});

// console.log('\n📋 Steps to update each file:');
// console.log('1. Import useCustomAlert hook and CustomAlert component');
// console.log('2. Add const { alert, showAlert, hideAlert } = useCustomAlert();');
// console.log('3. Replace Alert.alert() calls with showAlert()');
// console.log('4. Add <CustomAlert> component to render');
// console.log('5. Remove Alert import from react-native');

// console.log('\n✅ Already updated:');
// console.log('- app/create-activity.tsx');
// console.log('- app/(tabs)/index.tsx'); 
// console.log('- app/(tabs)/chat.tsx');
