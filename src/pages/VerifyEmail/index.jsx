import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Liên kết xác thực không hợp lệ.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token);
      setStatus('success');
      setMessage('Email của bạn đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Có lỗi xảy ra khi xác thực email.');
    }
  };

  const handleGoToLogin = () => {
    navigate('/signin');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-global-3 px-[15%]">
      <div className="w-full max-w-[500px] bg-white rounded-[20px] shadow-lg p-[40px] flex flex-col items-center gap-6">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button-4"></div>
            <h2 className="text-[24px] font-bold text-global-1">Đang xác thực email</h2>
            <p className="text-global-4 text-sm text-center">Vui lòng chờ trong giây lát...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-global-1">Xác thực thành công!</h2>
            <p className="text-global-4 text-sm text-center">{message}</p>
            <div className="w-full flex flex-col gap-3 mt-4">
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-button-4 hover:bg-button-3 text-white text-sm font-semibold"
              >
                Đăng nhập ngay
              </Button>
              <Button
                onClick={handleGoToHome}
                variant="outline"
                className="w-full text-sm font-semibold"
              >
                Về trang chủ
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-global-1">Xác thực thất bại</h2>
            <p className="text-global-4 text-sm text-center">{message}</p>
            <div className="w-full flex flex-col gap-3 mt-4">
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-button-4 hover:bg-button-3 text-white text-sm font-semibold"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={handleGoToHome}
                variant="outline"
                className="w-full text-sm font-semibold"
              >
                Về trang chủ
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
