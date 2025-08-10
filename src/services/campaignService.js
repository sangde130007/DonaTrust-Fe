// services/campaignService.js
import api from './api';

class CampaignService {
  // ===== PUBLIC =====
  async getAllCampaigns(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const qs = params.toString();
    const url = qs ? `/campaigns?${qs}` : '/campaigns';
    const res = await api.get(url);
    return res.data;
  }

  async getFeaturedCampaigns() {
    const res = await api.get('/campaigns/featured');
    return res.data;
  }

  async getCategories() {
    const res = await api.get('/campaigns/categories');
    return res.data;
  }

  async getCampaignById(id) {
    const res = await api.get(`/campaigns/${id}`);
    return res.data;
  }

  // ===== AUTH (charity) =====
  async createCampaign(formData /* FormData */) {
    // BE route: POST /api/campaigns  (đã gắn multer.fields: image, images, qr_image)
    const res = await api.post('/campaigns', formData);
    return res.data;
  }

  async updateCampaign(id, data) {
    const res = await api.put(`/campaigns/${id}`, data);
    return res.data;
  }

  async deleteCampaign(id) {
    const res = await api.delete(`/campaigns/${id}`);
    return res.data;
  }

  // (tuỳ chọn) upload tách bước nếu bạn còn dùng 2 endpoint riêng
  async uploadCoverImage(id, file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post(`/campaigns/${id}/upload-image`, fd);
    return res.data;
  }

  async uploadGalleryImages(id, files = []) {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    const res = await api.post(`/campaigns/${id}/upload-images`, fd);
    return res.data;
  }
}

export default new CampaignService();
