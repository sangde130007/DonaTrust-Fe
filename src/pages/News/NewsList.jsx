import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

/* ====== Maps / Options ====== */
const categoryOptions = [
  { value: '', label: 'Tất cả chuyên mục' },
  { value: 'announcement', label: 'Thông báo' },
  { value: 'update', label: 'Cập nhật' },
  { value: 'campaign', label: 'Chiến dịch' },
  { value: 'charity', label: 'Tổ chức từ thiện' },
  { value: 'system', label: 'Hệ thống' },
];

const sortOptions = [
  { value: 'published_at_desc', label: 'Mới nhất' },
  { value: 'published_at_asc', label: 'Cũ nhất' },
  { value: 'views_desc', label: 'Xem nhiều' },
  { value: 'title_asc', label: 'A → Z' },
];

const categoryMap = {
  announcement: 'Thông báo',
  update: 'Cập nhật',
  campaign: 'Chiến dịch',
  charity: 'Tổ chức từ thiện',
  system: 'Hệ thống',
};

function fmtDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* ====== Card (1 item) ====== */
const NewsCard = ({ item }) => (
  <article className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition">
    {item.image_url && (
      <Link to={`/news/${item.news_id}`}>
        <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" />
      </Link>
    )}
    <div className="p-4">
      <Link to={`/news/${item.news_id}`} className="block">
        <h2 className="text-lg font-semibold line-clamp-2 hover:text-purple-700">
          {item.title}
        </h2>
      </Link>
      <p className="mt-1 text-sm text-gray-500">
        {categoryMap[item.category] || 'Khác'} • {fmtDate(item.published_at)} •{' '}
        {item.views ?? 0} lượt xem
      </p>
      {item.summary && <p className="mt-2 text-gray-700 line-clamp-3">{item.summary}</p>}
      {item.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 4).map((t, i) => (
            <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  </article>
);

/* ====== Skeleton while loading ====== */
const CardSkeleton = () => (
  <div className="rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse">
    <div className="h-44 w-full bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-5 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
    </div>
  </div>
);

/* ====== Main List Page ====== */
const NewsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // state đồng bộ với URL
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'published_at_desc');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [limit, setLimit] = useState(Number(searchParams.get('limit') || 8));

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // sync URL
  useEffect(() => {
    const params = {
      ...(query ? { q: query } : {}),
      ...(category ? { category } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(tag ? { tag } : {}),
      ...(sort ? { sort } : {}),
      ...(page !== 1 ? { page } : {}),
      ...(limit !== 8 ? { limit } : {}),
    };
    setSearchParams(params, { replace: true });
  }, [query, category, from, to, tag, sort, page, limit, setSearchParams]);

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/news', {
          params: {
            status: 'published',
            search: query || undefined,
            category: category || undefined,
            tag: tag || undefined,
            date_from: from || undefined,
            date_to: to || undefined,
            sort, // e.g. 'published_at_desc'
            page,
            limit,
          },
        });
        const rows = res.data.news || res.data.rows || res.data.data || [];
        const totalItems = res.data.pagination?.total || res.data.total || res.data.count || 0;
        setItems(rows);
        setTotal(totalItems);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query, category, from, to, tag, sort, page, limit]);

  const submitFilters = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">Tin tức</h1>
        <p className="mt-2 max-w-2xl text-purple-100">
          Cập nhật các thông báo, chiến dịch, và tin tức hệ thống mới nhất từ DonaTrust.
        </p>
      </section>

      {/* Filters */}
      <form
        onSubmit={submitFilters}
        className="mb-6 rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm"
      >
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Tìm kiếm */}
          <div className="md:col-span-4">
            <label className="block text-sm text-gray-600 mb-1">Tìm kiếm</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tiêu đề, nội dung…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          {/* Chuyên mục */}
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">Chuyên mục</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 pr-8"
            >
              {categoryOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">Sắp xếp</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 pr-8"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Hiển thị / trang */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Hiển thị</label>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="w-[92px] rounded-lg border border-gray-300 px-3 py-2 pr-8"
              >
                {[6, 8, 12, 16, 24].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">/ trang</span>
            </div>
          </div>

          {/* Nút */}
          <div className="md:col-span-12">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('');
                  setFrom('');
                  setTo('');
                  setTag('');
                  setSort('published_at_desc');
                  setLimit(8);
                  setPage(1);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          Không có bài viết phù hợp.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => <NewsCard key={n.news_id} item={n} />)}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-600">
          Trang {page}/{totalPages} • Tổng {total} bài
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50"
          >
            ← Trước
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsList;
