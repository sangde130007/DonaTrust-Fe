import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  // idle | loading | success | error
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      setStatus('error');
      setMessage('Thiếu token đặt lại mật khẩu');
    } else {
      setToken(t);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setStatus('error');
      setMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('Mật khẩu nhập lại không khớp');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await authService.resetPassword(token, password);
      setStatus('success');
      setMessage(res?.message || 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.');
    } catch (err) {
      setStatus('error');
      setMessage(err?.response?.data?.message || err.message || 'Không thể đặt lại mật khẩu.');
    }
  };

  // Nếu thành công -> hiển thị màn hình success giống verify email
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đổi mật khẩu thành công!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/signin')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mặc định: form nhập mật khẩu mới
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Đặt lại mật khẩu</h1>
        <p className="text-gray-600 text-center mb-6">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <Button
            type="submit"
            disabled={status === 'loading' || !token}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {status === 'loading' ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
