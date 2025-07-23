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
    <div className="bg-gray-50 min-h-screen">
      {/* Banner image */}
      <div className="w-full h-[250px] bg-cover bg-center"  >
        <img src="/images/cham-pending.png" alt="Campaign Banner" className="w-full h-full object-cover" />
      </div>
        
      {/* Main content */}
      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md mt-[-60px] relative z-10 rounded-lg">
        {/* Header info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Charity Fundraising</p>
          <h2 className="text-blue-600 font-semibold text-lg mt-1">Quỹ Vì trẻ em khuyết tật Việt Nam</h2>
          <h1 className="text-2xl font-bold text-blue-700 mt-3">
            Please help Chang Thi Ha cure her serious illness.
          </h1>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Left: Description */}
          <div className="lg:w-2/3">
            <button className="mb-4 px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              Detailed content
            </button>
            <p className="text-sm text-gray-700 leading-relaxed">
              Every child has dreams and desires to study, to integrate and have companionship. But Ha has been deprived
              of that since birth. Ha is suffering from a rare disease that makes it difficult for her to move, talk, and
              live normally. Every day, her family struggles to earn money to cover treatment, medicine, and basic needs.
              <br /><br />
              With the support from the community, Ha is undergoing treatment at the Central Pediatrics Hospital. However,
              the costs have exceeded what the family can handle. This campaign aims to raise 200,000,000 VND to cover
              medical fees, surgery costs, and rehabilitation.
              <br /><br />
              Every vote of yours helps validate the authenticity of this campaign and accelerates the approval process.
            </p>
          </div>

          {/* Right: Voting & Comments */}
          <div className="lg:w-1/3 border border-gray-300 rounded-md p-4 bg-gray-50">
            <p className="text-sm text-gray-600">Time left to vote: <span className="font-semibold text-black">7 days</span></p>
            <p className="text-sm text-gray-600 mt-1">Voting Progress</p>

            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[70%]"></div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-600 font-semibold">Agree 70%</span>
                <span className="text-red-500 font-semibold">Disagree 30%</span>
              </div>
              <p className="text-xs mt-1 text-gray-500">✓ 7 votes to approve<br />✗ 3 votes to disagree</p>
            </div>

            <div className="mt-5">
              <h4 className="font-semibold mb-2 text-sm">Comments</h4>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-3">
                  <textarea
                    rows={2}
                    placeholder="Comment..."
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                  ></textarea>
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

            <div className="flex justify-between mt-4">
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded">AGREE</button>
              <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded">DISAGREE</button>
            </div>

            <p className="text-right text-xs mt-2 text-gray-400 cursor-pointer hover:underline">Flag / Report scam</p>
          </div>
        </div>

        {/* User Input */}
        <div className="mt-8 border-t pt-6">
          <p className="text-sm mb-2 font-semibold">What do you know about this fundraising campaign?</p>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
            placeholder="Share your insights, stories, or concerns..."
          ></textarea>
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
