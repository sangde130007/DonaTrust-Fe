import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const SignInPage = () => {
  const navigate = useNavigate();

  const {
    login,
    googleLogin,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    user, // Add user to check role
  } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Navigate based on user role
      if (user.role === 'dao_member') {
        navigate('/dao-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      keepLoggedIn: e.target.checked,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        keepLoggedIn: formData.keepLoggedIn,
      });

      // Handle navigation based on user role
      if (response.user) {
        if (response.user.role === 'dao_member') {
          console.log('🎯 DAO member detected, navigating to /dao-dashboard');
          navigate('/dao-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      // Handle specific error cases
      if (error.status === 401) {
        setErrors({
          email: 'Email hoặc mật khẩu không đúng',
          password: 'Email hoặc mật khẩu không đúng',
        });
      } else if (error.status === 422) {
        // Handle validation errors
        const validationErrors = {};
        if (error.errors) {
          error.errors.forEach((err) => {
            validationErrors[err.field] = err.message;
          });
        }
        setErrors(validationErrors);
      } else {
        setErrors({
          general: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In with navigation logic
  const handleGoogleSignIn = async (credentialResponse) => {
    console.log('🔍 Google OAuth Response:', credentialResponse);
    setIsLoading(true);
    setErrors({});

    try {
      if (!credentialResponse.credential) {
        throw new Error('Không nhận được thông tin xác thực từ Google');
      }

      console.log('📤 Using AuthContext googleLogin...');

      // Use googleLogin from AuthContext
      const response = await googleLogin(credentialResponse.credential);

      console.log('✅ Google login successful via AuthContext');

      // Handle navigation based on user role
      if (response.user) {
        if (response.user.role === 'dao_member') {
          console.log('🎯 DAO member detected via Google login, navigating to /dao-dashboard');
          navigate('/dao-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      setErrors({
        general: error.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google OAuth Error');
    setErrors({
      general: 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.',
    });
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="flex flex-row justify-center items-center min-h-screen bg-global-3">
      {/* Left Side - Sign In Form */}
      <div className="flex flex-col w-full max-w-[531px] px-24 py-14">
        {/* Logo - Smaller size */}
        <div className="flex justify-center items-center mb-10">
          <img
            src="/images/img_top.png"
            alt="DonaTrust Logo"
            className="w-[200px] h-auto object-contain"
          />
        </div>

        {/* Sign In Form */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-[46px]">
            <h1 className="text-[40px] font-inter font-bold leading-[49px] text-global-9 mb-4">
              Đăng nhập
            </h1>
            <p className="text-lg font-inter font-normal leading-[22px] text-global-13">
              Vui lòng đăng nhập để tiếp tục vào tài khoản của bạn.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col space-y-6">
            {/* Email Field */}
            <div>
              <EditText
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                variant="floating"
                placeholder="Nhập email của bạn"
              />
              {errors.email && <p className="mt-1 ml-3 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <EditText
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                variant="floating"
                showPasswordToggle={true}
              />
              {errors.password && (
                <p className="mt-1 ml-3 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Keep me logged in */}
            <div className="pt-2">
              <CheckBox
                label="Duy trì đăng nhập"
                checked={formData.keepLoggedIn}
                onChange={handleCheckboxChange}
                id="keepLoggedIn"
              />
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 mb-4 bg-red-50 rounded-md border border-red-200">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Auth Error from Context */}
            {authError && (
              <div className="p-3 mb-4 bg-red-50 rounded-md border border-red-200">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            {/* Sign In Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isLoading || authLoading}
                className="w-[399px]"
              >
                {isLoading || authLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center w-[399px] h-6 my-6">
              <div className="flex-1 h-px bg-global-7"></div>
              <span className="px-4 text-base font-medium font-inter text-global-12">hoặc</span>
              <div className="flex-1 h-px bg-global-7"></div>
            </div>

            {/* Google Sign In */}
            <div className="w-[399px]">
              <GoogleLogin
                onSuccess={handleGoogleSignIn}
                onError={handleGoogleError}
                useOneTap={false}
                width="100%"
                size="large"
                shape="pill"
                text="signin_with"
                theme="outline"
                logo_alignment="left"
                disabled={isLoading || authLoading}
              />
            </div>

            {/* Create Account Link */}
            <div className="pt-6 text-center">
              <p className="text-lg font-inter text-global-11">
                <span className="font-normal">Cần tài khoản? </span>
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="font-semibold underline text-button-4 hover:no-underline"
                >
                  Tạo tài khoản
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="relative flex-1">
        <div className="w-full h-[825px] rounded-l-[24px]">
          <img
            src="/images/img_container_1000x825.png"
            alt="Children playing in traditional clothing"
            className="object-cover w-full h-full rounded-l-[24px]"
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;