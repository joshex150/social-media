import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_TIERS } from '@/data/subscriptionTiers';

export async function POST(request: Request) {
  const body = await request.json();
  const { tier } = body;

  if (!SUBSCRIPTION_TIERS[tier]) {
    return Response.json({ error: 'Invalid tier' }, { status: 400 });
  }

  // In production, process payment here
  // For demo purposes, we'll just update the tier
  await AsyncStorage.setItem('userTier', tier);

  return Response.json({ 
    success: true, 
    newTier: tier,
    message: `Successfully upgraded to ${SUBSCRIPTION_TIERS[tier].name}!`
  });
}
