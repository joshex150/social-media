import { createEvent, getEvents } from '@/data/store';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const radius = parseFloat(url.searchParams.get('radius') || '10');
  const userLat = parseFloat(url.searchParams.get('lat') || '0');
  const userLng = parseFloat(url.searchParams.get('lng') || '0');

  const events = getEvents({ radius, userLat, userLng });

  return Response.json({ 
    success: true, 
    activities: events.map(event => ({
      ...event,
      participants: event.participants?.length || 0,
    }))
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const event = createEvent({
    title: body.title,
    category: body.category,
    description: body.description,
    location: body.location,
    latitude: body.latitude,
    longitude: body.longitude,
    startTime: body.startTime,
    maxParticipants: body.maxParticipants || 8,
    radius: body.radius || 10,
    creatorId: body.userId,
  });

  return Response.json({ 
    success: true, 
    activityId: event.id,
    event 
  });
}
