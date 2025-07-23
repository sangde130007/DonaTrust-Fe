import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, keepLoggedIn: e.target.checked }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    if (!formData.password.trim()) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
        keepLoggedIn: formData.keepLoggedIn,
      });
      // isAuthenticated sẽ tự redirect trong useEffect
    } catch (error) {
      if (error.status === 401) {
        setErrors({
          email: 'Email hoặc mật khẩu không đúng',
          password: 'Email hoặc mật khẩu không đúng',
        });
      } else {
        setErrors({
          general: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      navigate('/');
    } catch (error) {
      setErrors({ general: 'Đăng nhập Google thất bại. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-inter">
      {/* Bên trái - Form đăng nhập */}
      <div className="w-1/2 flex flex-col justify-center px-24 py-14 bg-global-3">
        <div className="flex justify-center mb-4">
          <Link to="/">
          <img
            src="/images/img_top.png"
            alt="DonaTrust Logo"
            className="w-[220px] h-auto object-contain"
          />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-bold text-global-4 mb-2">Đăng nhập</h1>
            <p className="text-[13px] text-global-6">
              Vui lòng nhập thông tin để tiếp tục sử dụng hệ thống.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <EditText
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                variant="floating"
                placeholder="Nhập email của bạn"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 ml-3">{errors.email}</p>
              )}
            </div>

            <div>
              <EditText
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                variant="floating"
                showPasswordToggle={true}
                placeholder="Nhập mật khẩu"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 ml-3">{errors.password}</p>
              )}
            </div>

            <div className="flex items-left-1">
              <CheckBox
              label="" // bỏ label trong CheckBox
              checked={formData.keepLoggedIn}
              onChange={handleCheckboxChange}
              id="keepLoggedIn"
              />
              <label htmlFor="keepLoggedIn" className="text-sm text-global-1 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading || authLoading}
              className="w-full"
            >
              {isLoading || authLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-global-7"></div>
              <span className="px-3 text-sm text-global-6">hoặc</span>
              <div className="flex-1 h-px bg-global-7"></div>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={() =>
                setErrors({ general: 'Đăng nhập Google thất bại. Vui lòng thử lại.' })
              }
              width="100%"
              size="large"
              shape="pill"
              text="signin_with"
            />

            <div className="text-center pt-6">
              <p className="text-[14px] text-global-6">
                <span className="font-normal">Chưa có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
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
