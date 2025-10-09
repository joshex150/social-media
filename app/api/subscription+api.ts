import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_TIERS, shouldShowUpgradePrompt, shouldShowDailySuggestions } from '@/data/subscriptionTiers';

export async function GET(request: Request) {
  // Get user subscription data from AsyncStorage or default to free
  const currentTier = 'free'; // In production, get from user profile
  const daysUsed = 5; // In production, calculate from user creation date
  const activitiesCreated = 2; // In production, get from user activity history

  return Response.json({ 
    success: true,
    tiers: SUBSCRIPTION_TIERS,
    currentTier,
    usage: {
      activities: activitiesCreated,
      daysUsed,
      maxActivities: SUBSCRIPTION_TIERS[currentTier].maxActivities,
    },
    showUpgradePrompt: shouldShowUpgradePrompt(daysUsed, currentTier),
    showDailySuggestions: shouldShowDailySuggestions(daysUsed),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { tier } = body;

  if (!SUBSCRIPTION_TIERS[tier]) {
    return Response.json({ error: 'Invalid tier' }, { status: 400 });
  }

  // In production, process payment and update user subscription
  // For now, just return success
  await AsyncStorage.setItem('userTier', tier);

  return Response.json({ 
    success: true, 
    newTier: tier,
    message: `Successfully upgraded to ${SUBSCRIPTION_TIERS[tier].name}!`
  });
}
