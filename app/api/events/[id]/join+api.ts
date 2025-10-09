import { createJoinRequest, updateJoinRequest, incrementJoins } from '@/data/store';

export async function POST(request: Request, { id }: { id: string }) {
  const body = await request.json();
  const action = body.action;

  if (action === 'request') {
    // Create a new join request
    const joinRequest = createJoinRequest({
      eventId: id,
      userId: body.userId,
      userName: body.userName,
      message: body.message || 'Would like to join this activity',
    });

    return Response.json({ 
      success: true, 
      joinRequestId: joinRequest.id,
      joinRequest
    });
  } else if (action === 'accept' || action === 'reject') {
    // Update existing join request
    const updated = updateJoinRequest(body.requestId, action === 'accept' ? 'accepted' : 'rejected');
    
    if (action === 'accept') {
      incrementJoins();
    }

    return Response.json({ 
      success: true, 
      request: updated
    });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
