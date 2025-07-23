import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchView from '../ui/SearchView';
import Button from '../ui/Button';
import ChangePasswordModal from '../ui/ChangePasswordModal';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    setShowChangePassword(true);
  };

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      <header className="bg-white shadow-md h-[64px] flex items-center justify-between px-[15%]">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
          <img src="/images/img_logo.png" alt="DonaTrust Logo" className="w-[130px] h-auto" />
        </Link>

        {/* Center: search + nav */}
        {user?.role !== 'admin' && (
          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('Tìm kiếm chiến dịch...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-200"
              />
              <img
                src="/images/img_24_user_interface_search.svg"
                alt="Search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60"
              />
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link to="/campaigns" className="hover:text-pink-600 hover:scale-105 transition-all">
                {t('Chiến dịch')}
              </Link>
              <Link to="/organizations" className="hover:text-pink-600 hover:scale-105 transition-all">
                {t('Tổ chức gây quỹ')}
              </Link>
              <Link to="/about" className="hover:text-pink-600 hover:scale-105 transition-all">
                {t('Giới thiệu')}
              </Link>
            </nav>
          </div>
        )}

        {/* Right-side: Language + Auth */}
        <div className="flex items-center gap-4">
          {/* Language */}
          <button
            onClick={toggleLanguage}
            className="text-xs font-medium text-gray-600 hover:text-pink-600 transition flex items-center hover:scale-105"
          >
            {i18n.language === 'vi' ? 'EN' : 'VI'}
            <img src="/images/img_expand.svg" alt="expand" className="w-4 h-4 ml-1" />
          </button>

          {/* Notification */}
          <Link to="/notification" className="relative hover:scale-105 transition-transform">
            <img src="/images/bell.png" alt="Thông báo" className="w-5 h-5" />
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-2 space-x-2 rounded-lg transition-colors hover:bg-gray-100"
              >
                <img
                  src={user?.avatar || '/images/img_avatar.png'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                  onError={(e) => (e.target.src = '/images/img_avatar.png')}
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name || 'User'}
                </span>
                <img src="/images/img_expand.svg" alt="expand" className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('Trang cá nhân')}
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('Chỉnh sửa thông tin')}
                    </Link>
                    <Link
                      to="/charity-registration"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('Đăng ký tổ chức')}
                    </Link>
                    <Link
                      to="/dao-registration"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t('Tham gia DAO')}
                    </Link>
                    <button
                      onClick={handleChangePassword}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      {t('Đổi mật khẩu')}
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 w-full text-sm text-left text-red-600 hover:bg-gray-100"
                    >
                      {t('Đăng xuất')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="login" size="small" className="hover:scale-105 transition-transform">
                  {t('Đăng nhập')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="register" size="small" className="hover:scale-105 transition-transform">
                  <span className="mr-2">{t('Đăng ký')}</span>
                  <img
                    src="/images/img_16_arrows_directions_right.svg"
                    alt="Arrow Right"
                    className="w-3 h-3"
                  />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Overlay */}
        {showUserMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
        )}
      </header>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
};

export default Header;
