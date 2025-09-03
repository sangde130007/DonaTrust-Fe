import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
const AdminDashboard = ({ stats }) => {
  // Simple bar chart for demo (pending vs total)
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

  // Custom chart container style
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

        {/* Pie Chart */}
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

        {/* Bar Chart */}
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

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Debug Profile fetch:');
      console.log('- Is authenticated:', authUser ? 'Yes' : 'No');
      console.log('- Auth user:', authUser);
      console.log(
        '- Token in localStorage:',
        localStorage.getItem('accessToken') ? 'Present' : 'Missing'
      );

      if (!localStorage.getItem('accessToken')) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Nếu là admin, fetch dashboard stats
      if (authUser?.role === 'admin') {
        const res = await api.get('/admin/dashboard/stats');
        setAdminStats(res.data);
        setIsLoading(false);
        return;
      }
      const response = await userService.getProfile();
      console.log('✅ Profile data received:', response);
      setUserProfile(response.user || response);
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      if (error.status === 401) {
        setError('Xác thực không thành công. Vui lòng đăng nhập lại.');
      } else {
        setError(error.message || 'Không thể tải dữ liệu hồ sơ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const displayUser = userProfile || authUser;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white">
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="mb-4 text-red-500">Lỗi khi tải hồ sơ</div>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={fetchUserData} className="px-4 py-2 text-white bg-blue-500 rounded">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Cover Image */}
      <div className="relative w-full h-[450px]">
        <img src="/images/img__1.png" alt="Cover" className="object-cover w-full h-full" />
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 pt-2 pb-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Avatar + Info */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative -mt-20">
                {displayUser?.profile_image ? (
                  <img
                    src={
                      displayUser.profile_image.startsWith('http')
                        ? displayUser.profile_image
                        : `${API_BASE_URL}${displayUser.profile_image}`
                    }
                    alt="Avatar"
                    className="object-cover w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      console.log('🖼️ Avatar load failed, using fallback');
                      e.target.src = '/images/img_avatar.png';
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-lg">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {/* Fallback avatar */}
                <div className="hidden justify-center items-center w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-lg">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              </div>

              {/* User Info */}
              <div className="md:mb-4">
                <div className="flex gap-2 items-center mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayUser?.full_name || 'Tên người dùng'}
                  </h1>
                </div>
                <p className="mb-2 text-gray-600">
                  @{displayUser?.email?.split('@')[0] || 'tên_người_dùng'}
                </p>
                <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
                  <span>{displayUser?.email || 'Không có email'}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-3 items-center mt-4 md:mt-0">
              <Link to="/profile/edit">
                <Button className="px-6 py-2 font-medium text-white bg-blue-500 rounded-md transition-colors hover:bg-blue-600">
                  Chỉnh sửa thông tin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body dưới: admin thì dashboard, user thì profile section */}
      {authUser?.role === 'admin' ? (
        isLoading || !adminStats ? (
          <div className="w-full bg-white min-h-[300px]">
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
            </div>
          </div>
        ) : (
          <AdminDashboard stats={adminStats} />
        )
      ) : (
        <div className="py-16 bg-gray-50">
          <div className="px-6 mx-auto max-w-7xl">
            {/* Projects Grid - Coming soon */}
            <div className="py-16 text-center">
              <div className="mx-auto max-w-md">
                <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gray-200 rounded-full">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Chưa có dự án nào</h3>
                <p className="mb-8 text-gray-600">
                  Bạn chưa ủng hộ chiến dịch nào. Hãy bắt đầu tạo sự thay đổi ngay hôm nay!
                </p>
              </div>
            </div>
            {/* Explore Button */}
            <div className="flex justify-center items-center text-center">
              <Link to="/campaigns">
                <Button className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md transition-colors hover:bg-blue-700">
                  Khám phá các chiến dịch gây quỹ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
