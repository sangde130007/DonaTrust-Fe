import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import daoService from '../../services/daoService';
import Button from '../../components/ui/Button';
import {
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  ArrowLeft,
  Clock,
  TrendingUp
} from 'lucide-react';

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
 // phải trùng với BE

const resolveImageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;                 // đã là absolute
  if (p.startsWith('/uploads')) return `${API_ORIGIN}${p}`; // file được upload
  return `${API_ORIGIN}/public/images/${p}`;          // fallback ảnh kiểu cũ
};

const DaoCampaignVoting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedVote, setSelectedVote] = useState('');
  const [voteReason, setVoteReason] = useState('');
  const [showVoteForm, setShowVoteForm] = useState(false);

  useEffect(() => {
    if (id && daoService.isUserDaoMember(user)) {
      loadCampaignDetails();
    }
  }, [id, user]);

  const loadCampaignDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await daoService.getCampaignForVoting(id);
      setCampaign(response.campaign || response);
    } catch (error) {
      console.error('Error loading campaign:', error);
      setError(error.message || 'Không thể tải thông tin campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVote) {
      setError('Vui lòng chọn approve hoặc reject');
      return;
    }
    try {
      setVoting(true);
      setError(null);
      await daoService.voteCampaign(id, { vote: selectedVote, reason: voteReason.trim() });
      setSuccess(true);
      setShowVoteForm(false);
      await loadCampaignDetails();
      setTimeout(() => navigate('/dao/campaigns/pending'), 3000);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error.message || 'Không thể gửi vote');
    } finally {
      setVoting(false);
    }
  };

  const handleVoteChoice = (choice) => {
    setSelectedVote(choice);
    setShowVoteForm(true);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const calculateVotingProgress = (c) => {
    if (!c || !c.vote_stats) {
      return { totalVotes: 0, approveVotes: 0, rejectVotes: 0, approvalRate: 0, needsMoreVotes: true, votesLeft: 5, canBeFinalDecision: false, willBeApproved: false };
    }
    const s = c.vote_stats;
    const totalVotes = s.total_votes || 0;
    const approveVotes = s.approve_votes || 0;
    const rejectVotes = s.reject_votes || 0;
    const approvalRate = parseFloat(s.approval_rate || 0);
    const votesLeft = Math.max(0, 5 - totalVotes);
    const needsMoreVotes = totalVotes < 5;
    const canBeFinalDecision = totalVotes >= 5;
    const willBeApproved = approvalRate > 50;
    return { totalVotes, approveVotes, rejectVotes, approvalRate, needsMoreVotes, votesLeft, canBeFinalDecision, willBeApproved };
  };

  const canUserVote = (c) => !c?.user_vote;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!daoService.isUserDaoMember(user)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <Users className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
          <p className="text-gray-600">Bạn cần là thành viên DAO để vote cho campaigns.</p>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 w-16 h-16 text-red-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Lỗi tải campaign</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Button onClick={() => navigate('/dao/campaigns/pending')}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="text-center">
            <Clock className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Campaign không tìm thấy</h2>
            <p className="mb-6 text-gray-600">Campaign này có thể đã được xóa hoặc không tồn tại.</p>
            <Button onClick={() => navigate('/dao/campaigns/pending')}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateVotingProgress(campaign);
  const canVote = canUserVote(campaign);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => navigate('/dao/campaigns/pending')} className="mr-4">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DAO Campaign Voting</h1>
              <p className="text-gray-600">Đánh giá và vote cho campaign</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Success */}
        {success && (
          <div className="p-4 mb-6 text-green-700 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="mr-2 w-5 h-5" />
              <div>
                <p className="font-medium">Vote đã được gửi thành công!</p>
                <p className="text-sm">Đang chuyển hướng về danh sách campaigns...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center">
              <XCircle className="mr-2 w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Campaign Image */}
              <div className="overflow-hidden relative h-64 rounded-t-lg">
                <img
                  src={resolveImageUrl(campaign.image_url) || '/images/img_image_18.png'}
                  alt={campaign.title}
                  className="object-cover w-full h-full"
                  onError={(e) => { e.currentTarget.src = '/images/img_image_18.png'; }}
                />
                <div className="absolute top-4 right-4 px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
                  {campaign.category || 'General'}
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <h1 className="mb-4 text-3xl font-bold text-gray-900">{campaign.title}</h1>

                {/* Org */}
                <div className="flex items-center mb-4">
                  <img
                    src={resolveImageUrl(campaign.charity?.logo_url) || '/images/img_ellipse_8.png'}
                    alt="Organization"
                    className="mr-3 w-12 h-12 rounded-full"
                    onError={(e) => { e.currentTarget.src = '/images/img_ellipse_8.png'; }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.charity?.name}</h3>
                    <p className="text-sm text-gray-600">Tổ chức từ thiện</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 w-4 h-4" />
                    <span>Mục tiêu: {formatCurrency(campaign.goal_amount)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 w-4 h-4" />
                    <span>Tạo: {new Date(campaign.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {campaign.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 w-4 h-4" />
                      <span>{campaign.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900">Mô tả campaign</h2>
                  <div className="max-w-none prose">
                    <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
                  </div>
                </div>

                {/* Detailed */}
                {campaign.detailed_description && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Chi tiết</h2>
                    <div className="max-w-none prose">
                      <p className="text-gray-700 whitespace-pre-wrap">{campaign.detailed_description}</p>
                    </div>
                  </div>
                )}

                {/* Beneficiaries */}
                {campaign.beneficiaries && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Người thụ hưởng</h2>
                    <p className="text-gray-700">{campaign.beneficiaries}</p>
                  </div>
                )}

                {/* Expected Impact */}
                {campaign.expected_impact && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Tác động dự kiến</h2>
                    <p className="text-gray-700">{campaign.expected_impact}</p>
                  </div>
                )}

                {/* QR Code */}
                {campaign.qr_code_url && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Mã QR ủng hộ</h2>
                    <div className="w-full max-w-xs">
                      <img
                        src={resolveImageUrl(campaign.qr_code_url)}
                        alt="QR Code"
                        className="object-contain w-full border rounded-lg"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Progress */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Tiến độ vote</h2>

              <div className="mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Votes: {progress.totalVotes}/5</span>
                  <span className={progress.willBeApproved ? 'text-green-600' : 'text-red-600'}>
                    {progress.approvalRate}% approve
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.totalVotes / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 w-4 h-4 text-green-600" />
                  <span>Approve: {progress.approveVotes}</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="mr-2 w-4 h-4 text-red-600" />
                  <span>Reject: {progress.rejectVotes}</span>
                </div>
              </div>

              {progress.needsMoreVotes && (
                <p className="text-sm text-gray-600">
                  Cần thêm {progress.votesLeft} vote để ra quyết định cuối
                </p>
              )}

              {progress.canBeFinalDecision && (
                <div className={`p-3 rounded-lg ${progress.willBeApproved ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 w-4 h-4" />
                    <span className="text-sm font-medium">
                      {progress.willBeApproved ? 'Sẽ được chuyển cho Admin duyệt' : 'Sẽ bị từ chối'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Voting Actions */}
            {canVote && !showVoteForm && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Vote của bạn</h2>
                <div className="space-y-3">
                  <Button onClick={() => handleVoteChoice('approve')} className="py-3 w-full text-white bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 w-5 h-5" />
                    Approve Campaign
                  </Button>
                  <Button onClick={() => handleVoteChoice('reject')} variant="outline" className="py-3 w-full text-red-600 border-red-600 hover:bg-red-50">
                    <XCircle className="mr-2 w-5 h-5" />
                    Reject Campaign
                  </Button>
                </div>
              </div>
            )}

            {/* Vote Form */}
            {showVoteForm && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  {selectedVote === 'approve' ? 'Approve Campaign' : 'Reject Campaign'}
                </h2>

                <form onSubmit={handleVoteSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Lý do {selectedVote === 'approve' ? 'approve' : 'reject'} (tùy chọn)
                    </label>
                    <textarea
                      value={voteReason}
                      onChange={(e) => setVoteReason(e.target.value)}
                      placeholder={`Nhập lý do ${selectedVote === 'approve' ? 'approve' : 'reject'} campaign này...`}
                      rows={4}
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowVoteForm(false); setSelectedVote(''); setVoteReason(''); }}
                      disabled={voting}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={voting}
                      className={`flex-1 ${selectedVote === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {voting ? 'Đang gửi...' : `${selectedVote === 'approve' ? 'Approve' : 'Reject'}`}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Already Voted */}
            {!canVote && campaign.user_vote && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Vote của bạn</h2>
                <div className={`p-4 rounded-lg ${campaign.user_vote.decision === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center mb-2">
                    {campaign.user_vote.decision === 'approve'
                      ? <CheckCircle className="mr-2 w-5 h-5 text-green-600" />
                      : <XCircle className="mr-2 w-5 h-5 text-red-600" />
                    }
                    <span className={`font-medium ${campaign.user_vote.decision === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                      Đã {campaign.user_vote.decision === 'approve' ? 'approve' : 'reject'}
                    </span>
                  </div>
                  {campaign.user_vote.reason && (
                    <p className="text-sm text-gray-600">Lý do: {campaign.user_vote.reason}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(campaign.user_vote.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Trạng thái</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${daoService.getVoteStatusColor(campaign.dao_approval_status || 'pending')}`}>
                    {campaign.dao_approval_status || 'Pending DAO Vote'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tạo:</span>
                  <span>{new Date(campaign.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                {campaign.dao_approved_at && (
                  <div className="flex justify-between">
                    <span>DAO Approved:</span>
                    <span>{new Date(campaign.dao_approved_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaoCampaignVoting;
