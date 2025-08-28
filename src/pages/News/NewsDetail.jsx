// src/pages/News/NewsDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Bookmark, Share2, Tag, Eye } from 'lucide-react';
import api from '../../services/api';

const categoryMap = {
  announcement: 'Thông báo',
  update: 'Cập nhật',
  campaign: 'Chiến dịch',
  charity: 'Tổ chức từ thiện',
  system: 'Hệ thống',
};

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', year: 'numeric' }) : '';

const Pill = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`} >
    {children}
  </span>
);

const DetailRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 shrink-0 text-purple-600">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-gray-900">{children}</div>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 w-2/3 bg-gray-200 rounded mb-3" />
    <div className="h-4 w-1/3 bg-gray-200 rounded mb-6" />
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-gray-100 h-72 rounded" />
      <div className="bg-gray-100 h-72 rounded" />
    </div>
  </div>
);

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const shareUrl = useMemo(() => window.location.href, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // public endpoints: /news/:id và /news?category=...&limit=...
        const res = await api.get(`/news/${id}`);
        const n = res.data?.news || res.data;
        setItem(n);

        // liên quan theo chuyên mục
        if (n?.category) {
          const r = await api.get('/news', { params: { status: 'published', category: n.category, limit: 6 } });
          const rows = r.data.news || r.data.rows || r.data.data || [];
          setRelated(rows.filter((x) => x.news_id !== n.news_id));
        }
      } catch (e) {
        navigate('/news'); // nếu không tìm thấy, quay về danh sách
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);
useEffect(() => {
  if (!id) return;  
  // Gọi POST (hoặc PUT) để đếm view
  api.post(`/news/${id}/view`).catch(() => {});
}, [id]);
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <span className="font-semibold">{categoryMap[item.category] || 'Tin tức'}</span>
          <span>•</span>
          <span className="text-gray-500">{fmtDateTime(item.published_at)}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-gray-500"><Eye className="w-4 h-4" /> {item.views ?? 0}</span>
        </div>

        <h1 className="mt-1 text-3xl md:text-4xl font-extrabold text-gray-900">
          {item.title}
        </h1>

        {/* actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            onClick={() => {/* bookmark handler (tùy bạn) */}}
          >
            <Bookmark className="w-4 h-4" /> Quan tâm
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Đã sao chép liên kết!');
              } catch {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
              }
            }}
          >
            <Share2 className="w-4 h-4" /> Chia sẻ
          </button>
          {item.featured && <Pill className="bg-purple-100 text-purple-700">Nổi bật</Pill>}
          <Pill className="bg-gray-100 text-gray-700">{categoryMap[item.category] || 'Khác'}</Pill>
          <Pill className="bg-amber-100 text-amber-700 capitalize">{item.priority || 'medium'}</Pill>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-6">
          {/* Giới thiệu */}
          {item.summary && (
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Giới thiệu</h2>
              <p className="leading-relaxed text-gray-800 whitespace-pre-line">{item.summary}</p>
            </section>
          )}

          {/* Chi tiết / Nội dung */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Chi tiết</h2>
            <div className="space-y-4">
              {item.location && (
                <DetailRow
                  label="Địa điểm"
                  icon={<span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-600" />}
                >
                  {item.location}
                </DetailRow>
              )}

              {item.source_url && (
                <DetailRow label="Nguồn">
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:underline break-all"
                  >
                    {item.source_url}
                  </a>
                </DetailRow>
              )}

              <div className="pt-2 border-t">
                <div className="prose max-w-none prose-p:leading-7 prose-headings:mt-4 prose-a:text-purple-600">
                  {/* Nội dung rich text/markdown: ở đây hiển thị thẳng text */}
                  <p className="whitespace-pre-line text-gray-800">{item.content}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tags */}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    <Tag className="w-3.5 h-3.5" /> {t}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: cover image / gallery */}
        <aside className="space-y-4">
          {item.image_url && (
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <img src={item.image_url} alt={item.title} className="w-full h-[360px] object-cover" />
            </div>
          )}
          {Array.isArray(item.gallery_images) && item.gallery_images.length > 0 && (
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hình ảnh</h3>
              <div className="grid grid-cols-3 gap-2">
                {item.gallery_images.slice(0, 6).map((src, i) => (
                  <img key={i} src={src} alt={`img-${i}`} className="h-24 w-full object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h3 className="text-xl font-bold mb-4">Bài viết liên quan</h3>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {related.slice(0, 6).map((n) => (
              <Link
                key={n.news_id}
                to={`/news/${n.news_id}`}
                className="rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
              >
                {n.image_url && <img src={n.image_url} alt={n.title} className="h-40 w-full object-cover" />}
                <div className="p-3">
                  <div className="text-xs text-gray-500 mb-1">{fmtDateTime(n.published_at)}</div>
                  <div className="font-semibold line-clamp-2">{n.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comment placeholder (tùy tích hợp sau) */}
      <section className="mt-10 rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Bình luận</h3>
        <div className="text-gray-500 text-sm">
          Tính năng bình luận sẽ được cập nhật sau.
        </div>
      </section>
    </div>
  );
}
