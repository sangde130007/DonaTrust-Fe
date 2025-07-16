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
  Title as ChartTitle
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

// ---------- AdminDashboard Component ----------
const AdminDashboard = ({ stats }) => {
  const pieData = {
    labels: ['Users', 'Charities', 'Campaigns', 'Donations', 'News', 'Donation Amount'],
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
        backgroundColor: ['#3b82f6', '#22c55e', '#facc15', '#ec4899', '#6366f1', '#f472b6'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Pending Charities', 'Pending Campaigns', 'Pending Approvals'],
    datasets: [
      {
        label: 'Pending',
        data: [stats.pendingCharities, stats.pendingCampaigns, stats.pendingApprovals],
        backgroundColor: '#f59e42',
        borderRadius: 6,
      },
    ],
  };

  const chartContainerClass =
    'rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8 flex flex-col items-center mb-10 border border-blue-100';

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>

        {/* Statistic Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-50 rounded-lg p-6 shadow text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
            <div className="text-gray-600 mt-1">Total Users</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 shadow text-center">
            <div className="text-2xl font-bold text-green-700">{stats.totalCharities}</div>
            <div className="text-gray-600 mt-1">Total Charities</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6 shadow text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.totalCampaigns}</div>
            <div className="text-gray-600 mt-1">Total Campaigns</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-6 shadow text-center">
            <div className="text-2xl font-bold text-pink-700">{stats.totalNews}</div>
            <div className="text-gray-600 mt-1">Total News</div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className={chartContainerClass}>
          <h2 className="text-xl font-extrabold mb-6 text-blue-700 uppercase">Overview Distribution</h2>
          <div className="w-full max-w-xs">
            <Pie data={pieData} options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    font: { size: 15, weight: 'bold' },
                    color: '#334155',
                    padding: 18,
                    boxWidth: 22,
                    usePointStyle: true,
                  },
                  onHover: (e) => e.native.target.style.cursor = 'pointer'
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.label || ''}: ${ctx.parsed}`
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Pending Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-orange-50 rounded-lg p-6 shadow text-center">
            <div className="text-xl font-bold text-orange-700">{stats.pendingCharities}</div>
            <div className="text-gray-600 mt-1">Pending Charities</div>
          </div>
          <div className="bg-red-50 rounded-lg p-6 shadow text-center">
            <div className="text-xl font-bold text-red-700">{stats.pendingCampaigns}</div>
            <div className="text-gray-600 mt-1">Pending Campaigns</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 shadow text-center">
            <div className="text-xl font-bold text-purple-700">{stats.pendingApprovals}</div>
            <div className="text-gray-600 mt-1">Pending Approvals</div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className={chartContainerClass}>
          <h2 className="text-xl font-extrabold mb-6 text-blue-700 uppercase">Pending Overview</h2>
          <div className="w-full max-w-2xl">
            <Bar data={barData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 15, weight: 'bold' }, color: '#334155' }
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#e0e7ef', borderDash: [4, 4] },
                  ticks: { stepSize: 1, font: { size: 15, weight: 'bold' }, color: '#334155' }
                }
              },
              hover: { mode: 'nearest', intersect: true },
              animation: { duration: 900, easing: 'easeOutQuart' },
            }} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-lg font-bold text-gray-700 mb-2">Total Donation Amount</div>
            <div className="text-2xl font-bold text-green-700">{stats.totalDonationAmount?.toLocaleString() || 0} VND</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-lg font-bold text-gray-700 mb-2">Total Donations</div>
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
    { icon: '/images/img_logo_24x27.png', label: 'THIÊN TAI' },
    { icon: '/images/img_logo_1.png', label: 'GIÁO DỤC' },
    { icon: '/images/img_logo_27x27.png', label: 'TRẺ EM' },
    { icon: '/images/img_logo_2.png', label: 'NGƯỜI NGHÈO' },
    { icon: '/images/img_logo_3.png', label: 'NGƯỜI CAO TUỔI' },
    { icon: '/images/img_logo_4.png', label: 'NGƯỜI KHUYẾT TẬT' },
    { icon: '/images/img_logo_5.png', label: 'BỆNH HIỂM NGHÈO' },
    { icon: '/images/img_logo_6.png', label: 'VÙNG NÚI' },
    { icon: '/images/img_logo_7.png', label: 'MÔI TRƯỜNG' }
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
          campaignService.getAllCampaigns({ featured: true }),
          campaignService.getCategories(),
        ]);

        // Handle campaigns response
        if (campaignsResponse.status === 'fulfilled') {
console.log('📦 Campaigns response:', JSON.stringify(campaignsResponse.value, null, 2));
  setCampaigns(campaignsResponse.value.campaigns || []);
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
        setError('Failed to load data. Please try again later.');
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
      api.get('/admin/dashboard/stats')
        .then(res => setAdminStats(res.data))
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
      <div className="flex-1 flex items-center justify-center bg-global-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    if (isAdminLoading || !adminStats) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    return <AdminDashboard stats={adminStats} />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-global-3">
      {/* Hero Section with Slider */}
      <div className="relative w-full h-[670px]">
        <Slider 
        slides={[
          {
            title:"CHUNG TAY XÂY DỰNG CỘNG ĐỒNG TỐT ĐẸP HƠN!",
            subtitle:"Khám phá và hỗ trợ các dự án từ thiện đáng tin cậy.",
            buttonText:"KHÁM PHÁ CHIẾN DỊCH",
            backgroundImage:"/images/bacground_homepage.jpg",
          },
          {
            title:"CHUNG TAY XÂY DỰNG CỘNG ĐỒNG TỐT ĐẸP HƠN!",
            subtitle:"Khám phá và hỗ trợ các dự án từ thiện đáng tin cậy.",
            buttonText:"KHÁM PHÁ CHIẾN DỊCH",
            backgroundImage:"/images/img_.png"
          }
        ]}
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
                className="w-[30px] h-[30px] mb-[2px]"
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
<div className="flex flex-col items-center w-full mt-10">
  <h2 className="text-[24px] font-roboto font-bold text-global-1 text-center leading-[32px]">
    CHIẾN DỊCH GÂY QUỸ NỔI BẬT
  </h2>

  {/* Error Message */}
  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 mb-6 max-w-md">
      <p className="text-red-600 text-sm text-center">{error}</p>
    </div>
  )}

  {/* Campaign Slider */}
  {campaigns.length > 0 ? (
    <div className="flex flex-row items-center w-full mt-[52px] px-[15%]">
      {/* Previous Button */}
      <button
        onClick={() => handleCampaignSlideChange('prev')}
        className="mr-[24px] hover:opacity-80"
        disabled={currentCampaignSlide === 0}
      >
        <img
          src="/images/img_vector_140.svg"
          alt="Previous"
          className="w-3 h-[28px]"
        />
      </button>

      {/* Campaign Cards */}
      <div className="flex flex-row space-x-[60px] overflow-hidden">
        {campaigns
          .slice(currentCampaignSlide, currentCampaignSlide + 3)
          .map((campaign, index) => (
<div
  key={campaign.id || index}
  className="flex flex-col w-[280px]"
>
  {/* Campaign Image with Category Tag */}
  <div className="relative w-[280px] h-[220px] mb-[0px]">
    <img
      src={campaign.image_url || '/images/img_image_18.png'}
      alt={campaign.title}
      className="w-full h-full object-cover rounded-sm"
      onError={(e) => {
        e.target.src = '/images/img_image_18.png';
      }}
    />
    <div className="absolute top-[6px] right-[7px] bg-global-4 px-2 py-1 rounded-sm text-[11px] font-inter font-semibold text-global-8 leading-[5px]">
      {campaign.category || 'General'}
    </div>
    <img
      src={campaign.charity?.logo_url || '/images/img_ellipse_8.png'}
      alt="Organization Avatar"
      className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] rounded-full mb-0"
      onError={(e) => {
        e.target.src = '/images/img_ellipse_8.png';
      }}
    />
  </div>

  {/* Campaign Details */}
  <div className="bg-global-2 rounded-sm shadow-[5px_5px_5px_#abbed166] p-7 w-[280px] h-[200px]">
    <div>
      <p className="text-[12px] font-inter font-semibold text-global-6 text-center leading-[5px] mb-5">
        {campaign.charity?.name || 'Unknown Organization'}
      </p>
      <h3 className="text-[13px] font-inter font-semibold text-global-3 text-center leading-[18px] mb-3">
        {campaign.title}
      </h3>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full mb-2 overflow-hidden">
        <div
          className="h-full bg-blue-500 mb-1"
          style={{
            width: `${Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)}%`,
          }}
        ></div>
      </div>

      {/* Amount and Percentage */}
      <div className="flex justify-between text-[13px] font-inter font-semibold text-global-6 leading-[5px] mb-3">
        <span>
          {new Intl.NumberFormat('vi-VN').format(campaign.current_amount || 0)} đ
        </span>
        <span>
          {Math.round(((campaign.current_amount || 0) / (campaign.goal_amount || 1)) * 100)}%
        </span>
      </div>

      <p className="text-[12px] font-inter font-semibold text-global-6 leading-[5px] mb-4">
        Mục tiêu chiến dịch: {new Intl.NumberFormat('vi-VN').format(campaign.goal_amount || 0)} đ
      </p>
    </div>

    {/* Detail Button */}
    <div className="flex justify-center mt-auto">
      <button className="text-[14px] font-inter font-semibold text-global-5 leading-[9px]">
        <span>CHI TIẾT</span>
        <img
          src="/images/img_24_arrows_directions_right.svg"
          alt="Arrow Right"
          className="w-6 h-6"
        />
      </button>
    </div>
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
        <img src="/images/img_vector_140.svg" alt="Next" className="w-3 h-[40px] transform rotate-180" />
      </button>
    </div>
  ) : (
    <div className="mt-[22px]">
      <p className="text-gray-500 mb-4">Hiện tại không có chiến dịch nổi bật nào.</p>
      <Button variant="tertiary" size="md" onClick={handleViewAllClick}>
        Xem tất cả →
      </Button>
    </div>
  )}


        {/* View All Button */}
        {campaigns.length > 0 && (
          <div className="mt-[22px]">
            <Button variant="tertiary" size="md" onClick={handleViewAllClick}>
              View all →
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
                    Tổ chức gây quỹ
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
                    Chiến dịch gây quỹ
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
                    Tổng tiền ủng hộ (VND)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* About DonaTrust Section */}
      <div className="flex flex-row w-full mt-[34px] px-[15%]">
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
          {organizations.map((org, index) => (
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
                    onClick={() => handleOrganizationInfoClick(org.id)}
                    className="flex flex-row items-center justify-center w-full hover:opacity-80"
                  >
                    <span className="text-[15px] font-inter font-semibold text-global-5 leading-[17px] mr-2">
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
          <Button variant="tertiary" size="md" onClick={handleViewAllOrganizationsClick}>
            Xem tất cả →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
