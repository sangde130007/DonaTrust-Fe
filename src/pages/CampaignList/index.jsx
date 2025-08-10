import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import campaignService from '../../services/campaignService';

const API_ORIGIN = 'http://localhost:5000';

/** Chuẩn hoá URL ảnh từ BE */
const resolveImageUrl = (p) => {
  if (!p) return '';
  let url = String(p).trim().replace(/\\/g, '/');
  if (/^https?:\/\//i.test(url)) return url;
  url = url.replace(/^[A-Za-z]:\/.*?(\/uploads\/)/, '/uploads/');
  if (!url.startsWith('/')) url = '/' + url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};

/** Danh mục mặc định (id phải khớp với BE nếu có filter theo category) */
const defaultCategories = [
  { icon: '/images/img_logo_24x27.png', label: 'Thảm họa thiên nhiên', id: 'disaster' },
  { icon: '/images/img_logo_1.png',     label: 'Giáo dục',            id: 'education' },
  { icon: '/images/img_logo_27x27.png', label: 'Trẻ em',              id: 'children' },
  { icon: '/images/img_logo_2.png',     label: 'Người nghèo',         id: 'poverty' },
  { icon: '/images/img_logo_3.png',     label: 'Người già',           id: 'elderly' },
  { icon: '/images/img_logo_4.png',     label: 'Người khuyết tật',    id: 'disability' },
  { icon: '/images/img_logo_5.png',     label: 'Bệnh hiểm nghèo',     id: 'health' },
  { icon: '/images/img_logo_6.png',     label: 'Vùng núi',            id: 'community' },
  { icon: '/images/img_logo_7.png',     label: 'Môi trường',          id: 'environment' },
];

const CampaignListPage = () => {
  const [searchParams] = useSearchParams();

  // Filters
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'completed'
  const [selectedCategory, setSelectedCategory] = useState('');

  // Data
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  const firstLoadRef = useRef(true);

  // Fetch data
  useEffect(() => {
    const controller = new AbortController();

    const fetchCampaigns = async () => {
      try {
        setError(null);
        if (firstLoadRef.current) setIsLoading(true);

        const searchQuery = searchParams.get('search')?.trim();
        const filters = {
          search: searchQuery || undefined,
          status: activeFilter === 'completed' ? 'completed' : 'active',
          category: selectedCategory || undefined,
          page,
          limit: pageSize,
        };

        const res = await campaignService.getAllCampaigns(filters, {
          signal: controller.signal,
        });

        setCampaigns(res.campaigns || []);
        setTotalCampaigns(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
          console.error(err);
          setError('Không thể tải chiến dịch. Vui lòng thử lại sau.');
        }
      } finally {
        setIsLoading(false);
        firstLoadRef.current = false;
      }
    };

    fetchCampaigns();
    return () => controller.abort();
  }, [searchParams, activeFilter, selectedCategory, page, pageSize]);

  // Reset về trang 1 khi đổi filter/category/search
  useEffect(() => { setPage(1); }, [activeFilter, selectedCategory, searchParams]);

  // Handlers
  const handleFilterChange = (filter) => setActiveFilter(filter);
  const handleCategorySelect = (catId) =>
    setSelectedCategory((prev) => (prev === catId ? '' : catId));

  // Components
  const CampaignCard = ({ campaign }) => {
    const cover = resolveImageUrl(campaign.image_url) || '/images/img_image_18.png';
    const logo  = resolveImageUrl(campaign.charity?.logo_url) || '/images/img_ellipse_8_20x21.png';
    const current = Number(campaign.current_amount || 0);
    const goal    = Math.max(1, Number(campaign.goal_amount || 1));
    const pct     = Math.min((current / goal) * 100, 100);

    return (
      <div className="relative w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[420px] overflow-hidden">
        {/* Cover */}
        <div className="relative w-full bg-white">
          <div className="aspect-[16/9] w-full">
            <img
              src={cover}
              alt={campaign.title}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/images/img_image_18.png'; }}
            />
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-pink-500 rounded">
            {campaign.category || 'Tổng quát'}
          </div>
        </div>

        {/* Org logo */}
        <img
          src={logo}
          alt="Organization"
          loading="lazy"
          className="w-10 h-10 object-contain bg-white rounded-full absolute -top-5 left-4 border-2 border-white shadow"
          onError={(e) => { e.currentTarget.src = '/images/img_ellipse_8_20x21.png'; }}
        />

        {/* Body */}
        <div className="flex flex-col flex-1 px-4 pt-6 pb-4">
          <p className="mb-1 text-xs text-center text-gray-500">
            {campaign.charity?.name || 'Tổ chức không xác định'}
          </p>
          <h3 className="mb-2 text-sm font-bold text-center line-clamp-2">{campaign.title}</h3>

          {/* Progress */}
          <div className="mb-1 w-full h-2 bg-gray-200 rounded">
            <div className="h-full bg-pink-500 rounded" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mb-1 text-xs">
            <span>{new Intl.NumberFormat('vi-VN').format(current)} VND</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Mục tiêu: {new Intl.NumberFormat('vi-VN').format(goal)} VND
          </p>

          <div className="mt-auto text-center">
            <Link to={`/campaign/${campaign.campaign_id}`}>
              <button className="px-4 py-2 text-xs font-semibold text-white bg-pink-500 rounded hover:bg-pink-600">
                Chi tiết
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxBtns = 7;
    let start = Math.max(1, page - 2);
    let end   = Math.min(totalPages, start + maxBtns - 1);
    if (end - start + 1 < maxBtns) start = Math.max(1, end - maxBtns + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    const base = 'px-3 py-1 text-sm rounded border transition-colors select-none';
    const active = 'bg-pink-500 text-white border-pink-500';
    const normal = 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';

    return (
      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`${base} ${page === 1 ? 'opacity-50 cursor-not-allowed' : normal}`}
          aria-label="Trang trước"
        >
          ‹ Trước
        </button>

        {start > 1 && (
          <>
            <button onClick={() => setPage(1)} className={`${base} ${normal}`}>1</button>
            {start > 2 && <span className="px-1 text-gray-500">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`${base} ${p === page ? active : normal}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-gray-500">…</span>}
            <button onClick={() => setPage(totalPages)} className={`${base} ${normal}`}>
              {totalPages}
            </button>
          </>
        )}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={`${base} ${page === totalPages ? 'opacity-50 cursor-not-allowed' : normal}`}
          aria-label="Trang sau"
        >
          Sau ›
        </button>
      </div>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen shadow-2xl bg-global-3">
        <div className="flex flex-1 justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen shadow-2xl bg-global-3">
      {/* ====== TIÊU ĐỀ ====== */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 pt-6">
        <div className="mb-4 text-center">
          <h2 className="text-[26px] font-bold font-inter text-global-1 mb-2">
            {activeFilter === 'active' ? 'Các chiến dịch hiện đang gây quỹ' : 'Các chiến dịch đã kết thúc'}
            {selectedCategory ? ` • ${defaultCategories.find(c => c.id === selectedCategory)?.label || ''}` : ''}
          </h2>
          <p className="text-[15px] font-inter text-global-17">
            Chọn tham gia vào lĩnh vực mà bạn quan tâm nhất.
          </p>
        </div>
      </div>

      {/* ====== BỘ LỌC (Status + Category) ====== */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-2 mb-6">
        {/* Status */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {['active', 'completed'].map((key) => {
            const isActive = activeFilter === key;
            const base = 'px-4 py-2 rounded-full text-sm border transition-colors';
            const on  = 'bg-pink-500 text-white border-pink-500';
            const off = 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
            return (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`${base} ${isActive ? on : off}`}
              >
                {key === 'active' ? 'Đang gây quỹ' : 'Đã kết thúc'}
              </button>
            );
          })}
        </div>

        {/* Category */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { id: '', label: 'Tất cả', icon: '/images/img_logo_24x27.png' },
            ...defaultCategories,
          ].map((c) => {
            const isSel = selectedCategory === c.id;
            const base = 'flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-colors';
            const on  = 'bg-pink-50 text-pink-600 border-pink-500';
            const off = 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
            return (
              <button
                key={c.id || 'all'}
                onClick={() => (c.id ? handleCategorySelect(c.id) : setSelectedCategory(''))}
                className={`${base} ${isSel ? on : off}`}
                aria-pressed={isSel}
              >
                <img
                  src={c.icon}
                  alt=""
                  className="w-5 h-5 object-contain"
                  onError={(e)=>{ e.currentTarget.style.display='none'; }}
                />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        {error && (
          <div className="p-4 mx-auto mb-8 max-w-md bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-center text-red-600">{error}</p>
          </div>
        )}

        {campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[24px] gap-y-8 justify-items-stretch mb-8">
              {campaigns.map((c) => (
                <CampaignCard key={c.campaign_id} campaign={c} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination />

            {/* Summary */}
            <div className="mt-4 mb-12 text-center text-sm text-global-17">
              Trang {page}/{totalPages} — Tổng {totalCampaigns} chiến dịch
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-6">
              <img
                src="/images/img_image_18.png"
                alt="No campaigns"
                className="mx-auto w-32 h-32 opacity-50 grayscale"
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-global-1">Không tìm thấy chiến dịch nào</h3>
            <p className="mb-6 text-global-17">
              {searchParams.get('search')
                ? `Không có chiến dịch nào phù hợp với tìm kiếm "${searchParams.get('search')}"`
                : `Hiện tại không có chiến dịch ${activeFilter === 'active' ? 'đang hoạt động' : 'đã kết thúc'}${selectedCategory ? ' trong danh mục đã chọn' : ''}.`}
            </p>

          </div>
        )}
      </div>

    </div>
  );
};

export default CampaignListPage;
