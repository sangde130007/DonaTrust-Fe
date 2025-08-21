import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(token, apiUrl = 'http://localhost:3000') {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Join a chat room
  joinRoom(roomId, userId, userToken) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return Promise.reject(new Error('Socket not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('join-room', { roomId, userId, userToken });

      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, 5000);

      this.socket.once('room-joined', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Send a message
  sendMessage(roomId, message, messageType = 'text') {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('send-message', { roomId, message, messageType });
    return true;
  }

  // Send typing indicator
  startTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', { roomId });
    }
  }

  stopTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', { roomId });
    }
  }

  // Event listeners
  onMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
      this.listeners.set('new-message', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
      this.listeners.set('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
      this.listeners.set('user-left', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
      this.listeners.set('user-typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
      this.listeners.set('user-stop-typing', callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    if (this.socket) {
      for (const [event, callback] of this.listeners) {
        this.socket.off(event, callback);
      }
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
