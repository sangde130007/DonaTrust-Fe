import React, { useState } from 'react';
import authService from '../../services/authService';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');
    try {
      const res = await authService.forgotPassword(email.trim());
      setStatus('success');
      setMessage(res?.message || 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.');
    } catch (err) {
      setStatus('error');
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể gửi yêu cầu. Vui lòng thử lại.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Quên mật khẩu</h1>
        <p className="text-gray-600 text-center mb-6">
          Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
        </p>

        {status === 'success' ? (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded mb-6">
            {message}
          </div>
        ) : status === 'error' ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            {message}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhapemail@domain.com"
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {status === 'loading' ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/signin')}
            className="text-purple-700 hover:underline"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
