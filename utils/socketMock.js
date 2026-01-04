// Mock Socket.io for development
export const createMockSocket = () => ({
  on: (event, callback) => {
    console.log(`Mock socket: listening to ${event}`);
  },
  off: (event, callback) => {
    console.log(`Mock socket: stopped listening to ${event}`);
  },
  emit: (event, data) => {
    console.log(`Mock socket: emitting ${event}`, data);
  },
  close: () => {
    console.log('Mock socket: closed');
  }
});

export const createMockIO = () => {
  return (url, options) => {
    console.log('Mock socket.io connecting to:', url, options);
    return createMockSocket();
  };
};

