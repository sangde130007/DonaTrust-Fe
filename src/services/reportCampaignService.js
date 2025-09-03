// src/services/reportCampaignService.js
import api from './api'; // axios instance có baseURL + attach token

export const fetchReportCampaigns = async (params) => {
  const { data } = await api.get('/admin/report-campaigns', { params });
  return data; // { items, pagination }
};

export const fetchReportCampaignDetail = async (id) => {
  const { data } = await api.get(`/admin/report-campaigns/${id}`);
  return data;
};

export const updateReportCampaignStatus = async (id, status) => {
  const { data } = await api.put(`/admin/report-campaigns/${id}/status`, { status });
  return data; // { message, status }
};
