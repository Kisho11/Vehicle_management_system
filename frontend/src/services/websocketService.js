import io from 'socket.io-client';

// // Changed from http://localhost:3005/api to just http://localhost:3005
// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3005';
const SOCKET_URL = 'http://localhost:3005';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.notificationListeners = [];
  }

  connect() {
    console.log('Attempting to connect to WebSocket at:', SOCKET_URL);
    
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('WebSocket connected successfully!');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
      
      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
      
      this.socket.on('notification', (notification) => {
        console.log('Received notification:', notification);
        this.notificationListeners.forEach(listener => listener(notification));
      });
    }
    
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  addNotificationListener(listener) {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;