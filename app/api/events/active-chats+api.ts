export async function GET(request: Request) {
  try {
    // Mock data for active chats
    const activeChats = [
      {
        id: 'chat_1',
        eventId: 'event_1',
        eventTitle: 'Morning Coffee Walk',
        lastMessage: 'Great weather for a walk!',
        lastMessageTime: '2 min ago',
        participants: 4,
        unreadCount: 2,
      },
      {
        id: 'chat_2',
        eventId: 'event_2',
        eventTitle: 'Evening Yoga Session',
        lastMessage: 'See you all at 6 PM',
        lastMessageTime: '1 hour ago',
        participants: 6,
        unreadCount: 0,
      },
      {
        id: 'chat_3',
        eventId: 'event_3',
        eventTitle: 'Book Club Discussion',
        lastMessage: 'The book was amazing!',
        lastMessageTime: '3 hours ago',
        participants: 8,
        unreadCount: 5,
      },
    ];

    return Response.json({ chats: activeChats });
  } catch (error) {
    console.error('Error fetching active chats:', error);
    return Response.json(
      { error: 'Failed to fetch active chats' },
      { status: 500 }
    );
  }
}
