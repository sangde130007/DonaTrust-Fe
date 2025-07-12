import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchView from '../ui/SearchView';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next'; // dùng i18n để chuyển ngôn ngữ

const Header = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const switchLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white shadow-md h-[64px] flex items-center justify-between px-[15%]">
      {/* Logo */}
      <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
        <img
          src="/images/img_logo.png"
          alt="DonaTrust Logo"
          className="w-[130px] h-auto"
        />
      </Link>

      {/* Center content: Search + Navigation */}
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
    src="\images\img_24_user_interface_search.svg"
    alt="Search"
    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60"
  />
</div>

        {/* Navigation */}
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

      {/* Right-side */}
      <div className="flex items-center gap-4">
        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          className="text-xs font-medium text-gray-600 hover:text-pink-600 transition flex items-center hover:scale-105"
        >
          EN
          <img src="/images/img_expand.svg" alt="expand" className="w-4 h-4 ml-1" />
        </button>

        {/* Notification */}
        <Link to="/notification" className="relative hover:scale-105 transition-transform">
          <img src="/images/bell.png" alt="Thông báo" className="w-5 h-5" />
        </Link>

        {/* Đăng nhập */}
        <Link to="/signin">
          <Button variant="login" size="small" className="hover:scale-105 transition-transform">
            {t('Đăng nhập')}
          </Button>
        </Link>

        {/* Đăng ký */}
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
      </div>
    </header>
  );
};

export default Header;
