import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Nếu có requiredRole mà không khớp role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Bạn không có quyền truy cập trang này
        </h2>
        <p className="mb-4">
          Hãy đăng ký trở thành tổ chức từ thiện để truy cập chức năng này.
        </p>
        <button
          onClick={() => navigate('/charity-registration')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Đăng ký tổ chức từ thiện
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
