import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

// Helper format ngày
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
};

// Map danh mục
const categoryMap = {
  announcement: 'Thông báo',
  update: 'Cập nhật',
  campaign: 'Chiến dịch',
  charity: 'Nhà từ thiện',
  system: 'Hệ thống',
};

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });

  // Fetch news list
  const fetchNews = () => {
    setLoading(true);
    api.get(`/admin/news`, {
      params: {
        page,
        limit,
        search: search || undefined,
      },
    })
      .then(res => {
        setNews(res.data.news || res.data.rows || []);
        setTotal(res.data.pagination?.total || res.data.count || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách tin tức');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, [page, search, showForm]);

  // Form handlers
  const handleEdit = (item) => {
    setEditingNews(item);
    setForm({ title: item.title, content: item.content });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa tin tức này?')) {
      await api.delete(`/admin/news/${id}`);
      fetchNews();
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/admin/news/${id}/publish`);
      fetchNews();
    } catch {
      alert('Xuất bản thất bại!');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingNews) {
      await api.put(`/admin/news/${editingNews.news_id}`, {
        ...editingNews,
        title: form.title,
        content: form.content,
      });
    } else {
      await api.post(`/admin/news`, {
        title: form.title,
        content: form.content,
        category: 'announcement',
        priority: 'medium',
      });
    }
    setShowForm(false);
    setEditingNews(null);
    fetchNews();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-bold text-global-1">Quản lý tin tức</h1>
        <Button
          className="bg-button-4 hover:bg-button-3 text-white font-semibold px-5 py-2 rounded-full shadow transition"
          onClick={() => { setShowForm(true); setEditingNews(null); setForm({ title: '', content: '' }); }}
        >
          + Thêm tin mới
        </Button>
      </div>

      <div className="mb-6 flex gap-3">
        <input
          className="border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-button-4 w-64"
          placeholder="Tìm kiếm tiêu đề..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center text-global-4 py-10">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="rounded-2xl shadow-lg overflow-hidden border border-gray-100 bg-white">
          <table className="w-full text-left font-inter">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <th className="py-3 px-4 font-bold text-global-1">Tiêu đề</th>
                <th className="py-3 px-4 font-bold text-global-1">Danh mục</th>
                <th className="py-3 px-4 font-bold text-global-1 text-center">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-global-1">Ngày tạo</th>
                <th className="py-3 px-4 font-bold text-global-1">Lượt xem</th>
                <th className="py-3 px-4 font-bold text-global-1 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-global-4 py-12 text-lg bg-blue-50">Chưa có tin tức.</td>
                </tr>
              ) : news.map((item, idx) => (
                <tr
                  key={item.news_id}
                  className={
                    `border-b border-gray-100 transition-all ` +
                    (idx % 2 === 0 ? 'bg-white' : 'bg-blue-50') +
                    ' hover:shadow-md hover:bg-green-50/60'
                  }
                >
                  <td className="py-3 px-4 font-medium text-global-1 max-w-xs truncate">{item.title}</td>
                  <td className="py-3 px-4 text-global-2">{categoryMap[item.category] || item.category}</td>
                  <td className="py-3 px-4 text-center">
                    {item.status === 'published' ? (
                      <span className="text-green-600 font-semibold">Đã xuất bản</span>
                    ) : (
                      <span className="text-gray-400">Chưa xuất bản</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-global-2">{formatDate(item.created_at)}</td>
                  <td className="py-3 px-4 text-global-2">{item.views}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 py-1" onClick={() => handleEdit(item)}>Sửa</Button>
                      <Button size="sm" variant="danger" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-1" onClick={() => handleDelete(item.news_id)}>Xóa</Button>
                      {item.status !== 'published' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 flex items-center gap-1"
                          onClick={() => handlePublish(item.news_id)}
                        >
                          <CheckCircle size={16} />
                          Xuất bản
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex gap-2 justify-center mt-6">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-full px-4 py-1 bg-gray-200 hover:bg-gray-300">Trước</Button>
        <span className="px-3 py-1 text-global-1">Trang {page}</span>
        <Button disabled={news.length < limit} onClick={() => setPage(page + 1)} className="rounded-full px-4 py-1 bg-gray-200 hover:bg-gray-300">Sau</Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md" onSubmit={handleFormSubmit}>
            <h2 className="text-xl font-bold mb-6 text-center text-global-1">{editingNews ? 'Sửa tin tức' : 'Thêm tin tức'}</h2>
            <div className="mb-4">
              <label className="block mb-1 text-global-2">Tiêu đề</label>
              <input className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-button-4" name="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required minLength={5} />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-global-2">Nội dung</label>
              <textarea className="border border-gray-300 px-4 py-2 rounded-lg w-full min-h-[120px] focus:outline-none focus:ring-2 focus:ring-button-4" name="content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
            </div>
            <div className="flex gap-3 mt-6 justify-center">
              <Button type="submit" className="bg-button-4 hover:bg-button-3 text-white rounded-full px-6 py-2">Lưu</Button>
              <Button type="button" variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-global-1 rounded-full px-6 py-2" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
