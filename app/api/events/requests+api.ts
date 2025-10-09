export async function GET(request: Request) {
  try {
    // Mock data for join requests
    const joinRequests = [
      {
        id: 'req_1',
        eventId: 'event_1',
        eventTitle: 'Morning Coffee Walk',
        requesterName: 'Sarah Johnson',
        requesterMessage: 'Would love to join your coffee walk!',
        requestTime: '5 min ago',
        requesterAvatar: null,
      },
      {
        id: 'req_2',
        eventId: 'event_2',
        eventTitle: 'Evening Yoga Session',
        requesterName: 'Mike Chen',
        requesterMessage: 'I\'m a beginner, is that okay?',
        requestTime: '1 hour ago',
        requesterAvatar: null,
      },
    ];

    return Response.json({ requests: joinRequests });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return Response.json(
      { error: 'Failed to fetch join requests' },
      { status: 500 }
    );
  }
}
