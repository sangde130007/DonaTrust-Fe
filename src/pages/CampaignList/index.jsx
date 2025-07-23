import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import campaignService from '../../services/campaignService';

const CampaignListPage = () => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('active');
  const [campaigns, setCampaigns] = useState([]);
  const [visibleCampaigns, setVisibleCampaigns] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const searchQuery = searchParams.get('search');
        const filters = {
          search: searchQuery || undefined,
          status: activeFilter === 'ended' ? 'ended' : 'active',
          limit: 50,
        };

        const response = await campaignService.getAllCampaigns(filters);
        setCampaigns(response.campaigns || []);
        setVisibleCampaigns(8);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Không thể tải danh sách chiến dịch. Vui lòng thử lại sau.');
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [searchParams, activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setVisibleCampaigns(8);
  };

  const handleSeeMore = () => {
    setVisibleCampaigns((prev) => prev + 8);
  };

  const CampaignCard = ({ campaign }) => (
    <div className="relative w-[270px] bg-white rounded shadow-md flex flex-col h-[420px]">
      <div className="relative h-[160px] mb-5">
        <img
          src={campaign.image_url || '/images/img_image_18.png'}
          alt={campaign.title}
          className="w-full h-full object-cover rounded-t"
          onError={(e) => { e.target.src = '/images/img_image_18.png'; }}
        />
        <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
          {campaign.category || 'Chung'}
        </div>
      </div>

      <img
        src={campaign.charity?.logo_url || '/images/img_ellipse_8_20x21.png'}
        alt="Tổ chức"
        className="w-[32px] h-[32px] rounded-full absolute -top-4 left-4 border-2 border-white"
        onError={(e) => { e.target.src = '/images/img_ellipse_8_20x21.png'; }}
      />

      <div className="flex flex-col flex-1 px-4 py-3">
        <div>
          <p className="text-[13px] font-inter font-semibold text-global-6 text-center leading-[5px] mb-5">
            {campaign.charity?.name || 'Tổ chức không xác định'}
          </p>
          <h3 className="text-[15px] font-inter font-semibold text-global-3 text-center leading-[18px] mb-3 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="w-full h-2 bg-gray-200 rounded mb-2">
            <div
              className="h-full bg-pink-500 rounded"
              style={{
                width: `${Math.min((parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100, 100)}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs font-inter mb-3">
            <span>{new Intl.NumberFormat('vi-VN').format(parseFloat(campaign.current_amount))} VND</span>
            <span>{Math.round((parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100)}%</span>
          </div>

          <p className="text-[13px] font-inter font-semibold text-global-6 leading-[5px] mb-4">
            Mục tiêu: {new Intl.NumberFormat('vi-VN').format(parseFloat(campaign.goal_amount))} VND
          </p>
        </div>

        <div className="mt-auto text-center">
          <Link to={`/campaign/${campaign.campaign_id}`}>
            <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded font-inter">
              Xem chi tiết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-global-3 shadow-2xl">
      

      {/* Hero */}
      <div
        className="w-full h-[265px] relative bg-cover bg-center"
        style={{ backgroundImage: `url('/images/img_rectangle_4.png')` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-[32px] font-bold font-inter leading-[39px] text-center mb-2">
              <span className="text-global-10">Chiến dịch</span>
              <span className="text-global-8"> </span>
              <span className="text-global-7">gây quỹ</span>
              <span className="text-global-8"> </span>
              <span className="text-global-5">từ thiện</span>
            </h1>
            <p className="text-xl font-bold font-inter text-global-8 mb-8">Danh sách</p>
            <div className="bg-global-12 rounded-[5px] px-4 py-2">
              <p className="text-xs font-bold font-inter text-global-8 text-center">
                Danh sách các chiến dịch<br />đang chờ gây quỹ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mt-20 mb-8">
        <div className="flex">
          <Button
            variant="white"
            className={`w-[274px] h-[41px] font-inter text-sm font-semibold 
              ${activeFilter === 'active' ? 'border-global-7 text-global-7' : 'border-gray-300 text-global-17'}
              border rounded-l-[10px] rounded-r-none`}
            onClick={() => handleFilterChange('active')}
          >
            Chiến dịch đang gây quỹ
          </Button>
          <Button
            variant="white"
            className={`w-[274px] h-[41px] font-inter text-sm font-semibold 
              ${activeFilter === 'ended' ? 'border-global-7 text-global-7' : 'border-gray-300 text-global-17'}
              border rounded-r-[10px] rounded-l-none`}
            onClick={() => handleFilterChange('ended')}
          >
            Chiến dịch đã kết thúc
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-full mx-auto px-[15%]">
        <div className="text-center mb-8 bg-white rounded-xl shadow-sm px-6 py-6">
          <h2 className="text-[26px] font-bold font-inter text-global-1 mb-2">
            {activeFilter === 'active' ? 'CHIẾN DỊCH ĐANG GÂY QUỸ' : 'CHIẾN DỊCH ĐÃ KẾT THÚC'}
          </h2>
          <p className="text-[15px] font-inter text-global-17">
            Hãy chọn chiến dịch thuộc lĩnh vực mà bạn quan tâm.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Campaigns */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-x-[53px] gap-y-8 justify-items-center mb-12">
              {campaigns.slice(0, visibleCampaigns).map((campaign) => (
                <CampaignCard key={campaign.campaign_id} campaign={campaign} />
              ))}
            </div>

            {visibleCampaigns < campaigns.length && (
              <div className="flex justify-center mb-12">
                <Button
                  variant="secondary"
                  className="w-[95px] h-[36px] rounded-sm font-inter text-sm"
                  onClick={handleSeeMore}
                >
                  Xem thêm
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <img
                src="/images/img_image_18.png"
                alt="No campaigns"
                className="w-32 h-32 mx-auto opacity-50 grayscale"
              />
            </div>
            <h3 className="text-xl font-semibold text-global-1 mb-2">Không có chiến dịch nào</h3>
            <p className="text-global-17 mb-6">
              {searchParams.get('search')
                ? `Không tìm thấy chiến dịch phù hợp với từ khóa "${searchParams.get('search')}"`
                : `Hiện tại chưa có chiến dịch ${activeFilter === 'active' ? 'đang gây quỹ' : 'đã kết thúc'}.`}
            </p>
            <div className="space-x-4">
              {searchParams.get('search') && (
                <Button
                  variant="secondary"
                  onClick={() => { window.location.href = '/campaigns'; }}
                >
                  Xóa tìm kiếm
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => { window.location.href = '/'; }}
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default CampaignListPage;
