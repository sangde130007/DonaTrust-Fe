import api from './api';

const chatService = {
  // Join charity chat room
  joinCharityChat: async (charityId) => {
    try {
      const response = await api.post(`/chat/charity/${charityId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining charity chat:', error);
      throw error;
    }
  },

  // Join campaign chat room
  joinCampaignChat: async (campaignId) => {
    try {
      const response = await api.post(`/chat/campaign/${campaignId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining campaign chat:', error);
      throw error;
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
  }
};

export default chatService;
