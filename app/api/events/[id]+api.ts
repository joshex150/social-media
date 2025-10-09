import { getEvent, getJoinRequests, getMessages } from '@/data/store';

export async function GET(request: Request, { id }: { id: string }) {
  const event = getEvent(id);
  
  if (!event) {
    return Response.json({ error: 'Event not found' }, { status: 404 });
  }

  const joinRequests = getJoinRequests(id);
  const messages = getMessages(id);

  return Response.json({ 
    success: true,
    event,
    joinRequests,
    messages
  });
}
