import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';

const CampaignListPage = () => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('active');
  const [campaigns, setCampaigns] = useState([]);
  const [visibleCampaigns, setVisibleCampaigns] = useState(8);

  const mockCampaigns = [
  {
    id: 1,
    title: 'HỖ TRỢ HỌC SINH ĐẾN TRƯỜNG NĂM 2025',
    organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
    category: 'Trẻ em',
    image: '/images/img_image_18.png',
    profileImage: '/images/img_ellipse_8_20x21.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 2,
    title: 'ƠN GIỜI, AI CỨU LẤY GƯƠNG MẶT TÔI?',
    organization: 'Quỹ Từ tâm Đắk Lắk',
    category: 'Trẻ em',
    image: '/images/img_image_18_4.png',
    profileImage: '/images/img_ellipse_8_2.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 3,
    title: 'XANH RỪNG TÂY NGUYÊN 2025',
    organization: 'Trung tâm Con người và Thiên nhiên',
    category: 'Môi trường',
    image: '/images/img_image_18_3.png',
    profileImage: '/images/img_ellipse_8_1.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 4,
    title: 'XIN HÃY GIÚP BẠN CHÀNG THỊ HÀ CHỮA BỆNH HIỂM NGHÈO',
    organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
    category: 'Trẻ em',
    image: '/images/img_image_18_5.png',
    profileImage: '/images/img_ellipse_8_3.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 5,
    title: 'NGÀN CÁNH DIỀU HY VỌNG',
    organization: 'Quỹ Từ thiện Nâng bước Tuổi thơ',
    category: 'Trẻ em',
    image: '/images/img_image_18_6.png',
    profileImage: '/images/img_ellipse_8_2.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 6,
    title: 'CHUNG TAY VÌ TRẺ EM VÙNG TÂY BẮC',
    organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
    category: 'Trẻ em',
    image: '/images/img_image_18_7.png',
    profileImage: '/images/img_ellipse_8_20x21.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 7,
    title: 'HỖ TRỢ HỌC SINH ĐẾN TRƯỜNG NĂM 2025',
    organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
    category: 'Trẻ em',
    image: '/images/img_image_18.png',
    profileImage: '/images/img_ellipse_8_20x21.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  },
  {
    id: 8,
    title: 'HỖ TRỢ HỌC SINH ĐẾN TRƯỜNG NĂM 2025',
    organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
    category: 'Trẻ em',
    image: '/images/img_image_18_104x137.png',
    profileImage: '/images/img_ellipse_8_20x21.png',
    raised: '9.720.000',
    goal: '30.000.000',
    percentage: '32.4%',
    status: 'active'
  }
];


  useEffect(() => {
    const searchQuery = searchParams.get('search');
    let filteredCampaigns = mockCampaigns;

    if (searchQuery) {
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.organization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === 'ended') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'ended');
    } else {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === 'active');
    }

    setCampaigns(filteredCampaigns);
  }, [searchParams, activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setVisibleCampaigns(8);
  };

  const handleSeeMore = () => {
    setVisibleCampaigns(prev => prev + 8);
  };

  const CampaignCard = ({ campaign }) => (
    <div className="relative w-[270px] bg-white rounded shadow-md flex flex-col h-[420px]">
      <div className="relative h-[160px] mb-5">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover rounded-t"
        />
        <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
          {campaign.category}
        </div>
      </div>

      <img
        src={campaign.profileImage}
        alt="Tổ chức"
        className="w-[32px] h-[32px] rounded-full absolute -top-4 left-4 border-2 border-white"
      />

      <div className="flex flex-col flex-1 px-4 py-3">
        <div>
          <p className="text-[13px] font-inter font-semibold text-global-6 text-center leading-[5px] mb-5">{campaign.organization}</p>
          <h3 className="text-[15px] font-inter font-semibold text-global-3 text-center leading-[18px] mb-3">{campaign.title}</h3>

          <img 
                    src="/images/img_rectangle_1.png"
                    alt="Progress Bar"
                    className="w-[250px] h-[20px] mb-1"
                  />

          <div className="flex justify-between text-xs mb-1 font-inter mb-5">
            <span>{campaign.raised} VND</span>
            <span>{campaign.percentage}</span>
          </div>
          <p className="text-[13px] font-inter font-semibold text-global-6 leading-[5px] mb-4">Mục tiêu: {campaign.goal} VND</p>
        </div>

        <div className="mt-auto text-center">
          <Link to={`/campaign/${campaign.id}`}>
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
      <Header />

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

      {/* Nút lọc */}
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

      {/* Nội dung chính */}
      <div className="w-full max-w-full mx-auto px-[15%]">
        <div className="text-center mb-8 bg-white rounded-xl shadow-sm px-6 py-6">
          <h2 className="text-[26px] font-bold font-inter text-global-1 mb-2">
            {activeFilter === 'active'
              ? 'CHIẾN DỊCH ĐANG GÂY QUỸ'
              : 'CHIẾN DỊCH ĐÃ KẾT THÚC'}
          </h2>
          <p className="text-[15px] font-inter text-global-17">
            Hãy chọn chiến dịch thuộc lĩnh vực mà bạn quan tâm.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-x-[53px] gap-y-8 justify-items-center mb-12">
          {campaigns.slice(0, visibleCampaigns).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
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
      </div>

      <Footer />
    </div>
  );
};

export default CampaignListPage;
