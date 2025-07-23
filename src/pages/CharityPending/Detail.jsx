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
    <div className="bg-global-3 min-h-screen">
      {/* Banner */}
      <div className="w-full h-[300px]">
        <img src="/images/cham-pending.png" alt="Banner" className="w-full h-full object-cover" />
      </div>

      {/* Nội dung chính */}
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-[20px] shadow-lg mt-[-80px] relative z-10">
        {/* Thông tin tiêu đề */}
        <div className="text-center mb-8">
          <p className="text-sm text-global-4">Chiến dịch gây quỹ cộng đồng</p>
          <h2 className="text-lg font-semibold text-button-4 mt-1">Quỹ Vì Trẻ Em Khuyết Tật Việt Nam</h2>
          <h1 className="text-[24px] font-bold text-global-1 mt-3 leading-snug">
            Chung tay giúp bé Chẳng Thị Hà chữa căn bệnh hiểm nghèo
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Bên trái: Nội dung chi tiết */}
          <div className="lg:w-2/3">
            <button className="mb-5 px-5 py-2 bg-button-4 text-white text-sm rounded-full hover:bg-button-3 transition">
              Nội dung chi tiết
            </button>
            <p className="text-sm text-global-2 leading-7">
              Mỗi đứa trẻ đều có ước mơ được học tập, hòa nhập và có bạn đồng hành. Nhưng Hà đã bị tước mất điều đó ngay từ khi sinh ra. 
              Bé mắc một căn bệnh hiếm gặp khiến việc đi lại, nói chuyện và sinh hoạt hằng ngày trở nên vô cùng khó khăn. 
              <br /><br />
              Gia đình Hà đang ngày đêm chật vật kiếm tiền để chữa trị và lo chi phí sinh hoạt tối thiểu. Nhờ sự giúp đỡ của cộng đồng, Hà hiện đang được điều trị tại Bệnh viện Nhi Trung ương. Tuy nhiên, chi phí đã vượt quá khả năng gia đình.
              <br /><br />
              Chiến dịch này nhằm kêu gọi 200.000.000 VNĐ để chi trả viện phí, chi phí phẫu thuật và phục hồi chức năng.
              <br /><br />
              Mỗi lượt bỏ phiếu của bạn giúp xác minh tính minh bạch và đẩy nhanh quá trình duyệt chiến dịch này.
            </p>
          </div>

          {/* Bên phải: Voting & Comment */}
          <div className="lg:w-1/3 bg-global-3 p-5 rounded-[16px] border border-gray-200 flex flex-col gap-4">
            <p className="text-sm text-global-4">
              Thời gian còn lại để bỏ phiếu: <span className="font-semibold text-global-1">7 ngày</span>
            </p>

            <div>
              <p className="text-sm text-global-4 mb-1">Tiến trình bỏ phiếu</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[70%]"></div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-green-600 font-semibold">Đồng ý 70%</span>
                <span className="text-red-500 font-semibold">Không đồng ý 30%</span>
              </div>
              <p className="text-xs text-global-4 mt-1">
                ✓ 7 lượt đồng ý <br />
                ✗ 3 lượt không đồng ý
              </p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-sm text-global-1 mb-2">Đánh giá & Bình luận</h4>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-3">
                  <textarea
                    rows={2}
                    placeholder="Nhập bình luận của bạn..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-button-4"
                  ></textarea>
                  <div className="flex mt-2 space-x-1">
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

            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-full transition">
                Đồng ý
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-full transition">
                Không đồng ý
              </button>
            </div>

            <button className="text-xs text-gray-400 hover:underline mt-3 self-end">
              Báo cáo / Gắn cờ
            </button>
          </div>
        </div>

        {/* Phản hồi thêm */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm font-semibold mb-2 text-global-1">
            Bạn có biết gì về chiến dịch này?
          </p>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-button-4"
            placeholder="Chia sẻ thông tin, câu chuyện hoặc những lo ngại của bạn..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
