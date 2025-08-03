import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import daoService from '../../services/daoService';
import Button from '../../components/ui/Button';
import {
  Vote,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Search,
  ArrowLeft,
  TrendingUp,
  Users
} from 'lucide-react';

const DaoMyVotes = () => {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterVote, setFilterVote] = useState('all'); // all, approve, reject
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (daoService.isUserDaoMember(user)) {
      loadData();
    }
  }, [user, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load votes and statistics in parallel
      const [votesResponse, statsResponse] = await Promise.allSettled([
        daoService.getMyVotes(currentPage, 10),
        daoService.getMyVoteStatistics()
      ]);

      if (votesResponse.status === 'fulfilled') {
        setVotes(votesResponse.value.votes || []);
        setTotalPages(votesResponse.value.pagination?.totalPages || 1);
      }

      if (statsResponse.status === 'fulfilled') {
        setStatistics(statsResponse.value);
      }

    } catch (error) {
      console.error('Error loading votes:', error);
      setError(error.message || 'Không thể tải lịch sử vote');
    } finally {
      setLoading(false);
    }
  };

  const filteredVotes = votes.filter(vote => {
    const matchesSearch = !searchTerm ||
      vote.campaign?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.campaign?.charity?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterVote === 'all' || vote.vote === filterVote;

    return matchesSearch && matchesFilter;
  });

  // Check if user is DAO member
  if (!daoService.isUserDaoMember(user)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <Users className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
          <p className="mb-6 text-gray-600">Bạn cần là thành viên DAO để xem lịch sử vote.</p>
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
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lịch sử votes</h1>
                <p className="mt-1 text-gray-600">Xem lại các vote đã thực hiện</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <Vote className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng votes</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalVotes || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approve votes</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.approveVotes || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reject votes</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.rejectVotes || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tỷ lệ approve</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.approvalRate ? `${statistics.approvalRate}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm campaign..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterVote}
                onChange={(e) => setFilterVote(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả votes</option>
                <option value="approve">Chỉ Approve</option>
                <option value="reject">Chỉ Reject</option>
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
                  onClick={loadData}
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
            {/* Vote Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Hiển thị {filteredVotes.length} trong số {votes.length} votes
              </p>
            </div>

            {/* Votes List */}
            {filteredVotes.length === 0 ? (
              <div className="py-16 text-center">
                <Vote className="mx-auto mb-4 w-16 h-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {searchTerm || filterVote !== 'all'
                    ? 'Không tìm thấy votes phù hợp'
                    : 'Chưa có vote nào'
                  }
                </h3>
                <p className="mb-6 text-gray-600">
                  {searchTerm || filterVote !== 'all'
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                    : 'Bạn chưa vote cho campaign nào'
                  }
                </p>
                <Link to="/dao/campaigns/pending">
                  <Button className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Vote cho campaigns
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVotes.map((vote) => (
                  <div key={vote.vote_id} className="p-6 bg-white rounded-lg shadow transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start">
                      {/* Vote Info */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {vote.vote === 'approve' ? (
                            <CheckCircle className="mr-3 w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="mr-3 w-6 h-6 text-red-600" />
                          )}

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {vote.campaign?.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {vote.campaign?.charity?.name}
                            </p>
                          </div>
                        </div>

                        {/* Vote Details */}
                        <div className="ml-9">
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${vote.vote === 'approve'
                              ? 'text-green-700 bg-green-100'
                              : 'text-red-700 bg-red-100'
                              }`}>
                              {vote.vote === 'approve' ? 'Approved' : 'Rejected'}
                            </span>

                            <div className="flex items-center ml-4 text-sm text-gray-500">
                              <Calendar className="mr-1 w-4 h-4" />
                              {new Date(vote.created_at).toLocaleString('vi-VN')}
                            </div>
                          </div>

                          {/* Vote Reason */}
                          {vote.reason && (
                            <div className="p-3 mt-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Lý do:</strong> {daoService.formatVoteReason(vote.reason)}
                              </p>
                            </div>
                          )}

                          {/* Campaign Status */}
                          {vote.campaign?.dao_approval_status && (
                            <div className="mt-3">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${daoService.getVoteStatusColor(vote.campaign.dao_approval_status)
                                }`}>
                                {vote.campaign.dao_approval_status === 'dao_approved' ? 'DAO Approved' :
                                  vote.campaign.dao_approval_status === 'dao_rejected' ? 'DAO Rejected' :
                                    'Pending'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        <Link to={`/dao/campaigns/${vote.campaign_id}`}>
                          <Button variant="outline" size="small" className="px-4 py-2">
                            Xem campaign
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
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
          </>
        )}
      </div>
    </div>
  );
};

export default DaoMyVotes;