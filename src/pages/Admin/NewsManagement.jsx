import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

/* ======= Options & Mappings (VI) ======= */
const categoryOptions = [
  { value: 'announcement', label: 'Thông báo' },
  { value: 'update', label: 'Cập nhật' },
  { value: 'campaign', label: 'Chiến dịch' },
  { value: 'charity', label: 'Tổ chức từ thiện' },
  { value: 'system', label: 'Hệ thống' },
];

const statusOptions = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Lưu trữ' },
];

const priorityOptions = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
  { value: 'urgent', label: 'Khẩn cấp' },
];

const priorityMap = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' };
const statusMap = { draft: 'Nháp', published: 'Đã xuất bản', archived: 'Lưu trữ' };
const categoryMap = {
  announcement: 'Thông báo',
  update: 'Cập nhật',
  campaign: 'Chiến dịch',
  charity: 'Tổ chức từ thiện',
  system: 'Hệ thống',
};

/* ======= Date helpers ======= */
function fmtDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  const date = d.toLocaleDateString('vi-VN');
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}
function fmtDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('vi-VN');
}

function NewsManagement() {
  /* ======= State ======= */
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(''); // '', 'true', 'false'

  // Modal/Form
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'announcement',
    status: 'draft',
    priority: 'medium',
    featured: false,
    image_url: '',
    tags: '',          // nhập dạng "tin tức, cập nhật"
    published_at: '',  // datetime-local (ISO rút gọn)
    expires_at: '',    // date
  });

  const resetForm = () => {
    setForm({
      title: '',
      summary: '',
      content: '',
      category: 'announcement',
      status: 'draft',
      priority: 'medium',
      featured: false,
      image_url: '',
      tags: '',
      published_at: '',
      expires_at: '',
    });
  };

  /* ======= Fetch list ======= */
  const fetchNews = () => {
    setLoading(true);
    setError('');
    api
      .get(`/admin/news`, {
        params: {
          page,
          limit,
          search: search || undefined,
          category: filterCategory || undefined,
          status: filterStatus || undefined,
          priority: filterPriority || undefined,
          featured: filterFeatured || undefined,
        },
      })
      .then((res) => {
        const rows = res.data.news || res.data.rows || res.data.data || [];
        const totalItems = res.data.pagination?.total || res.data.count || res.data.total || 0;
        setNews(rows);
        setTotal(totalItems);
      })
      .catch(() => setError('Không thể tải danh sách tin tức'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filterCategory, filterStatus, filterPriority, filterFeatured]);

  /* ======= Handlers ======= */
  const handleEdit = (item) => {
    setEditingNews(item);
    setForm({
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      category: item.category || 'announcement',
      status: item.status || 'draft',
      priority: item.priority || 'medium',
      featured: !!item.featured,
      image_url: item.image_url || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      published_at: item.published_at ? new Date(item.published_at).toISOString().slice(0, 16) : '',
      expires_at: item.expires_at ? new Date(item.expires_at).toISOString().slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá bài viết này?')) return;
    try {
      await api.delete(`/admin/news/${id}`);
      if (news.length === 1 && page > 1) setPage((p) => p - 1);
      fetchNews();
    } catch {
      alert('Xoá thất bại!');
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

    const payload = {
      title: form.title,
      summary: form.summary || undefined,
      content: form.content,
      category: form.category,
      status: form.status,
      priority: form.priority,
      featured: !!form.featured,
      image_url: form.image_url || undefined,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
    };

    try {
      if (editingNews) {
        await api.put(`/admin/news/${editingNews.news_id}`, payload);
      } else {
        await api.post(`/admin/news`, payload);
        setPage(1);
      }
      setShowForm(false);
      setEditingNews(null);
      resetForm();
      fetchNews();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lưu tin tức thất bại');
    }
  };

  /* ======= Render ======= */
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Quản lý tin tức</h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
          onClick={() => {
            resetForm();
            setEditingNews(null);
            setShowForm(true);
          }}
        >
          + Thêm tin tức
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tìm kiếm</label>
          <input
            className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 w-64"
            placeholder="Tìm tiêu đề/nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchNews())}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Chuyên mục</label>
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Trạng thái</label>
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Ưu tiên</label>
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg"
            value={filterPriority}
            onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả</option>
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Nổi bật</label>
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg"
            value={filterFeatured}
            onChange={(e) => { setFilterFeatured(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả</option>
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </div>

        <Button
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
          onClick={() => { setPage(1); fetchNews(); }}
        >
          Lọc
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : (
  <div className="rounded-2xl shadow-lg border border-gray-100 bg-white">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1100px] border-collapse table-auto">
      <thead>
        <tr className="bg-purple-50 text-sm">
          <th className="px-4 py-3 text-left font-semibold w-[26%]">Tiêu đề</th>
          <th className="px-4 py-3 text-left font-semibold w-[14%] whitespace-nowrap">Chuyên mục</th>
          <th className="px-4 py-3 text-center font-semibold w-[8%] whitespace-nowrap">Ưu tiên</th>
          <th className="px-4 py-3 text-center font-semibold w-[8%] whitespace-nowrap">Nổi bật</th>
          <th className="px-4 py-3 text-center font-semibold w-[12%] whitespace-nowrap">Trạng thái</th>
          <th className="px-4 py-3 text-left font-semibold w-[12%] whitespace-nowrap">Ngày xuất bản</th>
          <th className="px-4 py-3 text-left font-semibold w-[10%] whitespace-nowrap">Hết hạn</th>
          <th className="px-4 py-3 text-right font-semibold w-[6%] whitespace-nowrap">Lượt xem</th>
          <th className="px-4 py-3 text-left font-semibold w-[14%]">Tags</th>
          <th className="px-4 py-3 text-center font-semibold w-[12%] whitespace-nowrap">Hành động</th>
        </tr>
      </thead>

      <tbody className="text-sm">
        {news.map((item) => (
          <tr key={item.news_id} className="border-t align-middle">
            <td className="px-4 py-3 truncate">{item.title}</td>

            <td className="px-4 py-3 whitespace-nowrap">
              {categoryMap[item.category]}
            </td>

            <td className="px-4 py-3 text-center whitespace-nowrap">
              {priorityMap[item.priority]}
            </td>

            <td className="px-4 py-3 text-center">
              {item.featured && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                  Nổi bật
                </span>
              )}
            </td>

            <td className="px-4 py-3 text-center">
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs
                  ${item.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'draft'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'}`}
              >
                {statusMap[item.status]}
              </span>
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
              {fmtDateTime(item.published_at)}
            </td>

            <td className="px-4 py-3 whitespace-nowrap">
              {fmtDate(item.expires_at)}
            </td>

            <td className="px-4 py-3 text-right">
              {item.views}
            </td>

            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(','))
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={`${item.news_id}-tag-${i}`}
                      className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </td>

            <td className="px-4 py-3 text-center whitespace-nowrap">
              <div className="inline-flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(item.news_id)}
                  className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  Xóa
                </button>
                {item.status !== 'published' && (
                  <button
                    onClick={() => handlePublish(item.news_id)}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                  >
                    Xuất bản
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      )}

      {/* Pagination */}
      <div className="flex gap-2 justify-center mt-6">
        <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded px-4 py-1 bg-gray-200 hover:bg-gray-300"
        >
          Trước
        </Button>
        <span className="px-3 py-1 text-gray-700">Trang {page}</span>
        <Button
          disabled={news.length < limit}
          onClick={() => setPage(page + 1)}
          className="rounded px-4 py-1 bg-gray-200 hover:bg-gray-300"
        >
          Sau
        </Button>
      </div>

      {/* Modal Form (scrollable + sticky header/footer) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowForm(false);
              setEditingNews(null);
            }}
          />
          {/* modal */}
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100">
            {/* header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {editingNews ? 'Sửa tin tức' : 'Thêm tin tức'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingNews(null); }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* body */}
              <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tiêu đề */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700 font-medium">Tiêu đề</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      required
                      minLength={5}
                      maxLength={200}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  {/* Tóm tắt */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700 font-medium">Tóm tắt</label>
                    <textarea
                      value={form.summary}
                      onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                      rows={2}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  {/* Nội dung */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700 font-medium">Nội dung</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      required
                      rows={6}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  {/* Chuyên mục */}
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">Chuyên mục</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    >
                      {categoryOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">Trạng thái</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    >
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ưu tiên */}
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">Ưu tiên</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    >
                      {priorityOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nổi bật */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <label htmlFor="featured" className="text-gray-700">Đánh dấu nổi bật</label>
                  </div>

                  {/* Ảnh (URL) + preview */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700 font-medium">Ảnh (URL)</label>
                    <input
                      value={form.image_url}
                      onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://..."
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    {form.image_url && (
                      <img
                        src={form.image_url}
                        alt="preview"
                        className="mt-2 h-28 w-auto object-cover rounded border"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-gray-700 font-medium">Tags (cách nhau bởi dấu phẩy)</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                      placeholder="tin tức, cập nhật, hệ thống"
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  {/* Thời gian xuất bản / Hết hạn */}
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">Ngày xuất bản</label>
                    <input
                      type="datetime-local"
                      value={form.published_at}
                      onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Để trống nếu muốn BE tự set khi chuyển trạng thái “Đã xuất bản”.
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">Hết hạn</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-6 py-2"
                  onClick={() => { setShowForm(false); setEditingNews(null); }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-6 py-2 shadow"
                >
                  Lưu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsManagement;
