import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import daoService from '../../services/daoService';
import Button from '../../components/ui/Button';
import {
  Vote,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

const DaoPendingCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (daoService.isUserDaoMember(user)) {
      loadPendingCampaigns();
    }
  }, [user, currentPage]);

  const loadPendingCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await daoService.getPendingCampaigns(currentPage, 10);
      setCampaigns(response.campaigns || []);
      setTotalPages(response.pagination?.totalPages || 1);

    } catch (error) {
      console.error('Error loading pending campaigns:', error);
      setError(error.message || 'Không thể tải danh sách campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPendingCampaigns();
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadPendingCampaigns();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm ||
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.charity?.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;

    const progress = daoService.calculateVotingProgress(campaign);
    if (filterStatus === 'needs_votes') return matchesSearch && progress.needsMoreVotes;
    if (filterStatus === 'ready_decision') return matchesSearch && progress.canBeFinalDecision;

    return matchesSearch;
  });

  // Check if user is DAO member
  if (!daoService.isUserDaoMember(user)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <Users className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
          <p className="mb-6 text-gray-600">Bạn cần là thành viên DAO để truy cập trang này.</p>
          <Link to="/dao-registration">
            <Button className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Đăng ký thành viên DAO
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-6 mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaigns chờ vote</h1>
              <p className="mt-1 text-gray-600">Đánh giá và vote cho các campaigns mới</p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="px-4 py-2"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>

              <Link to="/dao/dashboard">
                <Button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Search and Filter */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" className="px-6 py-2 ml-3">
                Tìm kiếm
              </Button>
            </form>

            {/* Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="needs_votes">Cần thêm votes</option>
                <option value="ready_decision">Sẵn sàng quyết định</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center">
              <XCircle className="mr-2 w-5 h-5" />
              <div>
                <p>{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-red-600 underline hover:no-underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Campaign Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Hiển thị {filteredCampaigns.length} trong số {campaigns.length} campaigns
              </p>
            </div>

            {/* Campaigns Grid */}
            {filteredCampaigns.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="mx-auto mb-4 w-16 h-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {searchTerm ? 'Không tìm thấy campaigns phù hợp' : 'Không có campaigns chờ vote'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                    : 'Tất cả campaigns đã được vote hoặc chưa có campaigns mới'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((campaign) => {
                  const progress = daoService.calculateVotingProgress(campaign);
                  const canVote = daoService.canUserVoteOnCampaign(campaign, campaign.user_votes || []);

                  return (
                    <div key={campaign.campaign_id} className="bg-white rounded-lg shadow transition-shadow hover:shadow-lg">
                      {/* Campaign Image */}
                      <div className="overflow-hidden relative h-48 rounded-t-lg">
                        <img
                          src={campaign.image_url || '/images/img_image_18.png'}
                          alt={campaign.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.src = '/images/img_image_18.png';
                          }}
                        />
                        <div className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                          {campaign.category || 'General'}
                        </div>

                        {/* Vote Status Badge */}
                        {!canVote && campaign.user_vote && (
                          <div className={`absolute top-4 left-4 px-2 py-1 text-xs font-semibold rounded-full ${campaign.user_vote.vote === 'approve'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                            }`}>
                            Đã {campaign.user_vote.vote === 'approve' ? 'approve' : 'reject'}
                          </div>
                        )}
                      </div>

                      {/* Campaign Content */}
                      <div className="p-6">
                        {/* Title and Organization */}
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
                          {campaign.title}
                        </h3>
                        <p className="mb-4 text-sm text-gray-600">{campaign.charity?.name}</p>

                        {/* Goal Amount */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Mục tiêu gây quỹ</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(campaign.goal_amount)}
                          </p>
                        </div>

                        {/* Voting Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between mb-2 text-sm">
                            <span className="text-gray-600">Votes: {progress.totalVotes}/5</span>
                            <span className={`font-medium ${progress.willBeApproved ? 'text-green-600' : 'text-red-600'}`}>
                              {progress.approvalRate}% approve
                            </span>
                          </div>

                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${(progress.totalVotes / 5) * 100}%` }}
                            />
                          </div>

                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <CheckCircle className="mr-1 w-3 h-3 text-green-600" />
                              <span>{campaign.approve_votes || 0} approve</span>
                            </div>
                            <div className="flex items-center">
                              <XCircle className="mr-1 w-3 h-3 text-red-600" />
                              <span>{campaign.reject_votes || 0} reject</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex justify-between items-center">
                          {/* Status */}
                          <div>
                            {progress.needsMoreVotes ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                                <Clock className="mr-1 w-3 h-3" />
                                Cần {progress.votesLeft} votes
                              </span>
                            ) : progress.canBeFinalDecision ? (
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${progress.willBeApproved
                                ? 'text-green-700 bg-green-100'
                                : 'text-red-700 bg-red-100'
                                }`}>
                                {progress.willBeApproved ? '✓ Sẽ approve' : '✗ Sẽ reject'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                                Đang đánh giá
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <Link to={`/dao/campaigns/${campaign.campaign_id}`}>
                            <Button
                              size="small"
                              className={`px-4 py-2 text-sm ${canVote
                                ? 'text-white bg-blue-600 hover:bg-blue-700'
                                : 'text-white bg-gray-600 hover:bg-gray-700'
                                }`}
                            >
                              {canVote ? (
                                <>
                                  <Vote className="mr-1 w-4 h-4" />
                                  Vote ngay
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="mr-1 w-4 h-4" />
                                  Xem chi tiết
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>

                        {/* Date */}
                        <div className="pt-3 mt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Tạo: {new Date(campaign.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-4">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Trang trước
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-md ${currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-2 text-sm rounded-md ${currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Trang sau
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 mt-12 md:grid-cols-3">
              <div className="p-4 text-center bg-blue-50 rounded-lg">
                <Clock className="mx-auto mb-2 w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  {filteredCampaigns.filter(c => daoService.calculateVotingProgress(c).needsMoreVotes).length}
                </h3>
                <p className="text-sm text-blue-700">Campaigns cần thêm votes</p>
              </div>

              <div className="p-4 text-center bg-green-50 rounded-lg">
                <CheckCircle className="mx-auto mb-2 w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">
                  {filteredCampaigns.filter(c => {
                    const progress = daoService.calculateVotingProgress(c);
                    return progress.canBeFinalDecision && progress.willBeApproved;
                  }).length}
                </h3>
                <p className="text-sm text-green-700">Sẽ được approve</p>
              </div>

              <div className="p-4 text-center bg-red-50 rounded-lg">
                <XCircle className="mx-auto mb-2 w-8 h-8 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">
                  {filteredCampaigns.filter(c => {
                    const progress = daoService.calculateVotingProgress(c);
                    return progress.canBeFinalDecision && !progress.willBeApproved;
                  }).length}
                </h3>
                <p className="text-sm text-red-700">Sẽ bị reject</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DaoPendingCampaigns;