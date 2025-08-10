// src/services/charityService.js
import api from './api';

const isFormData = (v) => typeof FormData !== 'undefined' && v instanceof FormData;

class CharityService {
  // ===== Public =====
  async getAllCharities(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = params.toString() ? `/charities?${params}` : '/charities';
    const res = await api.get(url);
    return res.data;
  }

  async getCharityById(id) {
    const res = await api.get(`/charities/${id}`);
    return res.data;
  }

  // ===== Authenticated: Charity profile =====
  async registerCharity(charityData) {
    const payload = {
      name: charityData?.organizationInfo?.name || charityData?.organizationName,
      description: charityData?.purposeOfRegistration,
      mission: charityData?.purposeOfRegistration,
      license_number: charityData?.documents?.license || 'pending_upload',
      license_document: charityData?.documents?.license || 'pending_upload',
      address: charityData?.organizationInfo?.address,
      city: charityData?.organizationInfo?.city || 'Unknown',
      phone: charityData?.organizationInfo?.phoneNumber || charityData?.organizationInfo?.phone,
      email: charityData?.organizationInfo?.email,
      website_url: charityData?.organizationInfo?.website || null,
    };
    const res = await api.post('/charities/register', payload);
    return res.data;
  }

  async getMyCharity() {
    const res = await api.get('/charities/my-charity');
    return res.data;
  }

  async updateMyCharity(charityData) {
    const res = await api.put('/charities/my-charity', charityData);
    return res.data;
  }

  async getCharityStats() {
    const res = await api.get('/charities/stats');
    return res.data;
  }

  // ===== Campaigns =====
  async createCampaign(data) {
    // Hỗ trợ cả JSON (chỉ text) và FormData (có file)
    if (isFormData(data)) {
      const res = await api.postForm('/charities/campaigns', data);
      return res.data;
    }
    const res = await api.post('/charities/campaigns', data);
    return res.data;
  }

  async getMyCampaigns(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = params.toString() ? `/charities/campaigns?${params}` : '/charities/campaigns';
    const res = await api.get(url);
    return res.data;
  }

  async getMyCampaignById(id) {
    const res = await api.get(`/charities/campaigns/${id}`);
    return res.data;
  }

  async updateMyCampaign(id, data) {
    // QUAN TRỌNG: dùng putForm khi là FormData
    if (isFormData(data)) {
      const res = await api.putForm(`/charities/campaigns/${id}`, data);
      return res.data;
    }
    const res = await api.put(`/charities/campaigns/${id}`, data);
    return res.data;
  }

  async deleteMyCampaign(id) {
    const res = await api.delete(`/charities/campaigns/${id}`);
    return res.data;
  }

  async addProgressUpdate(campaignId, updateData) {
    const res = await api.post(`/charities/campaigns/${campaignId}/progress`, updateData);
    return res.data;
  }

  async getCampaignStats(campaignId) {
    const res = await api.get(`/charities/campaigns/${campaignId}/stats`);
    return res.data;
  }

  // ===== Financial reports =====
  async createFinancialReport(reportData) {
    const res = await api.post('/charities/financial-reports', reportData);
    return res.data;
  }

  async getMyFinancialReports(filters = {}) {
    const params = new URLSearchParams();
    if (filters.year) params.append('year', filters.year);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const url = params.toString()
      ? `/charities/financial-reports?${params}`
      : '/charities/financial-reports';

    const res = await api.get(url);
    return res.data;
  }

  async getMyFinancialReportById(id) {
    const res = await api.get(`/charities/financial-reports/${id}`);
    return res.data;
  }

  async updateMyFinancialReport(id, reportData) {
    const res = await api.put(`/charities/financial-reports/${id}`, reportData);
    return res.data;
  }

  async deleteMyFinancialReport(id) {
    const res = await api.delete(`/charities/financial-reports/${id}`);
    return res.data;
  }

  async generateAutoReport(reportData) {
    const res = await api.post('/charities/financial-reports/generate', reportData);
    return res.data;
  }

  async submitFinancialReport(id) {
    const res = await api.post(`/charities/financial-reports/${id}/submit`);
    return res.data;
  }
}

export default new CharityService();
