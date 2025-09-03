import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchView from '../ui/SearchView';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../ui/ChangePasswordModal';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  console.log('🔍 Header user state:', {
    isAuthenticated,
    user: user
      ? {
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          profile_image: user.profile_image,
          avatar: user.avatar,
        }
      : null,
  });

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    setShowChangePassword(true);
  };

  const getUserAvatar = () => {
    return user?.profile_image || '/images/img_avatar.png';
  };

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-row w-full h-[61px] bg-global-3 shadow-[0px_2px_5px_#abbed166]">
        <div className="flex flex-row w-full h-full items-center justify-between px-[70px]">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/img_logo.png" alt="DonaTrust Logo" className="w-[125px] h-[39px]" />
          </Link>

          {/* Center nav: Ẩn nếu là admin */}
          {user?.role !== 'admin' && (
            <div className="flex flex-row items-center space-x-8">
              {/* Search */}
              <SearchView placeholder="Tìm kiếm chiến dịch..." onSearch={handleSearch} />

              {/* Navigation */}
              <nav className="flex flex-row items-center space-x-6">
                <Link
                  to="/"
                  className="text-base font-medium font-inter text-global-4 hover:text-blue-600"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/campaigns"
                  className="text-base font-medium font-inter text-global-4 hover:text-blue-600"
                >
                  Chiến dịch
                </Link>
                <Link
                  to="/introduce"
                  className="text-base font-medium font-inter text-global-4 hover:text-blue-600"
                >
                  Giới thiệu
                </Link>
                <Link
                  to="/news"
                  className="text-base font-medium font-inter text-global-4 hover:text-blue-600"
                >
                  Tin tức
                </Link>

                {/* 🔔 BỎ icon bell cũ (Link tới /notification) */}
                {/* <Link to="/notification" className="relative hover:scale-105 transition-transform">
                  <img src="/images/bell.png" alt="Thông báo" className="w-5 h-5" />
                </Link> */}
              </nav>
            </div>
          )}

          {/* Auth Section (bên phải) */}
          <div className="flex flex-row items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* 🔔 NotificationBell: badge + dropdown + link "Xem tất cả" tới /notifications */}
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center p-2 space-x-2 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <img
                      src={getUserAvatar()}
                      alt="User Avatar"
                      className="object-cover w-8 h-8 rounded-full"
                      onError={(e) => {
                        console.log('🖼️ Avatar load failed, using fallback');
                        e.target.src = '/images/img_avatar.png';
                      }}
                    />
                    <span className="text-sm font-medium text-global-4">
                      {user?.full_name || 'Người dùng'}
                    </span>
                    <img src="/images/img_expand.svg" alt="Menu" className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg">
                      <div className="py-2">
                        {/* User Info Header */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <p className="text-xs text-blue-600 capitalize">{user?.role}</p>
                        </div>

                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Bảng điều khiển cá nhân
                        </Link>
                        <Link
                          to="/profile/edit"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Chỉnh sửa hồ sơ
                        </Link>

                        {user?.role === 'donor' && (
                          <Link
                            to="/charity-registration"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Đăng ký tổ chức từ thiện
                          </Link>
                        )}

                        {user?.role === 'charity' && (
                          <Link
                            to="/charity-dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Bảng điều khiển từ thiện
                          </Link>
                        )}

                        {user?.role === 'admin' && (
                          <Link
                            to="/"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Bảng điều khiển quản trị
                          </Link>
                        )}

                        <button
                          onClick={handleChangePassword}
                          className="block px-4 py-2 w-full text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          Đổi mật khẩu
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="block px-4 py-2 w-full text-sm text-left text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="login" size="small">
                    Đăng nhập
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button variant="register" size="small">
                    <span className="mr-2">Đăng ký ngay</span>
                    <img
                      src="/images/img_16_arrows_directions_right.svg"
                      alt="Arrow Right"
                      className="w-[11px] h-[11px]"
                    />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Overlay to close menu when clicking outside */}
        {showUserMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
};

export default Header;
