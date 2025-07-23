import api from './api';

const daoService = {
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
};

export default daoService; 