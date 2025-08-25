import React from 'react';
import { Link } from 'react-router-dom';
import EditText from '../ui/EditText';

const Footer = () => {
  return (
    <footer className="w-full bg-footer-1 py-6">
      <div className="w-full px-6 lg:px-[15%] flex flex-wrap justify-between gap-y-10 text-global-4">
        {/* Logo + Intro */}
        <div className="flex flex-col max-w-[270px]">
          <img
            src="/images/img_footerlogo.png"
            alt="DonaTrust Logo"
            className="w-[198px] h-[62px]"
          />
          <p className="text-base font-inter text-global-8">
            Nền tảng gây quỹ cộng đồng trực tuyến tiện lợi, tin cậy và minh bạch.
          </p>
        </div>

        <div className="flex flex-col text-sm font-inter">
          <h3 className="text-base font-semibold text-global-8">Ủng hộ</h3>
          <Link to="/about" className="text-xs mt-4 hover:text-pink-500">Chiến dịch</Link>
          <Link to="/blog" className="text-xs mt-2 hover:text-pink-500">Tổ chức gây quỹ</Link>
          <Link to="/contact" className="text-xs mt-2 hover:text-pink-500">Người ủng hộ</Link>

        </div>

        <div className="flex flex-col text-sm font-inter">
          <h3 className="text-base font-semibold text-global-8">Giới thiệu</h3>
          <Link to="/help" className="text-xs mt-4 hover:text-pink-500">Về chúng tôi</Link>
          <Link to="/terms" className="text-xs mt-2 hover:text-pink-500">Hỏi đáp</Link>
          <Link to="/legal" className="text-xs mt-2 hover:text-pink-500">Điều khoản sử dụng</Link>
          <Link to="/privacy" className="text-xs mt-2 hover:text-pink-500">Chính sách bảo mật</Link>
        </div>

        {/* Đăng ký nhận thông tin */}
        <div className="flex flex-col max-w-[220px]">
          <h3 className="text-base font-inter font-semibold text-global-8">Đăng ký nhận tin</h3>
          <p className="text-xs text-footer-1 mt-3 mb-2 leading-relaxed">
            Nhận thông báo về chiến dịch mới và cập nhật quan trọng.
          </p>
          <EditText placeholder="Email của bạn" />
        </div>
      </div>
      <div className="border-t border-black-100 mt-5 pt-1 px-1 lg:px-[15%] flex flex-col items-center text-center">
        <p className="text-[10px] font-inter text-footer-1">© 2025 DonaTrust. All rights reserved.</p>
        <div className="flex mt-2 space-x-4">
          <img src="/images/img_social_icons.svg" alt="Social" className="w-[22px] h-[22px]" />
          <img src="/images/img_social_icons_white_a700.svg" alt="Social" className="w-[22px] h-[22px]" />
          <img src="/images/img_social_icons_white_a700_22x22.svg" alt="Social" className="w-[22px] h-[22px]" />
          <img src="/images/img_social_icons_22x22.svg" alt="Social" className="w-[22px] h-[22px]" />
          </div>
        </div>
    </footer>
  );
};

export default Footer;
