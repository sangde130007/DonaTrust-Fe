import React, { useState, useEffect } from 'react';
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

// Copy AdminDashboard component từ ProfileDashboard
const AdminDashboard = ({ stats }) => {
  const pieData = {
    labels: [
      'Người dùng',
      'Tổ chức từ thiện',
      'Chiến dịch',
      'Quyên góp',
      'Tin tức',
      'Số tiền quyên góp',
    ],
    datasets: [
      {
        data: [
          stats.totalUsers,
          stats.totalCharities,
          stats.totalCampaigns,
          stats.totalDonations,
          stats.totalNews,
          stats.totalDonationAmount,
        ],
        backgroundColor: [
          '#3b82f6', // blue
          '#22c55e', // green
          '#facc15', // yellow
          '#ec4899', // pink
          '#6366f1', // indigo
          '#f472b6', // rose
        ],
        borderWidth: 1,
      },
    ],
  };
  const barData = {
    labels: ['Tổ chức chờ duyệt', 'Chiến dịch chờ duyệt', 'Phê duyệt chờ xử lý'],
    datasets: [
      {
        label: 'Chờ duyệt',
        data: [stats.pendingCharities, stats.pendingCampaigns, stats.pendingApprovals],
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
            <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
            <div className="mt-1 text-gray-600">Tổng người dùng</div>
          </div>
          <div className="p-6 text-center bg-green-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-700">{stats.totalCharities}</div>
            <div className="mt-1 text-gray-600">Tổng tổ chức từ thiện</div>
          </div>
          <div className="p-6 text-center bg-yellow-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-700">{stats.totalCampaigns}</div>
            <div className="mt-1 text-gray-600">Tổng chiến dịch</div>
          </div>
          <div className="p-6 text-center bg-pink-50 rounded-lg shadow">
            <div className="text-2xl font-bold text-pink-700">{stats.totalNews}</div>
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
                    onHover: (e, legendItem, legend) => {
                      e.native.target.style.cursor = 'pointer';
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
            <div className="text-xl font-bold text-orange-700">{stats.pendingCharities}</div>
            <div className="mt-1 text-gray-600">Tổ chức chờ duyệt</div>
          </div>
          <div className="p-6 text-center bg-red-50 rounded-lg shadow">
            <div className="text-xl font-bold text-red-700">{stats.pendingCampaigns}</div>
            <div className="mt-1 text-gray-600">Chiến dịch chờ duyệt</div>
          </div>
          <div className="p-6 text-center bg-purple-50 rounded-lg shadow">
            <div className="text-xl font-bold text-purple-700">{stats.pendingApprovals}</div>
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
              {stats.totalDonationAmount?.toLocaleString() || 0} VND
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-2 text-lg font-bold text-gray-700">Tổng lượt quyên góp</div>
            <div className="text-2xl font-bold text-blue-700">{stats.totalDonations}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCampaignSlide, setCampaignSlide] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Default categories fallback
  const defaultCategories = [
    { icon: '/images/img_logo_24x27.png', label: 'Thảm họa thiên nhiên' },
    { icon: '/images/img_logo_1.png', label: 'Giáo dục' },
    { icon: '/images/img_logo_27x27.png', label: 'Trẻ em' },
    { icon: '/images/img_logo_2.png', label: 'Người nghèo' },
    { icon: '/images/img_logo_3.png', label: 'Người già' },
    { icon: '/images/img_logo_4.png', label: 'Người khuyết tật' },
    { icon: '/images/img_logo_5.png', label: 'Bệnh hiểm nghèo' },
    { icon: '/images/img_logo_6.png', label: 'Vùng núi' },
    { icon: '/images/img_logo_7.png', label: 'Môi trường' },
  ];

  const organizations = [
    {
      id: 1,
      name: 'Quỹ Từ thiện Nâng bước\ntuổi thơ',
      amount: '53,482,393 VND',
      image: '/images/img_image_18_160x160.png',
    },
    {
      id: 2,
      name: 'Quỹ vì Trẻ em khuyết tật\nViệt Nam',
      amount: '53,482,393 VND',
      image: '/images/img_image_18_1.png',
    },
    {
      id: 3,
      name: 'Trung tâm Con người và Thiên nhiên',
      amount: '53,482,393 VND',
      image: '/images/img_image_18_2.png',
    },
  ];

  // Fetch featured campaigns and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch featured campaigns and categories in parallel
        const [campaignsResponse, categoriesResponse] = await Promise.allSettled([
          campaignService.getFeaturedCampaigns(),
          campaignService.getCategories(),
        ]);

        // Handle campaigns response
        if (campaignsResponse.status === 'fulfilled') {
          setCampaigns(campaignsResponse.value.data || []);
        } else {
          console.warn('Failed to fetch campaigns:', campaignsResponse.reason);
          setCampaigns([]); // Fallback to empty array
        }

        // Handle categories response
        if (categoriesResponse.status === 'fulfilled') {
          setCategories(categoriesResponse.value.data || defaultCategories);
        } else {
          console.warn('Failed to fetch categories:', categoriesResponse.reason);
          setCategories(defaultCategories); // Fallback to default categories
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        // Use fallback data
        setCampaigns([]);
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleCampaignSlideChange = (direction) => {
    if (direction === 'next' && currentCampaignSlide < campaigns.length - 3) {
      setCampaignSlide(currentCampaignSlide + 1);
    } else if (direction === 'prev' && currentCampaignSlide > 0) {
      setCampaignSlide(currentCampaignSlide - 1);
    }
  };

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

  const handleOrganizationInfoClick = (orgId) => {
    console.log(`Organization ${orgId} info clicked`);
  };

  // Show loading state
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

  return (
    <div className="w-full bg-global-3">
      {/* Hero Section with Slider */}
      <div className="relative w-full h-[396px]">
        <Slider
          title="CHUNG TAY XÂY DỰNG CỘNG ĐỒNG TỐT ĐẸP HỠN!"
          subtitle="Khám phá và hỗ trợ các dự án từ thiện đáng tin cậy."
          buttonText="KHÁM PHÁ CHIẾN DỊCH"
          backgroundImage="/images/bacground_homepage.jpg"
          onButtonClick={handleExploreClick}
        />

        {/* Pager Indicator */}
        <div className="absolute bottom-[17px] left-1/2 transform -translate-x-1/2">
          <PagerIndicator
            totalPages={3}
            currentPage={currentSlide}
            onPageChange={handleSlideChange}
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex flex-row justify-center items-center w-full h-[60px] mt-[35px] px-[134px]">
        <div className="flex flex-row space-x-[33px]">
          {categories.map((category, index) => (
            <div
              key={category.id || index}
              className="flex flex-col items-center cursor-pointer hover:opacity-80"
            >
              <img
                src={category.icon || category.iconUrl || '/images/img_logo.png'}
                alt={category.label || category.name}
                className="w-[27px] h-[27px] mb-[2px]"
                onError={(e) => {
                  e.target.src = '/images/img_logo.png'; // Fallback icon
                }}
              />
              <span className="text-[9px] font-roboto font-medium text-global-1 text-center leading-[11px] max-w-[74px]">
                {category.label || category.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Campaigns Section */}
      <div className="flex flex-col items-center w-full mt-[29px]">
        <h2 className="text-base font-roboto font-semibold text-global-1 text-center leading-[19px]">
          CHIẾN DỊCH GÂY QUỸ NỔI BẬT
        </h2>

        {/* Error Message */}
        {error && (
          <div className="p-4 mt-4 mb-6 max-w-md bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-center text-red-600">{error}</p>
          </div>
        )}

        {/* Campaign Slider */}
        {campaigns.length > 0 ? (
          <div className="flex flex-row items-center w-full mt-[52px] px-[89px]">
            {/* Previous Button */}
            <button
              onClick={() => handleCampaignSlideChange('prev')}
              className="mr-[24px] hover:opacity-80"
              disabled={currentCampaignSlide === 0}
            >
              <img
                src="/images/img_vector_140.svg"
                alt="Previous"
                className="w-3 h-[28px] transform rotate-180"
              />
            </button>

            {/* Campaign Cards */}
            <div className="flex flex-row space-x-[34px] overflow-hidden">
              {campaigns
                .slice(currentCampaignSlide, currentCampaignSlide + 3)
                .map((campaign, index) => (
                  <div key={campaign.id || index} className="flex flex-col w-[122px]">
                    {/* Campaign Image with Category Tag */}
                    <div className="relative w-[122px] h-[95px] mb-[1px]">
                      <img
                        src={campaign.image || campaign.imageUrl || '/images/img_image_18.png'}
                        alt={campaign.title}
                        className="object-cover w-full h-full rounded-sm"
                        onError={(e) => {
                          e.target.src = '/images/img_image_18.png'; // Fallback image
                        }}
                      />
                      <div className="absolute top-[6px] right-[7px] bg-global-4 px-2 py-1 rounded-sm">
                        <span className="text-[4px] font-inter font-semibold text-global-8 leading-[5px]">
                          {campaign.category || 'Tổng quát'}
                        </span>
                      </div>
                      <img
                        src={
                          campaign.avatar || campaign.charityAvatar || '/images/img_ellipse_8.png'
                        }
                        alt="Organization Avatar"
                        className="absolute bottom-[-9px] left-1/2 transform -translate-x-1/2 w-[19px] h-[19px] rounded-full"
                        onError={(e) => {
                          e.target.src = '/images/img_ellipse_8.png'; // Fallback avatar
                        }}
                      />
                    </div>

                    {/* Campaign Details Card */}
                    <div className="bg-global-2 rounded-sm shadow-[0px_2px_5px_#abbed166] p-2 w-[105px] h-[82px]">
                      <p className="text-[4px] font-inter font-semibold text-global-6 text-center leading-[5px] mb-1">
                        {campaign.organization || campaign.charityName || 'Tổ chức không xác định'}
                      </p>
                      <h3 className="text-[7px] font-inter font-semibold text-global-3 text-center leading-[9px] mb-2">
                        {campaign.title}
                      </h3>

                      {/* Progress Bar */}
                      <div className="w-[91px] h-[11px] mb-1 bg-gray-200 rounded">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{
                            width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>

                      {/* Amount and Percentage */}
                      <div className="flex flex-row justify-between items-center mb-1">
                        <span className="text-[4px] font-inter font-semibold text-global-6 leading-[5px]">
                          {campaign.raised ||
                            new Intl.NumberFormat('vi-VN').format(campaign.raisedAmount || 0)}
                        </span>
                        <span className="text-[4px] font-inter font-semibold text-global-6 leading-[5px]">
                          {campaign.percentage ||
                            `${Math.round(((campaign.raisedAmount || 0) / (campaign.goalAmount || 1)) * 100)}%`}
                        </span>
                      </div>

                      <p className="text-[4px] font-inter font-semibold text-global-6 leading-[5px] mb-2">
                        với mục tiêu{' '}
                        {campaign.goal ||
                          new Intl.NumberFormat('vi-VN').format(campaign.goalAmount || 0)}{' '}
                        VND
                      </p>

                      {/* Detail Button */}
                      <button
                        onClick={() => handleCampaignDetailClick(campaign.id)}
                        className="flex flex-row items-center hover:opacity-80"
                      >
                        <span className="text-[6px] font-inter font-semibold text-global-5 leading-[9px] mr-1">
                          Chi tiết
                        </span>
                        <img
                          src="/images/img_24_arrows_directions_right.svg"
                          alt="Arrow Right"
                          className="w-2 h-2"
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handleCampaignSlideChange('next')}
              className="ml-[25px] hover:opacity-80"
              disabled={currentCampaignSlide >= campaigns.length - 3}
            >
              <img src="/images/img_vector_140.svg" alt="Next" className="w-3 h-[28px]" />
            </button>
          </div>
        ) : (
          // No campaigns state
          <div className="mt-[52px] text-center py-12">
            <p className="mb-4 text-global-6">Hiện tại chưa có chiến dịch nổi bật nào.</p>
            <Button variant="tertiary" size="md" onClick={handleViewAllClick}>
              Xem tất cả chiến dịch →
            </Button>
          </div>
        )}

        {/* View All Button */}
        {campaigns.length > 0 && (
          <div className="mt-[22px]">
            <Button variant="tertiary" size="md" onClick={handleViewAllClick}>
              Xem tất cả →
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="w-full h-[219px] bg-global-2 mt-[37px]">
        <div className="flex flex-row w-full h-full">
          {/* Left Content */}
          <div className="flex flex-col ml-[100px] mt-[67px] w-[284px] h-[83px]">
            <h2 className="text-[25px] font-inter font-semibold text-global-4 leading-[30px]">
              Những con số nói lên tất cả.
            </h2>
            <p className="text-[11px] font-inter text-global-2 leading-[14px] mt-[16px]">
              Thống kê nhanh về DonaTrust
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="flex flex-col ml-[138px] mt-[44px] w-[379px] h-[130px]">
            {/* First Row */}
            <div className="flex flex-row w-full h-[43px] mb-[28px]">
              <div className="flex flex-row items-center">
                <img
                  src="/images/img_icon.svg"
                  alt="Supporters Icon"
                  className="w-[33px] h-[33px] mr-[11px]"
                />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">
                    1,500+
                  </span>
                  <span className="text-[11px] font-inter text-global-6 leading-[14px]">
                    Người ủng hộ
                  </span>
                </div>
              </div>

              <div className="flex flex-row items-center ml-[120px]">
                <img
                  src="/images/img_icon_teal_300.svg"
                  alt="Charity Icon"
                  className="w-[33px] h-[33px] mr-[12px]"
                />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">
                    200+
                  </span>
                  <span className="text-[11px] font-inter text-global-6 leading-[14px]">
                    Tổ chức từ thiện
                  </span>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="flex flex-row w-full h-[60px]">
              <div className="flex flex-row items-center">
                <img
                  src="/images/img_icon_teal_300_33x33.svg"
                  alt="Campaign Icon"
                  className="w-[33px] h-[33px] mr-[11px]"
                />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">
                    328+
                  </span>
                  <span className="text-[11px] font-inter text-global-6 leading-[14px]">
                    Chiến dịch
                  </span>
                </div>
              </div>

              <div className="flex flex-row items-center ml-[98px]">
                <img
                  src="/images/img_icon_33x33.svg"
                  alt="Donation Icon"
                  className="w-[33px] h-[33px] mr-[12px]"
                />
                <div className="flex flex-col">
                  <span className="text-[19px] font-inter font-bold text-global-4 leading-6">
                    132,920,000
                  </span>
                  <span className="text-[11px] font-inter text-global-6 leading-4">
                    Tổng số tiền quyên góp (VND)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About DonaTrust Section */}
      <div className="flex flex-row w-full mt-[34px] px-[100px]">
        <img
          src="/images/img_frame_6.png"
          alt="DonaTrust Illustration"
          className="w-[350px] h-[215px]"
        />

        <div className="flex flex-col ml-[19px] mt-[29px] w-[433px] h-[156px]">
          <h2 className="text-[25px] font-inter font-semibold text-global-4 leading-[31px]">
            DonaTrust là gì?
          </h2>
          <p className="text-xs font-inter text-global-6 leading-[13px] mt-[11px]">
            DonaTrust là hệ thống quản lý quyên góp từ thiện, một nền tảng trung gian kết nối các tổ
            chức từ thiện và nhà tài trợ. Mục tiêu chính của hệ thống là tạo ra một môi trường minh
            bạch, thuận tiện và hiệu quả để kêu gọi và quản lý các hoạt động từ thiện.
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
          Tổ chức/Cá nhân Gây quỹ Xuất sắc
        </h2>

        <div className="flex flex-row space-x-[29px] mt-[51px] px-[92px]">
          {organizations.map((org, index) => (
            <div key={org.id} className="relative w-[256px] h-[318px]">
              {/* Organization Image */}
              <img
                src={org.image}
                alt={org.name}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[160px] h-[160px] rounded-[80px]"
              />

              {/* Organization Card */}
              <div className="absolute bottom-0 w-full h-[249px] bg-global-1 rounded-[3px]">
                <div className="bg-global-2 rounded-[5px] shadow-[0px_5px_11px_#abbed166] mx-[17px] mt-[97px] p-3 h-[144px]">
                  <h3 className="text-[13px] font-inter font-semibold text-global-3 text-center leading-[19px] mb-[8px]">
                    {org.name}
                  </h3>
                  <p className="text-[11px] font-inter font-semibold text-global-6 text-center leading-[14px] mb-[3px]">
                    Số tiền gây quỹ
                  </p>
                  <p className="text-[13px] font-inter font-semibold text-global-7 text-center leading-[17px] mb-[6px]">
                    {org.amount}
                  </p>

                  {/* Information Button */}
                  <button
                    onClick={() => handleOrganizationInfoClick(org.id)}
                    className="flex flex-row justify-center items-center w-full hover:opacity-80"
                  >
                    <span className="text-[13px] font-inter font-semibold text-global-5 leading-[17px] mr-2">
                      Thông tin
                    </span>
                    <img
                      src="/images/img_24_arrows_directions_right.svg"
                      alt="Arrow Right"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Organizations Button */}
        <div className="mt-[22px]">
          <Button variant="tertiary" size="md" onClick={handleViewAllOrganizationsClick}>
            Xem tất cả →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
