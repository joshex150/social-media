import { createMessage, getMessages } from '@/data/store';

export async function GET(request: Request, { id }: { id: string }) {
  const messages = getMessages(id);

  return Response.json({ 
    success: true,
    messages
  });
}

export async function POST(request: Request, { id }: { id: string }) {
  const body = await request.json();
  
  const message = createMessage({
    eventId: id,
    userId: body.userId,
    sender: body.sender,
    text: body.text,
    isOwn: body.isOwn || false,
  });

  return Response.json({ 
    success: true, 
    messageId: message.id,
    message
  });
}
