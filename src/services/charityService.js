// src/services/charityService.js
import api from './api';

const isFormData = (v) => typeof FormData !== 'undefined' && v instanceof FormData;

export const toAbsoluteUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (import.meta?.env?.VITE_API_ORIGIN || '').replace(/\/+$/, '');
  return path ? `${base}/${path.replace(/^\/+/, '')}` : null;
};

class CharityService {
  /* ===================== Public ===================== */
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

  /* ===================== Auth: Charity profile ===================== */

  /**
   * Đăng ký tổ chức từ thiện
   * - Nếu truyền FormData: gửi thẳng (PHẢI là các field phẳng, không có 'data')
   * - Nếu truyền object + có File/Blob: tự build FormData phẳng đúng field BE
   * - Nếu không có file: gửi JSON
   */
  async registerCharity(input) {
    // 1) Caller đã đưa sẵn FormData -> gửi thẳng
    if (isFormData(input)) {
      const res = await (api.postForm
        ? api.postForm('/charities/register', input)
        : api.post('/charities/register', input, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }));
      return res.data;
    }

    // 2) Object có file -> tự đóng FormData (phẳng)
    const org = input?.organizationInfo || {};
    const docs = input?.documents || {};

    const hasFiles =
      (typeof File !== 'undefined' &&
        (docs.license instanceof File ||
         docs.description instanceof File ||
         docs.logo instanceof File)) ||
      (typeof Blob !== 'undefined' &&
        (docs.license instanceof Blob ||
         docs.description instanceof Blob ||
         docs.logo instanceof Blob));

    if (hasFiles) {
      const fd = new FormData();

      // TEXT (tên field khớp BE)
      const purpose = (input?.purposeOfRegistration || '').toString();
      fd.append('name', org.name || input?.organizationName || '');
      fd.append('description', purpose);
      fd.append('mission', purpose);
      fd.append('license_number', docs.licenseNumber || docs.license_number || 'TMP-' + Date.now());
      fd.append('address', org.address || '');
      fd.append('city', org.city || 'Unknown');
      fd.append('phone', org.phoneNumber || org.phone || '');
      fd.append('email', org.email || '');
      if (org.website) fd.append('website_url', org.website);

      // FILES (tên field khớp BE)
      if (docs.license)     fd.append('license', docs.license);
      if (docs.description) fd.append('description', docs.description);
      if (docs.logo)        fd.append('logo', docs.logo);

      const res = await (api.postForm
        ? api.postForm('/charities/register', fd)
        : api.post('/charities/register', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }));
      return res.data;
    }

    // 3) Không có file -> JSON
    const payload = {
      name: org.name || input?.organizationName,
      description: input?.purposeOfRegistration || '',
      mission: input?.purposeOfRegistration || '',
      license_number: docs.licenseNumber || docs.license_number || 'TMP-' + Date.now(),
      address: org.address || '',
      city: org.city || 'Unknown',
      phone: org.phoneNumber || org.phone || '',
      email: org.email || '',
      website_url: org.website || null,
      // nếu đã có URL sẵn (upload nơi khác)
      license_url: docs.license_url || '',
      description_url: docs.description_url || '',
      logo_url: docs.logo_url || '',
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

  /* ===================== Campaigns ===================== */

  async createCampaign(data) {
    if (isFormData(data)) {
      const res = await (api.postForm
        ? api.postForm('/charities/campaigns', data)
        : api.post('/charities/campaigns', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }));
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
    if (isFormData(data)) {
      const res = await (api.putForm
        ? api.putForm(`/charities/campaigns/${id}`, data)
        : api.put(`/charities/campaigns/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }));
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

  /* ===================== Financial reports ===================== */

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
