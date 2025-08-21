import api from './api';

const daoService = {
  // === DAO MEMBER REGISTRATION ===

  // Đăng ký DAO member
  registerDao: async (formData) => {
    const data = new FormData();

    // Add text fields
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('introduction', formData.introduction);
    data.append('experience', formData.experience);
    data.append('areasOfInterest', JSON.stringify(formData.areasOfInterest));

    // Add certificate file if exists
    if (formData.certificateFile) {
      data.append('certificates', formData.certificateFile);
    }

    try {
      const response = await api.post('/dao/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy đơn đăng ký của tôi
  getMyApplication: async () => {
    try {
      const response = await api.get('/dao/my-application');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // === ADMIN MANAGEMENT ===

  // Admin: Lấy tất cả đơn đăng ký
  getAllApplications: async (page = 1, limit = 10, status = null) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const response = await api.get('/dao/applications', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Lấy chi tiết đơn đăng ký
  getApplicationById: async (id) => {
    try {
      const response = await api.get(`/dao/applications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Duyệt đơn đăng ký
  approveApplication: async (id) => {
    try {
      const response = await api.post(`/dao/applications/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Từ chối đơn đăng ký
  rejectApplication: async (id, rejectionReason) => {
    try {
      const response = await api.post(`/dao/applications/${id}/reject`, {
        rejectionReason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // === DAO CAMPAIGN VOTING SYSTEM ===

  // Lấy danh sách campaigns chờ vote (dành cho DAO members)
  getPendingCampaigns: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/dao/campaigns/pending', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy chi tiết campaign với thông tin vote (dành cho DAO members)
  getCampaignForVoting: async (campaignId) => {
    try {
      const response = await api.get(`/dao/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Vote cho campaign (dành cho DAO members)
  voteCampaign: async (campaignId, voteData) => {
    try {
      console.log('📤 Voting on campaign:', { campaignId, voteData });

      const response = await api.post(`/dao/campaigns/${campaignId}/vote`, {
        decision: voteData.vote, // 'approve' hoặc 'reject'
        reason: voteData.reason || ''
      });

      console.log('✅ Vote submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Vote submission failed:', error);
      throw error.response?.data || error;
    }
  },

  // Lấy lịch sử vote của tôi
  getMyVotes: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/dao/my-votes', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // === ADMIN DAO CAMPAIGN MANAGEMENT ===

  // Admin: Lấy campaigns đã được DAO approve (chờ admin duyệt cuối)
  getDaoApprovedCampaigns: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/dao/campaigns/dao-approved', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Lấy campaigns bị DAO reject
  getDaoRejectedCampaigns: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/dao/campaigns/dao-rejected', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // === DAO STATISTICS ===

  // Lấy thống kê DAO
  getDaoStatistics: async () => {
    try {
      const response = await api.get('/dao/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy thống kê vote của member
  getMyVoteStatistics: async () => {
    try {
      const response = await api.get('/dao/my-vote-statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // === UTILITY FUNCTIONS ===

  // Check if user is DAO member
  isUserDaoMember: (user) => {
    return user?.role === 'dao_member' && user?.status === 'active';
  },

  // Check if user can vote on campaign
  canUserVoteOnCampaign: (campaign, userVotes = []) => {
    // Check if user already voted on this campaign
    const hasVoted = userVotes.some(vote => vote.campaign_id === campaign.campaign_id);

    // Check if campaign is in pending status
    const isPending = campaign.approval_status === 'pending' &&
      (!campaign.dao_approval_status || campaign.dao_approval_status === 'pending');

    return !hasVoted && isPending;
  },

  // Get vote status color for UI
  getVoteStatusColor: (status) => {
    switch (status) {
      case 'dao_approved':
        return 'text-green-600 bg-green-100';
      case 'dao_rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  // Format vote reason for display
  formatVoteReason: (reason) => {
    if (!reason || reason.trim() === '') {
      return 'Không có lý do cụ thể';
    }
    return reason;
  },

  // Calculate voting progress
  calculateVotingProgress: (campaign) => {
    const totalVotes = (campaign.approve_votes || 0) + (campaign.reject_votes || 0);
    const approvalRate = totalVotes > 0 ? ((campaign.approve_votes || 0) / totalVotes) * 100 : 0;
    const needsMoreVotes = totalVotes < 5; // Minimum 5 votes needed

    return {
      totalVotes,
      approvalRate: Math.round(approvalRate * 10) / 10, // Round to 1 decimal
      needsMoreVotes,
      canBeFinalDecision: totalVotes >= 5,
      willBeApproved: approvalRate > 50,
      votesLeft: Math.max(0, 5 - totalVotes)
    };
  }
};

export default daoService;