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

  // Mock campaign data
  const mockCampaigns = [
    {
      id: 1,
      title: 'Supporting students to go to school in 2025',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18.png',
      profileImage: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 2,
      title: 'Oh, who saves my face?',
      organization: 'Quỹ Từ tâm Đắk Lắk',
      category: 'Children',
      image: '/images/img_image_18_4.png',
      profileImage: '/images/img_ellipse_8_2.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 3,
      title: 'Green Forest Up 2025',
      organization: 'Trung tâm Con người và Thiên nhiên',
      category: 'Environment',
      image: '/images/img_image_18_3.png',
      profileImage: '/images/img_ellipse_8_1.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 4,
      title: 'Please help Chang Thi Ha cure her serious illness.',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18_5.png',
      profileImage: '/images/img_ellipse_8_3.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 5,
      title: 'A thousand kites for hope',
      organization: 'Quỹ Từ thiện Nâng bước tuổi thơ',
      category: 'Children',
      image: '/images/img_image_18_6.png',
      profileImage: '/images/img_ellipse_8_2.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 6,
      title: 'Join hands for children in the Northwest highlands',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18_7.png',
      profileImage: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 7,
      title: 'Supporting students to go to school in 2025',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18.png',
      profileImage: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    },
    {
      id: 8,
      title: 'Supporting students to go to school in 2025',
      organization: 'Quỹ Vì trẻ em khuyết tật Việt Nam',
      category: 'Children',
      image: '/images/img_image_18_104x137.png',
      profileImage: '/images/img_ellipse_8_20x21.png',
      raised: '9.720.000',
      goal: '30,000,000',
      percentage: '32.4%',
      status: 'active'
    }
  ];

  useEffect(() => {
    // Filter campaigns based on search query and active filter
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
    <div className="relative w-[137px] h-[187px] mb-8">
      {/* Campaign Image */}
      <div className="relative w-[137px] h-[104px]">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover rounded-sm"
        />
        {/* Category Badge */}
        <div className="absolute top-1 right-1 bg-global-4 px-2 py-1 rounded">
          <span className="text-xs font-semibold font-inter text-global-8">
            {campaign.category}
          </span>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="w-[118px] h-[89px] bg-global-2 rounded-sm shadow-sm p-2 mt-2 relative">
        <p className="text-xs font-semibold font-inter text-global-6 text-center mb-1 underline">
          {campaign.organization}
        </p>
        <h3 className="text-sm font-semibold font-inter text-global-3 text-center mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        
        {/* Progress Bar */}
        <div className="w-full h-[11px] mb-1">
          <img
            src="/images/img_rectangle_1.png"
            alt="Progress bar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Funding Info */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold font-inter text-global-6">
            {campaign.raised}
          </span>
          <span className="text-xs font-semibold font-inter text-global-6">
            {campaign.percentage}
          </span>
        </div>

        <p className="text-xs font-semibold font-inter text-global-6 mb-2">
          with the goal of {campaign.goal} VND
        </p>

        {/* Detail Link */}
        <Link 
          to={`/campaign/${campaign.id}`}
          className="flex items-center justify-center"
        >
          <span className="text-sm font-semibold font-inter text-global-5 mr-1">
            Detail
          </span>
          <img
            src="/images/img_24_arrows_directions_right.svg"
            alt="Arrow right"
            className="w-2 h-2"
          />
        </Link>
      </div>

      {/* Profile Image */}
      <img
        src={campaign.profileImage}
        alt="Organization profile"
        className="absolute top-[78px] left-1/2 transform -translate-x-1/2 w-[21px] h-[20px] rounded-full z-10"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-global-3 shadow-2xl">
      <Header />
      
      {/* Hero Section */}
      <div 
        className="w-full h-[265px] relative bg-cover bg-center"
        style={{ backgroundImage: `url('/images/img_rectangle_4.png')` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-[32px] font-bold font-inter leading-[39px] text-center mb-2">
              <span className="text-global-10">Charity</span>
              <span className="text-global-8"> </span>
              <span className="text-global-7">fundraising</span>
              <span className="text-global-8"> </span>
              <span className="text-global-5">campaign</span>
            </h1>
            <p className="text-xl font-bold font-inter text-global-8 mb-8">
              List
            </p>
            
            {/* Pending Campaigns Button */}
            <div className="bg-global-12 rounded-[5px] px-4 py-2">
              <p className="text-xs font-bold font-inter text-global-8 text-center">
                List of pending<br />fundraising campaigns
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
            The campaign is raising funds.
          </Button>
          <Button
            variant={activeFilter === 'ended' ? 'pinkOutline' : 'white'}
            className="w-[274px] h-[41px] rounded-r-[10px] rounded-l-none"
            onClick={() => handleFilterChange('ended')}
          >
            Campaign has ended
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-[26px] font-bold font-inter text-global-1 mb-2">
            Campaigns currently raising funds
          </h2>
          <p className="text-[15px] font-inter text-global-17">
            Choose to fight in the field that interests you most.
          </p>
        </div>

        {/* Campaign Grid */}
        <div className="grid grid-cols-4 gap-x-[53px] gap-y-8 justify-items-center mb-12">
          {campaigns.slice(0, visibleCampaigns).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
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
              See more
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CampaignListPage;