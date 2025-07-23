import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
import api from '../../services/api';
import Footer from '../../components/common/Footer';
import ProjectCard from "../ProfileDashboard/ProjectCard";


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

      if (!localStorage.getItem('accessToken')) {
        throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.');
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
      console.error('❌ Lỗi khi lấy dữ liệu:', error);
      setError(error.message || 'Không thể tải dữ liệu người dùng');
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
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white min-h-screen flex flex-col items-center justify-center py-20">
        <div className="text-red-500 mb-4">Lỗi tải thông tin người dùng</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchUserData} className="bg-blue-500 text-white px-4 py-2 rounded">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Cover Image */}
      <div className="relative w-full h-[450px]">
        <img src="/images/img__1.png" alt="Cover" className="object-cover w-full h-full" />
      </div>

      {/* Thông tin cá nhân */}
      <div className="w-full bg-white px-[15%] -mt-16">
        <div className="flex justify-between items-center flex-wrap">
          <div className="flex items-center gap-6 mb-0">
            {displayUser?.profile_image ? (
              <img
                src={displayUser.profile_image}
                alt="Avatar"
                className="w-[150px] h-[150px] rounded-full border-4 border-white shadow-md object-cover"
              />
            ) : (
              <div className="w-[150px] h-[150px] flex items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-md">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-black">{displayUser?.full_name || 'Người dùng'}</h1>
              <p className="text-base text-gray-600">@{displayUser?.email?.split('@')[0]}</p>
              <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                <span>0 người theo dõi</span>
                <span>0 bài viết</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/profile/edit">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-6 py-2 rounded-lg font-semibold shadow-md">
                Chỉnh sửa thông tin
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="w-full flex justify-center mt-12 mb-8">
        <div className="flex justify-between w-[600px] text-center border-t border-b py-5">
          <div>
            <p className="text-gray-600 text-sm">Dự án đã ủng hộ</p>
            <p className="text-pink-600 text-lg font-bold">3</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tổ chức đã ủng hộ</p>
            <p className="text-pink-600 text-lg font-bold">0</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tổng số tiền đã quyên góp</p>
            <p className="text-pink-600 text-lg font-bold">950.000 VND</p>
          </div>
        </div>
      </div>

      {/* Danh sách dự án đã ủng hộ */}
      <div className="text-center mb-20 px-[15%]">
        <h2 className="text-[32px] font-bold text-black mb-12">
          CÁC DỰ ÁN ĐÃ ỦNG HỘ
        </h2>

        <div className="flex justify-center gap-10 flex-wrap mb-14">
          {supportedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/campaigns">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-10 py-3 rounded-lg shadow-lg">
              Khám phá thêm các chiến dịch
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
