import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      keepLoggedIn: e.target.checked
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData.keepLoggedIn) {
        localStorage.setItem('userSession', JSON.stringify({
          email: formData.email,
          timestamp: Date.now()
        }));
      }

      alert('Đăng nhập thành công! Chào mừng bạn đến với DonaTrust.');
      navigate('/');
    } catch (error) {
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert('Tính năng đăng nhập bằng Google sẽ được tích hợp sau.');
    setTimeout(() => navigate('/'), 1000);
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="flex h-screen font-inter">
      {/* Bên trái - Form đăng nhập */}
      <div className="w-1/2 flex flex-col justify-center px-24 py-14 bg-global-3">
        {/* Logo */}
        <div className="flex justify-center items-center mb-6">
          <img
            src="/images/img_top.png"
            alt="DonaTrust Logo"
            className="w-[220px] h-auto object-contain"
          />
        </div>

        {/* Nội dung form */}
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-bold text-global-4 mb-2">Đăng nhập</h1>
            <p className="text-[13px] text-global-6">
              Vui lòng nhập thông tin để tiếp tục sử dụng hệ thống.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3">
            {/* Email */}
            <div>
              <EditText
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                variant="floating"
                placeholder="Nhập email của bạn"
                className="opacity-50"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 ml-3">{errors.email}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <EditText
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                variant="floating"
                showPasswordToggle={true}
                className="opacity-50"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 ml-3">{errors.password}</p>
              )}
            </div>

            {/* Checkbox */}
            <div className="pt-2">
              <CheckBox
                label="Ghi nhớ đăng nhập"
                checked={formData.keepLoggedIn}
                onChange={handleCheckboxChange}
                id="keepLoggedIn"
              />
            </div>

            {/* Nút đăng nhập */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </div>

            {/* Hoặc */}
            <div className="flex items-center w-full h-6 my-6">
              <div className="flex-1 h-px bg-global-7" />
              <span className="px-4 text-[14px] font-medium text-global-6">hoặc</span>
              <div className="flex-1 h-px bg-global-7" />
            </div>

            {/* Đăng nhập bằng Google */}
            <Button
              type="button"
              variant="google"
              size="large"
              onClick={handleGoogleSignIn}
              className="w-full shadow-sm"
            >
              <span className="text-[14px] font-semibold text-global-4">
                Đăng nhập bằng Google
              </span>
              <img
                src="/images/img_plus.svg"
                alt="Google"
                className="w-6 h-6 ml-4"
              />
            </Button>

            {/* Tạo tài khoản */}
            <div className="text-center pt-6">
              <p className="text-[14px] text-global-6">
                <span className="font-normal">Chưa có tài khoản? </span>
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="font-semibold text-global-5 underline hover:no-underline"
                >
                  Tạo tài khoản
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Bên phải - Ảnh nền */}
      <div className="w-1/2 relative">
        <img
          src="/images/img_container_1000x825.png"
          alt="Ảnh trang trí"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default SignInPage;
