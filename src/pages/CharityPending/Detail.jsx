import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRegStar, FaSpinner } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import api from '../../services/api'; // Adjust path as needed

const CampaignDetail = () => {
  const { id } = useParams(); // Get campaign ID from URL
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState(['', '', '']); // State for comment inputs
  const [userInsight, setUserInsight] = useState(''); // State for user insight textarea
  const [approveLoading, setApproveLoading] = useState(false); // State for approve loading
  const [rejectLoading, setRejectLoading] = useState(false); // State for reject loading
  const [userRole, setUserRole] = useState(null); // State for user role
  const [showRejectModal, setShowRejectModal] = useState(false); // State for reject modal
  const [rejectionReason, setRejectionReason] = useState(''); // State for rejection reason

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaignDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/admin/campaigns/${id}`);
        setCampaign(response.data);
        console.log('Campaign data:', response.data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err.response?.data?.message || 'Không thể tải chi tiết chiến dịch');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampaignDetail();
    }
  }, [id]);

  // Get user role from token or localStorage
  useEffect(() => {
    const getUserRole = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Decode JWT token to get user role
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserRole(payload.role || payload.user_role);
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      }
    };

    getUserRole();
  }, []);

  // Handle comment change
  const handleCommentChange = (index, value) => {
    const newComments = [...comments];
    newComments[index] = value;
    setComments(newComments);
  };

  // Handle flag/report
  const handleReport = async () => {
    try {
      const response = await api.post(`/campaigns/${id}/report`);
      if (response.data.success) {
        alert('Báo cáo chiến dịch thành công');
      }
    } catch (err) {
      console.error('Error reporting:', err);
      alert(err.response?.data?.message || 'Không thể báo cáo chiến dịch');
    }
  };

  // Handle approve campaign
  const handleApproveCampaign = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt chiến dịch này?')) {
      return;
    }

    try {
      setApproveLoading(true);
      const response = await api.put(`/admin/campaigns/${id}/approve`);

      if (response.data) {
        // Update campaign data with the response
        setCampaign(response.data);
        alert('Phê duyệt chiến dịch thành công!');
        console.log('Campaign approved:', response.data);
      }
    } catch (err) {
      console.error('Error approving campaign:', err);
      alert(err.response?.data?.message || 'Không thể phê duyệt chiến dịch');
    } finally {
      setApproveLoading(false);
    }
  };

  // Handle reject campaign
  const handleRejectCampaign = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng cung cấp lý do từ chối');
      return;
    }

    try {
      setRejectLoading(true);
      const response = await api.put(`/admin/campaigns/${id}/reject`, {
        rejection_reason: rejectionReason,
      });

      if (response.data) {
        // Update campaign data with the response
        setCampaign(response.data);
        alert('Từ chối chiến dịch thành công!');
        console.log('Campaign rejected:', response.data);
        // Close modal and reset form
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      alert(err.response?.data?.message || 'Không thể từ chối chiến dịch');
    } finally {
      setRejectLoading(false);
    }
  };

  // Handle opening reject modal
  const handleOpenRejectModal = () => {
    setShowRejectModal(true);
    setRejectionReason('');
  };

  // Handle closing reject modal
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  // Handle share insight
  const handleShareInsight = async () => {
    if (!userInsight.trim()) return;

    try {
      const response = await api.post(`/campaigns/${id}/insights`, {
        insight: userInsight,
      });

      if (response.data.success) {
        setUserInsight('');
        alert('Chia sẻ thông tin thành công');
      }
    } catch (err) {
      console.error('Error sharing insight:', err);
      alert(err.response?.data?.message || 'Không thể chia sẻ thông tin');
    }
  };

  // Check if user is admin
  const isAdmin = userRole === 'admin' || userRole === 'administrator';

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="mx-auto mb-4 text-4xl text-blue-600 animate-spin" />
          <p className="text-gray-600">Đang tải chi tiết chiến dịch...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
            <p className="font-bold">Lỗi</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No campaign found
  if (!campaign) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy chiến dịch</p>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Calculate progress percentage
  const progressPercentage =
    campaign.goal_amount > 0
      ? Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner image */}
      <div className="w-full h-[250px] bg-cover bg-center">
        <img
          src={campaign.image_url || '/images/cham-pending.png'}
          alt="Campaign Banner"
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.src = '/images/cham-pending.png'; // Fallback image
          }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md mt-[-60px] relative z-10 rounded-lg">
        {/* Header info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">{campaign.category}</p>
          <h2 className="mt-1 text-lg font-semibold text-blue-600">
            {campaign.charity?.name || 'Tổ chức từ thiện'}
          </h2>
          <h1 className="mt-3 text-2xl font-bold text-blue-700">{campaign.title}</h1>

          {/* Campaign status */}
          <div className="flex justify-center mt-2 space-x-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                campaign.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {campaign.status}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                campaign.approval_status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : campaign.approval_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {campaign.approval_status}
            </span>
          </div>

          {/* Admin Approve/Reject Buttons */}
          {isAdmin && campaign.approval_status === 'pending' && (
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={handleApproveCampaign}
                disabled={approveLoading || rejectLoading}
                className={`px-6 py-2 rounded text-sm font-semibold transition-colors ${
                  approveLoading || rejectLoading
                    ? 'text-gray-700 bg-gray-400 cursor-not-allowed'
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`}
              >
                {approveLoading ? (
                  <div className="flex items-center">
                    <FaSpinner className="mr-2 animate-spin" />
                    Đang phê duyệt...
                  </div>
                ) : (
                  'Phê duyệt chiến dịch'
                )}
              </button>
              <button
                onClick={handleOpenRejectModal}
                disabled={approveLoading || rejectLoading}
                className={`px-6 py-2 rounded text-sm font-semibold transition-colors ${
                  approveLoading || rejectLoading
                    ? 'text-gray-700 bg-gray-400 cursor-not-allowed'
                    : 'text-white bg-red-600 hover:bg-red-700'
                }`}
              >
                Từ chối chiến dịch
              </button>
            </div>
          )}

          {/* Admin Status Message */}
          {isAdmin && campaign.approval_status === 'approved' && (
            <div className="flex justify-center mt-4">
              <span className="px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded">
                ✓ Chiến dịch đã được phê duyệt
              </span>
            </div>
          )}

          {/* Admin Rejected Status Message */}
          {isAdmin && campaign.approval_status === 'rejected' && (
            <div className="flex justify-center mt-4">
              <span className="px-4 py-2 text-sm font-semibold text-red-800 bg-red-100 rounded">
                ✗ Chiến dịch đã bị từ chối
              </span>
            </div>
          )}

          {/* Location */}
          {campaign.location && (
            <div className="flex justify-center items-center mt-2 text-gray-600">
              <FaMapMarkerAlt className="mr-1" />
              <span className="text-sm">{campaign.location}</span>
            </div>
          )}
        </div>

        {/* Fundraising Progress */}
        <div className="p-4 mt-6 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Tiến độ gây quỹ</span>
            <span className="text-sm text-gray-600">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div
              className="h-3 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600">Đã gây: {formatCurrency(campaign.current_amount)}</span>
            <span className="text-gray-600">Mục tiêu: {formatCurrency(campaign.goal_amount)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-8 mt-8 lg:flex-row">
          {/* Left: Description */}
          <div className="lg:w-2/3">
            <button className="px-4 py-1 mb-4 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
              Nội dung chi tiết
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-gray-800">Mô tả</h3>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>

              {campaign.detailed_description && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800">Mô tả chi tiết</h3>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {campaign.detailed_description}
                  </p>
                </div>
              )}

              {campaign.beneficiaries && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800">Người thụ hưởng</h3>
                  <p className="text-sm leading-relaxed text-gray-700">{campaign.beneficiaries}</p>
                </div>
              )}

              {campaign.expected_impact && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800">Tác động dự kiến</h3>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {campaign.expected_impact}
                  </p>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            {campaign.gallery_images && campaign.gallery_images.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 font-semibold text-gray-800">Thư viện ảnh</h3>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {campaign.gallery_images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="object-cover w-full h-24 rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Comments Section */}
          <div className="p-4 bg-gray-50 rounded-md border border-gray-300 lg:w-1/3">
            <p className="text-sm text-gray-600">
              Thời gian chiến dịch:
              <span className="ml-1 font-semibold text-black">
                {new Date(campaign.start_date).toLocaleDateString()} -{' '}
                {new Date(campaign.end_date).toLocaleDateString()}
              </span>
            </p>

            <div className="mt-5">
              <h4 className="mb-2 text-sm font-semibold">Bình luận</h4>
              {comments.map((comment, i) => (
                <div key={i} className="mb-3">
                  <textarea
                    rows={2}
                    placeholder="Bình luận..."
                    value={comment}
                    onChange={(e) => handleCommentChange(i, e.target.value)}
                    className="px-2 py-1 w-full text-sm rounded border border-gray-300 resize-none"
                  />
                  <div className="flex mt-1 space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <FaRegStar
                        key={j}
                        className="text-yellow-400 cursor-pointer hover:text-yellow-500"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p
              onClick={handleReport}
              className="mt-4 text-xs text-right text-gray-400 cursor-pointer hover:underline"
            >
              Báo cáo / Tố cáo gian lận
            </p>
          </div>
        </div>

        {/* User Input */}
        <div className="pt-6 mt-8 border-t">
          <p className="mb-2 text-sm font-semibold">Bạn biết gì về chiến dịch gây quỹ này?</p>
          <textarea
            rows={3}
            className="px-3 py-2 w-full text-sm rounded border border-gray-300 resize-none"
            placeholder="Chia sẻ thông tin, câu chuyện hoặc mối quan tâm của bạn..."
            value={userInsight}
            onChange={(e) => setUserInsight(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleShareInsight}
              className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Chia sẻ thông tin
            </button>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="p-4 mt-8 bg-gray-50 rounded-lg">
          <h3 className="mb-3 font-semibold text-gray-800">Thông tin chiến dịch</h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="font-semibold">Tổ chức:</span> {campaign.charity?.name}
            </div>
            <div>
              <span className="font-semibold">Xác thực:</span>
              <span
                className={`ml-1 ${campaign.charity?.verification_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {campaign.charity?.verification_status}
              </span>
            </div>
            <div>
              <span className="font-semibold">Tạo:</span>{' '}
              {new Date(campaign.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">Cập nhật:</span>{' '}
              {new Date(campaign.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
            <div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Từ chối chiến dịch</h3>
              <p className="mb-4 text-sm text-gray-600">
                Vui lòng cung cấp lý do từ chối chiến dịch này:
              </p>
              <textarea
                rows={4}
                className="px-3 py-2 w-full rounded-md border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nhập lý do từ chối..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={handleCloseRejectModal}
                  disabled={rejectLoading}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRejectCampaign}
                  disabled={rejectLoading || !rejectionReason.trim()}
                  className={`px-4 py-2 text-sm text-white rounded transition-colors ${
                    rejectLoading || !rejectionReason.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {rejectLoading ? (
                    <div className="flex items-center">
                      <FaSpinner className="mr-2 animate-spin" />
                      Đang từ chối...
                    </div>
                  ) : (
                    'Từ chối chiến dịch'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;
