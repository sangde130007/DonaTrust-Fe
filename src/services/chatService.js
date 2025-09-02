import api from './api';

const chatService = {
  // Join charity chat room
  joinCharityChat: async (charityId) => {
    try {
      const response = await api.post(`/chat/charity/${charityId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining charity chat:', error);

      // Provide user-friendly error messages
      if (error.response?.status === 500) {
        throw new Error('Không thể kết nối chat. Vui lòng thử lại sau.');
      } else if (error.response?.status === 404) {
        throw new Error('Tổ chức từ thiện không tồn tại.');
      } else if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để tham gia chat.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Có lỗi xảy ra khi kết nối chat. Vui lòng thử lại.');
      }
    }
  },

  // Join campaign chat room
  joinCampaignChat: async (campaignId) => {
    try {
      const response = await api.post(`/chat/campaign/${campaignId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining campaign chat:', error);

      // Provide user-friendly error messages
      if (error.response?.status === 500) {
        throw new Error('Không thể kết nối chat. Vui lòng thử lại sau.');
      } else if (error.response?.status === 404) {
        throw new Error('Chiến dịch không tồn tại.');
      } else if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để tham gia chat.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Có lỗi xảy ra khi kết nối chat. Vui lòng thử lại.');
      }
    }
  },

  // Get active chat rooms (admin only)
  getActiveChatRooms: async () => {
    try {
      const response = await api.get('/chat/rooms/active');
      return response.data;
    } catch (error) {
      console.error('Error getting active chat rooms:', error);
      throw error;
    }
  },

  // Send a message to a chat room
  sendMessage: async (roomId, message, messageType = 'text') => {
    try {
      const response = await api.post('/chat/message', {
        roomId,
        message,
        messageType
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat messages for a room
  getChatMessages: async (roomId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/chat/messages/${roomId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }
};

export default chatService;
