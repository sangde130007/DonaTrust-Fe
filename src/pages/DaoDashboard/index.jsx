// src/pages/dao/DaoDashboard.jsx – synced voting progress with DaoCampaignVoting
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import daoService from '../../services/daoService';
import Button from '../../components/ui/Button';
import { Vote, Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

// ---- Helpers to mirror DaoCampaignVoting ----
const calculateVotingProgress = (c) => {
  if (!c || !c.vote_stats) {
    return {
      totalVotes: 0,
      approveVotes: 0,
      rejectVotes: 0,
      approvalRate: 0,
      needsMoreVotes: true,
      votesLeft: 5,
      canBeFinalDecision: false,
      willBeApproved: false,
    };
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

const DaoDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [myVoteStats, setMyVoteStats] = useState(null);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);

  useEffect(() => {
    if (daoService.isUserDaoMember(user)) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statisticsResponse, myVoteStatsResponse, pendingCampaignsResponse, recentVotesResponse] = await Promise.allSettled([
        daoService.getDaoStatistics(),
        daoService.getMyVoteStatistics(),
        daoService.getPendingCampaigns(1, 5), // first 5 pending
        daoService.getMyVotes(1, 5), // last 5 votes
      ]);

      if (statisticsResponse.status === 'fulfilled') setStatistics(statisticsResponse.value);
      if (myVoteStatsResponse.status === 'fulfilled') setMyVoteStats(myVoteStatsResponse.value);
      if (pendingCampaignsResponse.status === 'fulfilled') setPendingCampaigns(pendingCampaignsResponse.value.campaigns || []);
      if (recentVotesResponse.status === 'fulfilled') setRecentVotes(recentVotesResponse.value.votes || []);
    } catch (err) {
      console.error('Error loading DAO dashboard:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!daoService.isUserDaoMember(user)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="mb-6 text-center">
            <Users className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
            <p className="text-gray-600">Bạn cần là thành viên DAO để truy cập trang này.</p>
          </div>
          <Link to="/dao-registration">
            <Button className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Đăng ký thành viên DAO</Button>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DAO Dashboard</h1>
              <p className="mt-1 text-gray-600">Quản lý vote và theo dõi hoạt động DAO</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/dao/campaigns/pending">
                <Button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  <Vote className="mr-2 w-4 h-4" />
                  Campaigns chờ vote
                </Button>
              </Link>
              <Link to="/dao/my-votes">
                <Button variant="outline" className="px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">
                  <Calendar className="mr-2 w-4 h-4" />
                  Lịch sử vote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <p>{error}</p>
            <button onClick={loadDashboardData} className="mt-2 text-red-600 underline hover:no-underline">Thử lại</button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg"><Vote className="w-6 h-6 text-blue-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng votes của tôi</p>
                <p className="text-2xl font-bold text-gray-900">{myVoteStats?.totalVotes || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tỷ lệ approve</p>
                <p className="text-2xl font-bold text-gray-900">{myVoteStats?.approvalRate ? `${myVoteStats.approvalRate}%` : '0%'}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campaigns chờ vote</p>
                <p className="text-2xl font-bold text-gray-900">{statistics?.pendingCampaigns || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">DAO Members</p>
                <p className="text-2xl font-bold text-gray-900">{statistics?.totalDaoMembers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Pending Campaigns */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Campaigns chờ vote</h2>
              <Link to="/dao/campaigns/pending" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả →</Link>
            </div>

            <div className="p-6">
              {pendingCampaigns.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-3 w-12 h-12 text-gray-400" />
                  <p className="text-gray-500">Không có campaign nào chờ vote</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCampaigns.map((campaign) => {
                    const progress = calculateVotingProgress(campaign); // <-- synced
                    return (
                      <div key={campaign.campaign_id} className="p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 line-clamp-2">{campaign.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${daoService.getVoteStatusColor('pending')}`}>Pending</span>
                        </div>
                        <p className="mb-3 text-sm text-gray-600">{campaign.charity?.name}</p>

                        {/* Voting Progress (synced UI) */}
                        <div className="mb-3">
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Votes: {progress.totalVotes}/5</span>
                            <span className={progress.willBeApproved ? 'text-green-600' : 'text-red-600'}>
                              {progress.approvalRate}% approve
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full">
                            <div
                              className="h-2.5 bg-blue-600 rounded-full"
                              style={{ width: `${(progress.totalVotes / 5) * 100}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
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
                            <p className="mt-2 text-sm text-gray-600">Cần thêm {progress.votesLeft} vote để ra quyết định cuối</p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Link to={`/dao/campaigns/${campaign.campaign_id}`}>
                            <Button size="small" className="px-4 py-1 text-sm">Vote ngay</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Votes */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Votes gần đây</h2>
              <Link to="/dao/my-votes" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả →</Link>
            </div>
            <div className="p-6">
              {recentVotes.length === 0 ? (
                <div className="py-8 text-center">
                  <Vote className="mx-auto mb-3 w-12 h-12 text-gray-400" />
                  <p className="text-gray-500">Chưa có vote nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVotes.map((vote) => (
                    <div key={vote.vote_id} className="flex items-center p-4 rounded-lg border border-gray-200">
                      <div className="mr-3">
                        {vote.vote === 'approve' ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{vote.campaign?.title}</h4>
                        <p className="text-sm text-gray-600">{vote.vote === 'approve' ? 'Approved' : 'Rejected'} • {vote.charity?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(vote.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <Link to={`/dao/campaigns/${vote.campaign_id}`}>
                        <Button variant="outline" size="small" className="px-3 py-1 text-xs">Xem</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 mt-8 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Hành động nhanh</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link to="/dao/campaigns/pending" className="p-4 text-center rounded-lg border border-gray-200 hover:bg-gray-50">
              <Vote className="mx-auto mb-2 w-8 h-8 text-blue-600" />
              <h3 className="font-medium text-gray-900">Vote Campaigns</h3>
              <p className="text-sm text-gray-600">Đánh giá các campaign mới</p>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DaoDashboard;
