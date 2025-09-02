import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.fallbackMode = false;
    this.currentRoomId = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  // Initialize socket connection
  connect(token, apiUrl = 'http://localhost:5000') {
    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        timeout: 10000, // Increased timeout
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected = true;
        this.fallbackMode = false;
        this.retryAttempts = 0;

        // Rejoin room if we were in one before disconnection
        if (this.currentRoomId && this.currentToken && this.currentUserId) {
          console.log('Rejoining room after reconnection:', this.currentRoomId);
          this.joinRoom(this.currentRoomId, this.currentUserId, this.currentToken);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;

        // Don't switch to fallback immediately on disconnect
        // Let socket.io handle reconnection first
        if (reason === 'io server disconnect' || reason === 'transport error') {
          console.warn('Server initiated disconnect or transport error');
          this.fallbackMode = true;
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        this.retryAttempts++;

        if (this.retryAttempts >= this.maxRetries) {
          console.warn('Max connection attempts reached, switching to fallback mode');
          this.fallbackMode = true;
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);

        // Handle specific authorization errors
        if (error.message === 'Not authorized for this room') {
          console.warn('Authorization error - may need to rejoin room');
          // Don't switch to fallback immediately, try to rejoin
          if (this.currentRoomId && this.currentToken && this.currentUserId) {
            setTimeout(() => {
              this.joinRoom(this.currentRoomId, this.currentUserId, this.currentToken);
            }, 1000);
          }
        } else if (error.message === 'Socket not authenticated') {
          console.warn('Authentication error - switching to fallback mode');
          this.fallbackMode = true;
        }
      });

      return this.socket;
    } catch (error) {
      console.error('Error creating socket connection:', error);
      this.fallbackMode = true;
      return null;
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      this.currentRoomId = null;
      this.currentToken = null;
      this.currentUserId = null;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      fallbackMode: this.fallbackMode,
      socketId: this.socket?.id,
      currentRoom: this.currentRoomId
    };
  }

  // Join a chat room
  joinRoom(roomId, userId, userToken) {
    // Store current room info for reconnection
    this.currentRoomId = roomId;
    this.currentUserId = userId;
    this.currentToken = userToken;

    if (this.fallbackMode) {
      console.log('Using fallback mode for join room');
      return Promise.resolve({ roomId, userId, status: 'joined', fallback: true });
    }

    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, using fallback mode');
      this.fallbackMode = true;
      return Promise.resolve({ roomId, userId, status: 'joined', fallback: true });
    }

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        console.warn('Join room timeout, switching to fallback mode');
        this.fallbackMode = true;
        resolve({ roomId, userId, status: 'joined', fallback: true });
      }, 5000); // Increased timeout

      // Listen for success response
      const onRoomJoined = (data) => {
        clearTimeout(timeout);
        this.socket.off('error', onError);
        console.log('Successfully joined room:', roomId, data);
        resolve(data);
      };

      // Listen for error response
      const onError = (error) => {
        clearTimeout(timeout);
        this.socket.off('room-joined', onRoomJoined);
        console.warn('Socket error during join room:', error);

        if (error.message === 'Not authorized for this room' ||
          error.message === 'Socket not authenticated') {
          this.fallbackMode = true;
          resolve({ roomId, userId, status: 'joined', fallback: true });
        } else {
          reject(error);
        }
      };

      // Set up event listeners
      this.socket.once('room-joined', onRoomJoined);
      this.socket.once('error', onError);

      // Emit join room event
      console.log('Emitting join-room event:', { roomId, userId, userToken });
      this.socket.emit('join-room', { roomId, userId, userToken });
    });
  }

  // Send a message
  sendMessage(roomId, message, messageType = 'text') {
    if (this.fallbackMode) {
      console.log('Using fallback mode for send message');
      return true; // In fallback mode, message will be sent via REST API
    }

    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    if (!roomId || !message || message.trim() === '') {
      console.error('Invalid message data');
      return false;
    }

    try {
      console.log('Sending message via socket:', { roomId, message: message.substring(0, 50) });
      this.socket.emit('send-message', { roomId, message, messageType });
      return true;
    } catch (error) {
      console.error('Error sending message via socket:', error);
      return false;
    }
  }

  // Send typing indicator
  startTyping(roomId) {
    if (this.fallbackMode || !roomId) {
      return; // Skip typing indicators in fallback mode
    }

    if (this.socket && this.isConnected) {
      try {
        this.socket.emit('typing-start', { roomId });
      } catch (error) {
        console.error('Error sending typing start:', error);
      }
    }
  }

  stopTyping(roomId) {
    if (this.fallbackMode || !roomId) {
      return; // Skip typing indicators in fallback mode
    }

    if (this.socket && this.isConnected) {
      try {
        this.socket.emit('typing-stop', { roomId });
      } catch (error) {
        console.error('Error sending typing stop:', error);
      }
    }
  }

  // Event listeners
  onMessage(callback) {
    if (this.fallbackMode) {
      // In fallback mode, we'll handle messages through REST API polling
      return;
    }

    if (this.socket) {
      // Remove existing listener if any
      if (this.listeners.has('new-message')) {
        this.socket.off('new-message', this.listeners.get('new-message'));
      }

      this.socket.on('new-message', callback);
      this.listeners.set('new-message', callback);
    }
  }

  onUserJoined(callback) {
    if (this.fallbackMode) {
      return;
    }

    if (this.socket) {
      if (this.listeners.has('user-joined')) {
        this.socket.off('user-joined', this.listeners.get('user-joined'));
      }

      this.socket.on('user-joined', callback);
      this.listeners.set('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.fallbackMode) {
      return;
    }

    if (this.socket) {
      if (this.listeners.has('user-left')) {
        this.socket.off('user-left', this.listeners.get('user-left'));
      }

      this.socket.on('user-left', callback);
      this.listeners.set('user-left', callback);
    }
  }

  onUserTyping(callback) {
    if (this.fallbackMode) {
      return;
    }

    if (this.socket) {
      if (this.listeners.has('user-typing')) {
        this.socket.off('user-typing', this.listeners.get('user-typing'));
      }

      this.socket.on('user-typing', callback);
      this.listeners.set('user-typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.fallbackMode) {
      return;
    }

    if (this.socket) {
      if (this.listeners.has('user-stop-typing')) {
        this.socket.off('user-stop-typing', this.listeners.get('user-stop-typing'));
      }

      this.socket.on('user-stop-typing', callback);
      this.listeners.set('user-stop-typing', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Remove specific listener
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Force fallback mode (useful for testing)
  enableFallbackMode() {
    this.fallbackMode = true;
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Retry connection
  retryConnection(token, apiUrl) {
    console.log('Retrying socket connection...');
    this.fallbackMode = false;
    this.retryAttempts = 0;
    return this.connect(token, apiUrl);
  }
}

export default new SocketService();