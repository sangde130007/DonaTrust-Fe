import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có ít nhất 10 chữ số';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không trùng khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
      });

      alert('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigate('/signin');
    } catch (error) {
      if (error.status === 422) {
        const validationErrors = {};
        if (error.errors) {
          error.errors.forEach((err) => {
            validationErrors[err.field] = err.message;
          });
        }
        setErrors(validationErrors);
      } else if (error.status === 409) {
        setErrors({
          email: 'Email đã được sử dụng'
        });
      } else {
        setErrors({
          general: error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    alert('Tính năng đăng ký bằng Google sẽ được tích hợp sau.');
  };

  const handleSignInRedirect = () => {
    navigate('/signin');
  };

  return (
    <div className="flex h-screen font-inter">
      {/* Bên trái - Form đăng ký */}
      <div className="w-1/2 flex flex-col justify-center px-24 py-14 bg-global-3">
        <div className="flex justify-center items-center mt-20">
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
            <h1 className="text-[32px] font-bold text-global-4 mb-2">Đăng ký</h1>
            <p className="text-[13px] text-global-6">
              Nhập thông tin bên dưới để tạo tài khoản mới trên DonaTrust.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <EditText
              label="Họ và tên"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Nhập họ tên của bạn"
              variant="floating"
            />
            {errors.name && <p className="text-red-500 text-sm ml-1">{errors.name}</p>}

            <EditText
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="Nhập email của bạn"
              variant="floating"
            />
            {errors.email && <p className="text-red-500 text-sm ml-1">{errors.email}</p>}

            <EditText
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              placeholder="Nhập số điện thoại"
              variant="floating"
            />
            {errors.phone && <p className="text-red-500 text-sm ml-1">{errors.phone}</p>}

            <EditText
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              showPasswordToggle={true}
              variant="floating"
            />
            {errors.password && <p className="text-red-500 text-sm ml-1">{errors.password}</p>}

            <EditText
              label="Xác nhận mật khẩu"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              showPasswordToggle={true}
              variant="floating"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm ml-1">{errors.confirmPassword}</p>
            )}

            {errors.general && (
              <div className="p-3 mb-4 bg-red-50 rounded-md border border-red-200">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || authLoading}
              className="w-full mt-2"
            >
              {isLoading || authLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>

            <div className="flex items-center w-full h-4 my-6">
              <div className="flex-1 h-px bg-global-7" />
              <span className="px-4 text-[14px] font-medium text-global-6">hoặc</span>
              <div className="flex-1 h-px bg-global-7" />
            </div>

            <Button
              type="button"
              variant="google"
              onClick={handleGoogleSignUp}
              className="w-full shadow-sm"
            >
              <span className="text-[14px] font-semibold text-global-4">
                Đăng ký bằng Google
              </span>
              <img
                src="/images/img_plus.svg"
                alt="Google"
                className="w-6 h-6 ml-4"
              />
            </Button>

            <div className="text-center pt-4">
              <p className="text-[14px] text-global-6">
                <span className="font-normal">Đã có tài khoản? </span>
                <button
                  type="button"
                  onClick={handleSignInRedirect}
                  className="font-semibold text-global-5 underline hover:no-underline"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="w-1/2 relative">
        <img
          src="/images/img_container_1000x825.png"
          alt="Ảnh trang trí"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
