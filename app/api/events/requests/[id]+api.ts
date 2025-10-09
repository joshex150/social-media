export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const url = new URL(request.url);
    const requestId = url.pathname.split('/').pop();

    if (!action || !['accept', 'reject'].includes(action)) {
      return Response.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Mock processing of join request
    console.log(`Processing join request ${requestId}: ${action}`);

    // In a real app, you would:
    // 1. Update the request status in the database
    // 2. Add user to event participants if accepted
    // 3. Send notification to requester
    // 4. Update event participant count

    return Response.json({
      success: true,
      message: `Join request ${action}ed successfully`,
      requestId,
      action,
    });
  } catch (error) {
    console.error('Error processing join request:', error);
    return Response.json(
      { error: 'Failed to process join request' },
      { status: 500 }
    );
  }
}
