// src/services/notificationService.js
import api from './api';

class NotificationService {
  async getMine(params = {}) {
    // params: { page, limit, search, tab, type, order }
    const res = await api.get('/notifications/mine', { params });
    return res.data; // { status, items, total, page, limit, totalPages }
  }

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data; // { status, count }
  }

  async markRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data; // { status, data }
  }

  async markAllRead() {
    const res = await api.put('/notifications/read-all');
    return res.data; // { status, updated }
  }

  async deleteMine(id) {
    const res = await api.delete(`/notifications/mine/${id}`);
    return res.data;
  }

  async updateMine(id, payload) {
    const res = await api.put(`/notifications/mine/${id}`, payload);
    return res.data;
  }
}

export default new NotificationService();
