import React, { useState, useEffect, useMemo } from 'react';
import Slider from '../../components/ui/Slider';
import PagerIndicator from '../../components/ui/PagerIndicator';
import Button from '../../components/ui/Button';
import campaignService from '../../services/campaignService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

/* ========= Base URL & Helpers ========= */

// Ưu tiên VITE_API_BASE_URL và bỏ hậu tố /api nếu có; fallback sang origin hiện tại
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/i, '') ||
  window.location.origin;

// Ảnh tĩnh trong public/, an toàn với BASE_URL khi deploy dưới sub-path
const publicImg = (p) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${p.startsWith('/') ? p : `/${p}`}`;

/**
 * Chuẩn hóa URL ảnh:
 * - Giữ nguyên nếu là http(s):// hoặc data:
 * - Chuẩn hóa backslash -> slash
 * - Cắt prefix kiểu "C:/.../uploads/..." thành "/uploads/..."
 * - Nếu bắt đầu bằng "/uploads/" -> ghép với API_BASE_URL
 * - Các trường hợp còn lại trả về nguyên (ví dụ /images/...)
 */
const resolveImageUrl = (p) => {
  if (!p) return '';
  let url = String(p).trim();

  if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url; // http(s) hoặc data:

  url = url.replace(/\\/g, '/'); // chuẩn hóa \

  // Cắt prefix path local Windows -> /uploads/...
  url = url.replace(/^[A-Za-z]:\/.*?(\/uploads\/)/, '/uploads/');

  // Đảm bảo có slash đầu
  if (!url.startsWith('/')) url = '/' + url;

  // Upload nội bộ -> ghép base
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;

  // Trường hợp khác (/images/...), để nguyên cho FE assets
  return url;
};

/* ========= Admin Dashboard ========= */

const AdminDashboard = ({ stats }) => {
  const safe = (v) => (typeof v === 'number' ? v : Number(v || 0));

  const pieData = {
    labels: ['Người dùng', 'Tổ chức từ thiện', 'Chiến dịch', 'Quyên góp', 'Tin tức', 'Số tiền quyên góp'],
    datasets: [
      {
        data: [
          safe(stats?.totalUsers),
          safe(stats?.totalCharities),
          safe(stats?.totalCampaigns),
          safe(stats?.totalDonations),
          safe(stats?.totalNews),
          safe(stats?.totalDonationAmount),
        ],
        backgroundColor: ['#3b82f6', '#22c55e', '#facc15', '#ec4899', '#6366f1', '#f472b6'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Tổ chức chờ duyệt', 'Chiến dịch chờ duyệt', 'Phê duyệt chờ xử lý'],
    datasets: [
      {
        label: 'Chờ duyệt',
        data: [safe(stats?.pendingCharities), safe(stats?.pendingCampaigns), safe(stats?.pendingApprovals)],
        backgroundColor: '#f59e42',
        borderRadius: 6,
      },
    ],
  };

  const chartContainerClass =
    'rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8 flex flex-col items-center mb-10 border border-blue-100';

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="px-4 py-10 mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-700">Bảng điều khiển quản trị</h1>

        <div className="grid grid-cols-2 gap-6 mb-10 md:grid-cols-4">
          <div className="p-6 text-center bg-blue-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-700">{safe(stats?.totalUsers)}</div>
            <div className="mt-1 text-gray-600">Tổng người dùng</div>
          </div>
          <div className="p-6 text-center bg-green-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-700">{safe(stats?.totalCharities)}</div>
            <div className="mt-1 text-gray-600">Tổng tổ chức từ thiện</div>
          </div>
          <div className="p-6 text-center bg-yellow-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-700">{safe(stats?.totalCampaigns)}</div>
            <div className="mt-1 text-gray-600">Tổng chiến dịch</div>
          </div>
          <div className="p-6 text-center bg-pink-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-pink-700">{safe(stats?.totalNews)}</div>
            <div className="mt-1 text-gray-600">Tổng tin tức</div>
          </div>
        </div>

        <div className={chartContainerClass}>
          <h2 className="mb-6 text-xl font-extrabold tracking-tight text-blue-700 uppercase drop-shadow">
            Tổng quan phân phối
          </h2>
          <div className="w-full max-w-xs">
            <Pie
              data={pieData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: { size: 15, family: 'inherit', weight: 'bold' },
                      color: '#334155',
                      padding: 18,
                      boxWidth: 22,
                      usePointStyle: true,
                    },
                    onHover: (e) => {
                      if (e?.native?.target) e.native.target.style.cursor = 'pointer';
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.label || '';
                        if (label) label += ': ';
                        label += context.parsed;
                        return label;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          <div className="p-6 text-center bg-orange-50 rounded-lg shadow">
            <div className="text-xl font-bold text-orange-700">{safe(stats?.pendingCharities)}</div>
            <div className="mt-1 text-gray-600">Tổ chức chờ duyệt</div>
          </div>
          <div className="p-6 text-center bg-red-50 rounded-lg shadow">
            <div className="text-xl font-bold text-red-700">{safe(stats?.pendingCampaigns)}</div>
            <div className="mt-1 text-gray-600">Chiến dịch chờ duyệt</div>
          </div>
          <div className="p-6 text-center bg-purple-50 rounded-lg shadow">
            <div className="text-xl font-bold text-purple-700">{safe(stats?.pendingApprovals)}</div>
            <div className="mt-1 text-gray-600">Phê duyệt chờ xử lý</div>
          </div>
        </div>

        <div className={chartContainerClass}>
          <h2 className="mb-6 text-xl font-extrabold tracking-tight text-blue-700 uppercase drop-shadow">
            Tổng quan chờ duyệt
          </h2>
          <div className="w-full max-w-2xl">
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { size: 15, family: 'inherit', weight: 'bold' },
                      color: '#334155',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: '#e0e7ef', borderDash: [4, 4] },
                    ticks: {
                      stepSize: 1,
                      font: { size: 15, family: 'inherit', weight: 'bold' },
                      color: '#334155',
                    },
                  },
                },
                hover: { mode: 'nearest', intersect: true },
                animation: { duration: 900, easing: 'easeOutQuart' },
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-2 text-lg font-bold text-gray-700">Tổng số tiền quyên góp</div>
            <div className="text-2xl font-bold text-green-700">
              {safe(stats?.totalDonationAmount).toLocaleString('vi-VN')} VND
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-2 text-lg font-bold text-gray-700">Tổng lượt quyên góp</div>
            <div className="text-2xl font-bold text-blue-700">{safe(stats?.totalDonations)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========= Home ========= */

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Default categories (chỉ giữ label; icon sẽ ép theo map)
  const defaultCategories = [
    { label: 'Thảm họa thiên nhiên' },
    { label: 'Giáo dục' },
    { label: 'Trẻ em' },
    { label: 'Người nghèo' },
    { label: 'Người già' },
    { label: 'Người khuyết tật' },
    { label: 'Bệnh hiểm nghèo' },
    { label: 'Vùng núi' },
    { label: 'Môi trường' },
  ];

  const organizations = [
    { id: 1, name: 'Quỹ Từ thiện Nâng bước\ntuổi thơ', amount: '53,482,393 VND', image: '/images/img_image_18_160x160.png' },
    { id: 2, name: 'Quỹ vì Trẻ em khuyết tật\nViệt Nam', amount: '53,482,393 VND', image: '/images/img_image_18_1.png' },
    { id: 3, name: 'Trung tâm Con người và Thiên nhiên', amount: '53,482,393 VND', image: '/images/img_image_18_2.png' },
  ];

  // Slides cho hero
  const slides = useMemo(() => ([
    {
      title: 'CHUNG TAY XÂY DỰNG CỘNG ĐỒNG TỐT ĐẸP HƠN!',
      subtitle: 'Khám phá và hỗ trợ các dự án từ thiện đáng tin cậy.',
      buttonText: 'KHÁM PHÁ CHIẾN DỊCH',
      backgroundImage: '/images/bacground_homepage.jpg',
    },
    {
      title: 'CHUNG TAY XÂY DỰNG CỘNG ĐỒNG TỐT ĐẸP HƠN!',
      subtitle: 'Khám phá và hỗ trợ các dự án từ thiện đáng tin cậy.',
      buttonText: 'KHÁM PHÁ CHIẾN DỊCH',
      backgroundImage: '/images/img_.png',
    },
  ]), []);

  // Fetch featured campaigns & categories song song
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [campaignsResponse, categoriesResponse] = await Promise.allSettled([
          campaignService.getFeaturedCampaigns(),
          campaignService.getCategories(),
        ]);

        // campaigns: service đã trả res.data -> value có thể là [] hoặc { campaigns: [] }
        if (campaignsResponse.status === 'fulfilled') {
          const v = campaignsResponse.value;
          setCampaigns(Array.isArray(v?.campaigns) ? v.campaigns : (Array.isArray(v) ? v : []));
        } else {
          console.warn('Failed to fetch campaigns:', campaignsResponse.reason);
          setCampaigns([]);
        }

        // categories: service đã trả res.data -> value chính là mảng; nếu fail → dùng default
        if (categoriesResponse.status === 'fulfilled') {
          const cv = categoriesResponse.value;
          setCategories(Array.isArray(cv) && cv.length ? cv : defaultCategories);
        } else {
          console.warn('Failed to fetch categories:', categoriesResponse.reason);
          setCategories(defaultCategories);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setCampaigns([]);
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Admin stats
  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdminLoading(true);
      api
        .get('/admin/dashboard/stats')
        .then((res) => setAdminStats(res.data))
        .catch(() => setAdminStats(null))
        .finally(() => setIsAdminLoading(false));
    }
  }, [user]);

  const handleExploreClick = () => {
    window.location.href = '/campaigns';
  };

  const handleLearnMoreClick = () => {
    console.log('Learn more about DonaTrust clicked');
  };

  const handleViewAllClick = () => {
    window.location.href = '/campaigns';
  };

  const handleViewAllOrganizationsClick = () => {
    console.log('View all organizations clicked');
  };

  const handleCampaignDetailClick = (campaignId) => {
    window.location.href = `/campaign/${campaignId}`;
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center bg-global-3">
        <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    if (isAdminLoading || !adminStats) {
      return (
        <div className="flex flex-1 justify-center items-center min-h-screen bg-white">
          <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
        </div>
      );
    }
    return <AdminDashboard stats={adminStats} />;
  }

  /* ========= User View ========= */

  return (
    <div className="flex flex-col w-full min-h-screen bg-global-3">
      {/* Hero Section with Slider */}
      <div className="relative w-full h-[670px]">
        <Slider
          slides={slides}
          onButtonClick={handleExploreClick}
        />

        {/* Pager Indicator (đúng số slide) */}
        <div className="absolute bottom-[17px] left-1/2 transform -translate-x-1/2">
          <PagerIndicator
            totalPages={slides.length}
            currentPage={currentSlide}
            onPageChange={setCurrentSlide}
          />
        </div>
      </div>

    {/* CTA Ribbon (thay cho Categories) */}
<div className="w-full mt-6 px-4">
  <div className="mx-auto max-w-6xl">
    <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-white to-pink-50 border border-blue-100 shadow-sm p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* CTA 1 */}
        <button
          onClick={() => (window.location.href = '/campaigns')}
          className="flex items-center justify-between w-full rounded-xl bg-white/80 backdrop-blur px-4 py-3 hover:bg-white transition shadow"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔎</span>
            <div className="text-left">
              <div className="font-semibold text-slate-800">Khám phá chiến dịch</div>
              <div className="text-xs text-slate-500">Tìm dự án phù hợp để ủng hộ</div>
            </div>
          </div>
          <span className="text-slate-400 text-lg">→</span>
        </button>


        {/* CTA 3 */}
        <button
          onClick={() => (window.location.href = '/introduce')}
          className="flex items-center justify-between w-full rounded-xl bg-white/80 backdrop-blur px-4 py-3 hover:bg-white transition shadow"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div className="text-left">
              <div className="font-semibold text-slate-800">Tìm hiểu DonaTrust</div>
              <div className="text-xs text-slate-500">Minh bạch & an toàn khi đóng góp</div>
            </div>
          </div>
          <span className="text-slate-400 text-lg">→</span>
        </button>
      </div>
    </div>
  </div>
</div>

      {/* Featured Campaigns Section */}
      <div className="flex flex-col items-center w-full mt-10">
        <h2 className="text-[24px] font-roboto font-bold text-global-1 text-center leading-[32px]">
          CHIẾN DỊCH GÂY QUỸ NỔI BẬT
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 mb-6 max-w-md">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {campaigns.length > 0 ? (
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[53px] gap-y-8 justify-items-center">
              {campaigns.slice(0, 8).map((c) => {
                const cover = resolveImageUrl(c?.image_url) || '/images/img_image_18.png';
                const logo  = resolveImageUrl(c?.charity?.logo_url) || '/images/img_ellipse_8_20x21.png';
                const current = Number(c?.current_amount || 0);
                const goal    = Math.max(1, Number(c?.goal_amount || 1));
                const pct     = Math.min((current / goal) * 100, 100);

                return (
                  <div key={c?.campaign_id} className="relative w-[270px] bg-white rounded shadow-md flex flex-col h-[420px]">
                    {/* Ảnh campaign */}
                    <div className="relative w-full overflow-hidden rounded-t">
                      <div className="aspect-[16/9] w-full bg-white">
                        <img
                          src={cover}
                          alt={c?.title}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/images/img_image_18.png'; }}
                        />
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-pink-500 rounded">
                        {c?.category || 'Tổng quát'}
                      </div>
                    </div>

                    {/* Logo tổ chức */}
                    <img
                      src={logo}
                      alt="Organization"
                      className="w-[32px] h-[32px] object-contain bg-white rounded-full absolute -top-4 left-4 border-2 border-white"
                      onError={(e) => { e.currentTarget.src = '/images/img_ellipse_8_20x21.png'; }}
                    />

                    {/* Thông tin */}
                    <div className="flex flex-col flex-1 px-4 py-3">
                      <div>
                        <p className="mb-1 text-xs text-center text-gray-500">
                          {c?.charity?.name || 'Tổ chức không xác định'}
                        </p>
                        <h3 className="mb-2 text-sm font-bold text-center line-clamp-2">{c?.title}</h3>

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
                      </div>

                      <div className="mt-auto text-center">
                        <button
                          onClick={() => (window.location.href = `/campaign/${c?.campaign_id}`)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-pink-500 rounded hover:bg-pink-600"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Xem tất cả */}
            <div className="mt-6 flex justify-center">
              <Button variant="tertiary" size="md" onClick={handleViewAllClick}>
                Xem tất cả →
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-[22px]">
            <p className="text-gray-500 mb-4">Hiện tại không có chiến dịch nổi bật nào.</p>
            <Button variant="tertiary" size="md" onClick={handleViewAllClick}>
              Xem tất cả →
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="w-full h-[219px] bg-global-2 mt-[37px] px-[15%]">
        <div className="flex flex-row w-full h-full">
          {/* Left Content */}
          <div className="flex flex-col ml-[100px] mt-[67px] w-[284px] h-[83px]">
            <h2 className="text-[25px] font-inter font-semibold text-global-4 leading-[30px]">
              Những con số tự nói lên tất cả.
            </h2>
            <p className="text-[13px] font-inter text-global-2 leading-[14px] mt-[16px]">
              Thống kê nhanh về DonaTrust
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="flex flex-col ml-[138px] mt-[44px] w-[379px] h-[130px]">
            {/* First Row */}
            <div className="flex flex-row w-full h-[43px] mb-[28px]">
              <div className="flex flex-row items-center">
                <img src="/images/img_icon.svg" alt="Supporters Icon" className="w-[33px] h-[33px] mr-[11px]" />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">1,500+</span>
                  <span className="text-[11px] font-inter text-global-6 leading-[14px]">Người ủng hộ</span>
                </div>
              </div>

              <div className="flex flex-row items-center ml-[120px]">
                <img src="/images/img_icon_teal_300.svg" alt="Charity Icon" className="w-[33px] h-[33px] mr-[12px]" />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">200+</span>
                  <span className="text-[11px] font-inter text-global-6 leading-[14px]">Tổ chức gây quỹ</span>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="flex flex-row w-full h-[60px]">
              <div className="flex flex-row items-center">
                <img src="/images/img_icon_teal_300_33x33.svg" alt="Campaign Icon" className="w-[33px] h-[33px] mr-[11px]" />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">328+</span>
                  <span className="text-[11px] font-inter text-global-6 leading-[14px]">Chiến dịch gây quỹ</span>
                </div>
              </div>

              <div className="flex flex-row items-center ml-[98px]">
                <img src="/images/img_icon_33x33.svg" alt="Donation Icon" className="w-[33px] h-[33px] mr-[12px]" />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">132,920,000</span>
                  <span className="text-[11px] font-inter text-global-6 leading-4">Tổng tiền ủng hộ (VND)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About DonaTrust Section */}
      <div className="flex flex-row w-full mt-[34px] px-[15%]">
        <img src="/images/img_frame_6.png" alt="DonaTrust Illustration" className="w-[350px] h-[215px]" />
        <div className="flex flex-col ml-[19px] mt-[29px] w-[433px] h-[156px]">
          <h2 className="text-[25px] font-inter font-semibold text-global-4 leading-[31px]">DonaTrust là gì?</h2>
          <p className="text-xs font-inter text-global-6 leading-[13px] mt-[11px]">
            DonaTrust là hệ thống quản lý các khoản đóng góp từ thiện, là nền tảng trung gian kết nối các tổ chức từ thiện và nhà tài trợ. Mục tiêu chính của hệ thống là tạo ra một môi trường minh bạch, thuận tiện và hiệu quả để kêu gọi và quản lý các hoạt động từ thiện.
          </p>
          <div className="mt-[21px]">
            <Button variant="tertiary" size="lg" onClick={handleLearnMoreClick}>
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Outstanding Organizations Section */}
      <div className="flex flex-col items-center w-full mt-[34px] mb-[37px]">
        <h2 className="text-[25px] font-inter font-semibold text-global-4 leading-[31px] text-center">
          CÁ NHÂN/ TỔ CHỨC GÂY QUỸ NỔI BẬT
        </h2>

        <div className="flex flex-row space-x-[29px] mt-[51px] px-[92px]">
          {organizations.map((org) => (
            <div key={org.id} className="relative w-[256px] h-[318px]">
              {/* Organization Card */}
              <div className="absolute bottom-0 w-full h-[249px] bg-global-1 rounded-[3px]">
                <div className="bg-global-2 rounded-[5px] shadow-[0px_5px_11px_#abbed166] mx-[17px] mt-[97px] p-3 h-[144px]">
                  <h3 className="text-[15px] font-inter font-semibold text-global-3 text-center leading-[19px] mb-[8px]">
                    {org.name}
                  </h3>
                  <p className="text-[13px] font-inter font-semibold text-global-6 text-center leading-[14px] mb-[4px]">
                    Số tiền gây quỹ
                  </p>
                  <p className="text-[14px] font-inter font-semibold text-global-7 text-center leading-[17px] mb-[10px]">
                    {org.amount}
                  </p>

                  {/* Information Button */}
                  <button
                    onClick={() => console.log(`Organization ${org.id} info clicked`)}
                    className="flex flex-row items-center justify-center w-full hover:opacity-80"
                  >
                    <span className="text-[15px] font-inter font-semibold text-global-5 leading-[17px] mr-2">
                      Thông tin
                    </span>
                    <img src="/images/img_24_arrows_directions_right.svg" alt="Arrow Right" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Organization Image */}
              <img
                src={org.image}
                alt={org.name}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[160px] h-[160px] rounded-[80px]"
              />
            </div>
          ))}
        </div>

        {/* View All Organizations Button */}
        <div className="mt-[19px] mb-5">
          <Button variant="tertiary" size="md" onClick={() => console.log('View all organizations clicked')}>
            Xem tất cả →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
