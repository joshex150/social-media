import { createFeedback, incrementFeedbacks } from '@/data/store';

export async function POST(request: Request) {
  const body = await request.json();
  
  const feedback = createFeedback({
    eventId: body.eventId,
    userId: body.userId,
    emotion: body.emotion,
    rating: body.rating,
    comments: body.comments || '',
  });

  incrementFeedbacks();

  return Response.json({ 
    success: true, 
    feedbackId: feedback.id,
    feedback
  });
}
