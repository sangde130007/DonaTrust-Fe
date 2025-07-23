import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import campaignService from '../../services/campaignService';

const CampaignListPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [visibleCampaigns, setVisibleCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignService.getAllCampaigns();
        setCampaigns(response.campaigns || []);
        setVisibleCampaigns(response.campaigns || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Không thể tải danh sách chiến dịch.');
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    let filtered = [...campaigns];

    if (filterStatus === 'active') {
      filtered = filtered.filter(campaign => campaign.status === 'active');
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(campaign => campaign.status === 'inactive');
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setVisibleCampaigns(filtered);
  }, [searchTerm, filterStatus, campaigns]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded my-6 max-w-2xl mx-auto">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-global-1 mb-6">Danh sách chiến dịch</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/2"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/4"
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang diễn ra</option>
          <option value="inactive">Đã kết thúc</option>
        </select>
      </div>

      {/* Campaign Count */}
      <div className="text-sm text-gray-600 mb-4">
        Hiển thị {visibleCampaigns.length} / {campaigns.length} chiến dịch
      </div>

      {/* Campaign Grid */}
      {visibleCampaigns.length === 0 ? (
        <div className="text-center text-gray-500 py-10">Không có chiến dịch nào phù hợp.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCampaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col"
            >
              <img
                src={campaign.imageUrl || '/images/default_campaign.jpg'}
                alt={campaign.title}
                className="h-48 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{campaign.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-xs text-gray-500">
                    Gây quỹ được: {campaign.amountRaised || 0} / {campaign.goalAmount || 0}
                  </p>
                  <div className="w-full bg-gray-200 rounded h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{
                        width: `${
                          campaign.goalAmount > 0
                            ? Math.min((campaign.amountRaised / campaign.goalAmount) * 100, 100)
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <Link
                  to={`/campaign/${campaign._id}`}
                  className="ml-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded flex items-center"
                >
                  Chi tiết
                  <img
                    src="/images/img_24_arrows_directions_right.svg"
                    alt="Arrow Right"
                    className="w-4 h-4 ml-1"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignListPage;
