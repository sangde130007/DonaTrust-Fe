import React, { useState, useEffect, useRef, useContext } from 'react';
import socketService from '../../services/socketService';
import chatService from '../../services/chatService';
import { FiSend, FiUsers, FiX, FiMessageCircle } from 'react-icons/fi';
import AuthContext from '@/context/AuthContext';

const ChatWindow = ({
  isOpen,
  onClose,
  roomData,
  title,
  subtitle
}) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection and join room
  useEffect(() => {
    if (isOpen && roomData && user) {
      initializeChat();
    }

    return () => {
      if (isOpen) {
        cleanupChat();
      }
    };
  }, [isOpen, roomData, user]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Connect socket if not connected
      if (!socketService.getConnectionStatus().isConnected) {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const socketResult = socketService.connect(token);
        
        if (!socketResult) {
          console.warn('Socket connection failed, will use fallback mode');
        }
      }

      // Setup event listeners
      setupSocketListeners();

      // Join room
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      try {
        await socketService.joinRoom(roomData.roomId, user.user_id, token);
        console.log('Successfully joined room:', roomData.roomId);
      } catch (joinError) {
        console.warn('Socket join room failed, will use fallback mode:', joinError);
        // Don't fail the entire chat initialization for this
      }

      // Load existing messages if available
      if (roomData.roomId) {
        try {
          const messagesResponse = await chatService.getChatMessages(roomData.roomId, 1, 50);
          if (messagesResponse.data) {
            setMessages(messagesResponse.data);
          }
        } catch (msgError) {
          console.warn('Could not load existing messages:', msgError);
          // Don't fail the entire chat initialization for this
        }
      }

      // Mark as connected even if socket fails (fallback mode)
      setIsConnected(true);
      console.log('Chat initialized successfully');
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Không thể kết nối chat. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.onMessage((messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    // Listen for user joined
    socketService.onUserJoined((data) => {
      setParticipantCount(data.participantCount);
    });

    // Listen for user left
    socketService.onUserLeft((data) => {
      setParticipantCount(data.participantCount);
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socketService.onUserStopTyping((data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });
  };

  const cleanupChat = () => {
    socketService.removeAllListeners();
    setMessages([]);
    setTypingUsers([]);
    setIsConnected(false);
    setParticipantCount(0);
    setError(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !isConnected) {
      return;
    }

    try {
      // Try to send via socket first
      const socketSuccess = socketService.sendMessage(roomData.roomId, newMessage.trim());
      
      if (socketSuccess) {
        // If socket succeeds, clear input immediately for better UX
        setNewMessage('');
        handleStopTyping();
      } else {
        // Fallback to REST API if socket fails
        if (roomData.roomId) {
          await chatService.sendMessage(roomData.roomId, newMessage.trim());
          setNewMessage('');
          handleStopTyping();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (e.target.value.trim() && isConnected) {
      socketService.startTyping(roomData.roomId);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 2000);
    } else {
      handleStopTyping();
    }
  };

  const handleStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isConnected) {
      socketService.stopTyping(roomData.roomId);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnMessage = (messageUserId) => {
    return messageUserId === user?.user_id;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'charity': return 'text-green-600';
      case 'admin': return 'text-red-600';
      case 'dao_member': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex fixed right-4 bottom-4 z-50 flex-col w-80 h-96 bg-white rounded-lg border border-gray-300 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-3 text-white rounded-t-lg bg-global-7">
        <div className="flex items-center">
          <FiMessageCircle className="mr-2" />
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {subtitle && <p className="text-xs opacity-90">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs">
            <FiUsers className="mr-1" />
            <span>{participantCount}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-global-5"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Connection Status & Error */}
      <div className="px-3 py-1 text-xs bg-gray-50 border-b">
        {error ? (
          <span className="inline-flex items-center text-red-600">
            <span className="w-2 h-2 rounded-full mr-1 bg-red-500"></span>
            {error}
          </span>
        ) : (
          <span className={`inline-flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isLoading ? 'Đang kết nối...' : isConnected ? 'Đã kết nối' : 'Mất kết nối'}
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="overflow-y-auto flex-1 p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="mt-8 text-sm text-center text-gray-500">
            <FiMessageCircle className="mx-auto mb-2" size={24} />
            <p>Chưa có tin nhắn nào</p>
            <p className="text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${isOwnMessage(message.userId) ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage(message.userId) ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage(message.userId) && (
                  <div className="flex items-center mb-1">
                    <span className={`text-xs font-semibold ${getRoleColor(message.userRole)}`}>
                      {message.userName}
                    </span>
                    {message.userRole === 'charity' && (
                      <span className="px-1 py-0.5 ml-1 text-xs text-green-600 bg-green-100 rounded">
                        Tổ chức
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${isOwnMessage(message.userId)
                    ? 'bg-global-7 text-white'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  <p>{message.message}</p>
                  <span className={`text-xs ${isOwnMessage(message.userId) ? 'text-global-2' : 'text-gray-500'} block mt-1`}>
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
              <span className="italic">
                {typingUsers.map(u => u.userName).join(', ')} đang nhập...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-global-7 focus:border-transparent"
            disabled={!isConnected || isLoading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected || isLoading}
            className="p-2 text-white rounded-lg transition-colors bg-global-7 hover:bg-global-5 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <FiSend size={16} />
          </button>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {newMessage.length}/500
          </span>
          {!isConnected && (
            <span className="text-xs text-red-500">
              Mất kết nối
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
