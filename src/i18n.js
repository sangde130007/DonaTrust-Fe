import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      "Tìm kiếm chiến dịch...": "Tìm kiếm chiến dịch...",
      "Chiến dịch": "Chiến dịch",
      "Tổ chức gây quỹ": "Tổ chức gây quỹ",
      "Giới thiệu": "Giới thiệu",
      "Đăng nhập": "Đăng nhập",
      "Đăng ký": "Đăng ký",
      "Trang cá nhân": "Trang cá nhân",
      "Chỉnh sửa thông tin": "Chỉnh sửa thông tin",
      "Đăng ký tổ chức": "Đăng ký tổ chức",
      "Tham gia DAO": "Tham gia DAO",
      "Đổi mật khẩu": "Đổi mật khẩu",
      "Đăng xuất": "Đăng xuất"
    }
  },
  en: {
    translation: {
      "Tìm kiếm chiến dịch...": "Search campaign...",
      "Chiến dịch": "Campaigns",
      "Tổ chức gây quỹ": "Organizations",
      "Giới thiệu": "About",
      "Đăng nhập": "Login",
      "Đăng ký": "Register",
      "Trang cá nhân": "Profile",
      "Chỉnh sửa thông tin": "Edit Profile",
      "Đăng ký tổ chức": "Register Charity",
      "Tham gia DAO": "Join DAO",
      "Đổi mật khẩu": "Change Password",
      "Đăng xuất": "Logout"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
