import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // Fetch campaigns on component mount and when filters change
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const searchQuery = searchParams.get('search');
        const filters = {
          search: searchQuery || undefined,
          status: activeFilter === 'completed' ? 'completed' : 'active',
          limit: 50, // Get more campaigns for pagination
        };

        const response = await campaignService.getAllCampaigns(filters);
        console.log('Campaign response:', response);

        setCampaigns(response.campaigns || []);
        setTotalCampaigns(response.total || 0);
        setVisibleCampaigns(8); // Reset visible campaigns when filters change
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Không thể tải chiến dịch. Vui lòng thử lại sau.');
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
      {/* Campaign Image */}
      <div className="relative h-[160px]">
        <img
          src={campaign.image_url || '/images/img_image_18.png'}
          alt={campaign.title}
          className="object-cover w-full h-full rounded-t"
          onError={(e) => {
            e.target.src = '/images/img_image_18.png'; // Fallback image
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-pink-500 rounded">
          {campaign.category || 'Tổng quát'}
        </div>
      </div>

      {/* Profile Image */}
      <img
        src={campaign.charity?.logo_url || '/images/img_ellipse_8_20x21.png'}
        alt="Organization"
        className="w-[32px] h-[32px] rounded-full absolute -top-4 left-4 border-2 border-white"
        onError={(e) => {
          e.target.src = '/images/img_ellipse_8_20x21.png'; // Fallback avatar
        }}
      />

      {/* Campaign Info */}
      <div className="flex flex-col flex-1 px-4 py-3">
        <div>
          <p className="mb-1 text-xs text-center text-gray-500">
            {campaign.charity?.name || 'Tổ chức không xác định'}
          </p>
          <h3 className="mb-2 text-sm font-bold text-center line-clamp-2">{campaign.title}</h3>

          {/* Progress Bar */}
          <div className="mb-1 w-full h-2 bg-gray-200 rounded">
            <div
              className="h-full bg-pink-500 rounded"
              style={{
                width: `${Math.min((parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100, 100)}%`,
              }}
            />
          </div>

          {/* Funding Info */}
          <div className="flex justify-between mb-1 text-xs">
            <span>
              {new Intl.NumberFormat('vi-VN').format(parseFloat(campaign.current_amount))} VND
            </span>
            <span>
              {Math.round(
                (parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100
              )}
              %
            </span>
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Mục tiêu: {new Intl.NumberFormat('vi-VN').format(parseFloat(campaign.goal_amount))} VND
          </p>
        </div>

        {/* Detail Button */}
        <div className="mt-auto text-center">
          <Link to={`/campaign/${campaign.campaign_id}`}>
            <button className="px-4 py-2 text-xs font-semibold text-white bg-pink-500 rounded hover:bg-pink-600">
              Chi tiết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen shadow-2xl bg-global-3">
        <div className="flex flex-1 justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen shadow-2xl bg-global-3">
      {/* Hero Section */}
      <div
        className="w-full h-[265px] relative bg-cover bg-center"
        style={{ backgroundImage: `url('/images/img_rectangle_4.png')` }}
      >
        <div className="flex absolute inset-0 flex-col justify-center items-center">
          <div className="text-center">
            <h1 className="text-[32px] font-bold font-inter leading-[39px] text-center mb-2">
              <span className="text-global-10">Chiến dịch</span>
              <span className="text-global-8"> </span>
              <span className="text-global-7">gây quỹ</span>
              <span className="text-global-8"> </span>
              <span className="text-global-5">từ thiện</span>
            </h1>
            <p className="mb-8 text-xl font-bold font-inter text-global-8">Danh sách</p>

            {/* Pending Campaigns Button */}
            <div className="bg-global-12 rounded-[5px] px-4 py-2">
              <p className="text-xs font-bold text-center font-inter text-global-8">
                Danh sách các chiến dịch
                <br />
                gây quỹ đang chờ duyệt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mt-20 mb-8">
        <div className="flex">
          <Button
            variant={activeFilter === 'active' ? 'pinkOutline' : 'white'}
            className="w-[274px] h-[41px] rounded-l-[10px] rounded-r-none border-r-0"
            onClick={() => handleFilterChange('active')}
          >
            Chiến dịch đang gây quỹ
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'pinkOutline' : 'white'}
            className="w-[274px] h-[41px] rounded-r-[10px] rounded-l-none"
            onClick={() => handleFilterChange('completed')}
          >
            Chiến dịch đã kết thúc
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-[26px] font-bold font-inter text-global-1 mb-2">
            {activeFilter === 'active'
              ? 'Các chiến dịch hiện đang gây quỹ'
              : 'Các chiến dịch đã kết thúc'}
          </h2>
          <p className="text-[15px] font-inter text-global-17">
            Chọn tham gia vào lĩnh vực mà bạn quan tâm nhất.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mx-auto mb-8 max-w-md bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-center text-red-600">{error}</p>
          </div>
        )}

        {/* Campaign Grid */}
        {campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-x-[53px] gap-y-8 justify-items-center mb-12">
              {campaigns.slice(0, visibleCampaigns).map((campaign) => (
                <CampaignCard key={campaign.campaign_id} campaign={campaign} />
              ))}
            </div>

            {/* See More Button */}
            {visibleCampaigns < campaigns.length && (
              <div className="flex justify-center mb-12">
                <Button
                  variant="secondary"
                  className="w-[95px] h-[36px] rounded-sm"
                  onClick={handleSeeMore}
                >
                  Xem thêm
                </Button>
              </div>
            )}

            {/* Results Summary */}
            <div className="mb-8 text-center">
              <p className="text-sm text-global-17">
                Hiển thị {Math.min(visibleCampaigns, campaigns.length)} trong số {campaigns.length}{' '}
                chiến dịch
              </p>
            </div>
          </>
        ) : (
          // Empty state
          <div className="py-16 text-center">
            <div className="mb-6">
              <img
                src="/images/img_image_18.png"
                alt="No campaigns"
                className="mx-auto w-32 h-32 opacity-50 grayscale"
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-global-1">
              Không tìm thấy chiến dịch nào
            </h3>
            <p className="mb-6 text-global-17">
              {searchParams.get('search')
                ? `Không có chiến dịch nào phù hợp với tìm kiếm "${searchParams.get('search')}"`
                : `Hiện tại không có chiến dịch ${activeFilter === 'active' ? 'đang hoạt động' : 'đã kết thúc'} nào.`}
            </p>
            <div className="space-x-4">
              {searchParams.get('search') && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    window.location.href = '/campaigns';
                  }}
                >
                  Xóa tìm kiếm
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Quay về trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CampaignListPage;
