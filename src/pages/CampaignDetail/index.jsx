import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import RatingBar from '../../components/ui/RatingBar';
import { FaHeart, FaReply, FaRegHeart, FaStar } from 'react-icons/fa';
import ReactStars from 'react-rating-stars-component';



const handleSendReview = () => {
  if (!reviewText.trim() || ratingValue === 0) {
    alert('Vui lòng nhập nội dung và đánh giá số sao.');
    return;
  }
  const newReview = {
    id: Date.now(),
    name: 'Người dùng mới',
    date: 'Hôm nay',
    avatar: '/images/img_avatar.png',
    rating: ratingValue,
    content: reviewText,
    donated: false,
    likes: 0,
    replies: []
  };
  setReviews([newReview, ...reviews]);
  setReviewText('');
  setRatingValue(0);
};

const donors = [
  { name: "Nguyễn Khánh Nam", amount: "50.000đ", time: "21:30:38 - 07/06/2025" },
  { name: "Nhà hảo tâm ẩn danh", amount: "60.000đ", time: "16:08:32 - 06/06/2025" },
  { name: "Trần Lan Anh", amount: "10.000đ", time: "15:42:04 - 06/06/2025" },
  { name: "Đinh Phước Lộc", amount: "20.000đ", time: "23:47:05 - 04/06/2025" },
  { name: "Nguyễn Khánh Nam", amount: "50.000đ", time: "08:58:58 - 04/06/2025" },
  { name: "TRẦN MINH THƯ", amount: "10.000đ", time: "07:54:46 - 03/06/2025" },
  { name: "Lưu Nguyễn Quỳnh Như", amount: "50.000đ", time: "22:17:42 - 01/06/2025" },
  { name: "Lê Trần Khánh Ngọc 2112153110", amount: "50.000đ", time: "23:14:41 - 01/06/2025" },
  { name: "Nguyễn Thị Ngọc Anh", amount: "30.000đ", time: "17:37:55 - 01/06/2025" },
  { name: "Nguyễn Khánh Nam", amount: "50.000đ", time: "10:00:39 - 31/05/2025" },
  // Add 10 more donors for 20 total
  { name: "Phạm Quốc Hùng", amount: "100.000đ", time: "11:25:00 - 29/05/2025" },
  { name: "Nguyễn Văn Tài", amount: "75.000đ", time: "12:00:00 - 27/05/2025" },
  { name: "Lê Thị Hồng", amount: "30.000đ", time: "09:30:20 - 26/05/2025" },
  { name: "Nguyễn Văn Minh", amount: "20.000đ", time: "10:45:15 - 25/05/2025" },
  { name: "Trần Văn Sơn", amount: "50.000đ", time: "16:22:10 - 23/05/2025" },
  { name: "Lê Thị Bích", amount: "60.000đ", time: "18:33:50 - 21/05/2025" },
  { name: "Nguyễn Văn An", amount: "90.000đ", time: "14:12:22 - 20/05/2025" },
  { name: "Lê Hồng Sơn", amount: "70.000đ", time: "20:05:11 - 19/05/2025" },
  { name: "Nguyễn Thị Hoa", amount: "80.000đ", time: "21:41:03 - 17/05/2025" },
  { name: "Đỗ Thị Hạnh", amount: "30.000đ", time: "07:45:23 - 15/05/2025" }
];

const CampaignDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('detail');
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([
  {
    id: 1,
    name: 'Đào Xuân Tiến',
    date: '22 Tháng 7',
    avatar: '/images/img_avatar.png',
    rating: 5,
    content: 'Chiến dịch rất ý nghĩa. Hy vọng sẽ giúp được nhiều em nhỏ hơn nữa.',
    donated: true,
    likes: 3,
    replies: [
      {
        id: 11,
        name: 'Quỹ vì sự phát triển của trẻ em',
        content: 'Cảm ơn bạn đã ủng hộ chiến dịch!',
        date: '23 Tháng 7',
      }
    ]
  },
  {
    id: 2,
    name: 'Minh Hà',
    date: '20 Tháng 7',
    avatar: '/images/img_avatar.png',
    rating: 5,
    content: 'Thông tin rõ ràng, minh bạch. Sẽ giới thiệu bạn bè cùng ủng hộ.',
    donated: true,
    likes: 1,
    replies: []
  },
  {
    id: 3,
    name: 'Nguyễn Tiến Lâm',
    date: '20 Tháng 7',
    avatar: '/images/img_avatar.png',
    rating: 5,
    content: 'Thông tin rõ ràng, minh bạch. Sẽ giới thiệu bạn bè cùng ủng hộ. Rất mong chiến dịch này quyên góp thành công sớm và đến được các bạn nhỏ',
    donated: true,
    likes: 2,
    replies: []
  }
]);
const [searchText, setSearchText] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const donorsPerPage = 5;

// Lọc danh sách theo tên người quyên góp
const filteredDonors = donors.filter((d) =>
  d.name.toLowerCase().includes(searchText.toLowerCase())
);

// Tính tổng số trang dựa trên số người quyên góp lọc được
const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

// Lấy danh sách theo trang hiện tại
const pagedDonors = filteredDonors.slice(
  (currentPage - 1) * donorsPerPage,
  currentPage * donorsPerPage
);

// Điều khiển phân trang
const handlePageClick = (page) => setCurrentPage(page);
const handlePrevPage = () => {
  if (currentPage > 1) setCurrentPage(currentPage - 1);
};
const handleNextPage = () => {
  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};


  const handleDonate = () => {
    alert('Thank you for your interest in donating! Redirecting to payment...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Supporting students to go to school in 2025',
        text: 'Help support students with disabilities to access education',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Campaign link copied to clipboard!');
    }
  };

  const handleWriteReview = () => {
    if (reviewText.trim()) {
      alert('Thank you for your review!');
      setReviewText('');
    } else {
      alert('Please write a review before submitting.');
    }
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleWriteReview = () => {
    if (reviewText.trim()) {
      alert('Cảm ơn bạn đã gửi đánh giá!');
      setReviewText('');
    } else {
      alert('Vui lòng viết đánh giá trước khi gửi.');
    }
  };

  return (
    <div className="min-h-screen bg-global-3">

      {/* Hero Section */}
      <div 
        className="w-full h-[265px] relative bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('/images/img_rectangle_4.png')` }}
      >
        <div className="text-center">
          <h1 className="text-[32px] font-bold leading-[39px] text-center mb-4">
            <span className="text-global-10">Charity</span>
            <span className="text-global-8"> </span>
            <span className="text-global-7">fundraising</span>
            <span className="text-global-8"> </span>
            <span className="text-global-5">campaign</span>
          </h1>
          <p className="text-xl font-bold leading-6 text-center text-global-8">
            Chi tiết chiến dịch
          </p>
        </div>
      </div>


      {/* Nội dung chính */}
      <div className="max-w-[1440px] mx-auto px-[15%] py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Hình ảnh */}
          <div className="flex-1">
            <div className="relative mb-6">
              <img 
                src="/images/img_image_18_273x359.png" 
                alt="Campaign" 
                className="w-full h-[273px] object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4 bg-global-7 text-global-8 px-3 py-1 rounded text-sm font-semibold">
                Children
              </div>
            </div>
          </div>

          {/* Thông tin chiến dịch */}
          <div className="flex-1">
            <div className="bg-global-2 rounded-sm p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-global-3 mb-4">
                Supporting students to go to school in 2025
              </h2>
              
              {/* Organization Info */}
              <div className="flex items-center mb-4">
                <img 
                  src="/images/img_ellipse_8_39x39.png" 
                  alt="Organization" 
                  className="w-[39px] h-[39px] rounded-full mr-3"
                />
                <span className="text-base font-semibold text-global-6">
                  Quỹ Vì trẻ em khuyết tật Việt Nam
                </span>
              </div>

              {/* Campaign Objective */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-global-6">Campaign Objective</span>
                <span className="text-xs font-semibold text-global-6">30,000,000 VND</span>
              </div>
              <img src="/images/img_rectangle_1.png" alt="Progress" className="w-full h-[22px] mb-2" />

              <div className="flex justify-between mb-2 text-sm text-global-6 font-semibold">
                <span>85 lượt quyên góp</span>
                <span>Đã đạt được</span>
              </div>

              {/* Donation Stats */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <img 
                      src="/images/img_icon_green_50.svg" 
                      alt="Donations" 
                      className="w-[21px] h-[18px] mr-2"
                    />
                    <span className="text-xs font-semibold text-global-6">85 donations</span>
                  </div>
                  <span className="text-sm font-semibold text-global-6">Achieved</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-global-21">9.720.000 VND</span>
                </div>
              </div>

              {/* Time Remaining and Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img src="/images/img__28x20.png" alt="Thời gian" className="w-5 h-5 mr-2" />
                  <div>
                    <p className="text-xs font-semibold text-global-6">Time remaining</p>
                    <p className="text-sm font-semibold text-global-6">87 days</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleDonate}
                    variant="secondary"
                    className="h-9 px-6 bg-global-7 text-global-8 rounded-sm"
                  >
                    DONATE NOW
                  </Button>
                  <Button 
                    onClick={handleShare}
                    variant="primary"
                    className="h-9 px-6 bg-global-12 text-global-8 rounded-sm"
                  >
                    SHARE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-10 border-b border-global-8">
          <Button
            onClick={() => setActiveTab('detail')}
            variant={activeTab === 'detail' ? 'tabActive' : 'tab'}
            className="h-10 px-6 font-inter text-sm font-semibold"
          >
            Nội dung chi tiết
          </Button>
      
          <Button
            onClick={() => setActiveTab('donations')}
            variant={activeTab === 'donations' ? 'tabActive' : 'tab'}
            className="h-10 px-6 font-inter text-sm font-semibold"
          >
            Danh sách quyên góp
          </Button>
      
        </div>

        {/* Nội dung tab */}
        {activeTab === 'detail' && (
          <div className="mt-8 flex flex-col lg:flex-row gap-10">
            {/* Chi tiết */}
            <div className="flex-1 text-sm leading-6 text-global-18">
              <p className="mb-4">
                    Bất cứ trẻ em nào cũng có những ước mơ, khao khát được học tập, được hòa nhập và có những 
                    người bạn đồng hành trên hành trình trưởng thành. Nhưng không phải em nào cũng có cơ hội ấy, 
                    đặc biệt là trẻ khuyết tật. Nếu không được đến trường, các em không chỉ mất đi cơ hội tiếp cận 
                    tri thức, mà còn đánh mất cả những cơ hội quý giá để kết bạn, để cảm nhận sự kết nối với thế giới 
                    xung quanh. Sự cô đơn, sự e dè và những rào cản vô hình có thể giữ các em lại trong thế giới của 
                    riêng mình, trong khi chỉ cần một cơ hội, một cánh cửa mở ra, tương lai và cuộc đời các em có thể thay đổi.
                  </p>
                  <p className="mb-4">
                    Trong năm 2025, Quỹ tiếp tục phối hợp Đoàn TNCS Bộ Ngoại giao triển khai chương trình ý nghĩa này 
                    với mục tiêu trao tặng 1.200 học bổng, mỗi học bổng trị giá 4.000.000 VND. Chúng tôi kêu gọi gây quỹ 
                    200 triệu đồng trên nền tảng DonaTrust, tương đương 50 suất học bổng, và sẽ mở rộng kêu gọi trên các 
                    nền tảng khác nhằm lan tỏa hỗ trợ tới nhiều trẻ em khuyết tật hơn.
                  </p>
                  <p className="mb-4">
                    Chương trình "Tiếp sức tới trường" của Quỹ Vì trẻ em khuyết tật không chỉ mang đến sự hỗ trợ về vật chất 
                    và các điều kiện học tập cho trẻ khuyết tật, mà chính là trao cho các em cơ hội – cơ hội được học tập, 
                    được kết bạn, được hòa nhập và phát triển bình đẳng. Giáo dục không chỉ là con chữ, mà còn là cầu nối 
                    của những ước mơ và xây dựng giá trị của mỗi cá nhân.
                  </p>
                  <p className="mb-4">
                    Quỹ dự kiến sẽ trao tặng học bổng vào tháng 8 năm 2025 ngay trước thềm khai giảng năm học mới, với hy vọng 
                    những phần quà này sẽ giúp các em thêm vững tin trên con đường chinh phục tri thức và ước mơ. Mỗi hành động 
                    tiếp sức của quý vị là sẽ có thêm nhiều trẻ em khuyết tật được mở cánh cửa đến với một thế giới đầy tình 
                    yêu thương và cơ hội.
                  </p>

              <div className="bg-global-15 text-global-18 text-xs p-0 rounded mt-6">
                    *Toàn bộ số tiền quyên góp từ cộng đồng sẽ tự động chuyển thẳng tới Quỹ vì trẻ em khuyết tật Việt Nam 
                    (không qua DonaTrust) để triển khai dự án Tiếp sức đến trường 2025. Thông tin cập nhật về chương trình 
                    sẽ được cập nhật tại mục Báo cáo của dự án này.

              </div>

              {/* Sidebar - Charity Information */}
              <div className="w-[281px]">
                <div className="bg-global-2 rounded-sm p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-global-6 mb-4">
                    Charity Fundraising Information
                  </h3>
                  
                  {/* Organization Profile */}
                  <div className="flex items-center mb-6">
                    <img 
                      src="/images/img_ellipse_8_36x36.png" 
                      alt="Organization" 
                      className="w-9 h-9 rounded-full mr-3"
                    />
                    <span className="text-[15px] font-semibold leading-[17px] text-global-20">
                      Quỹ Vì trẻ em khuyết tật Việt Nam
                    </span>
                  </div>

            {/* Thông tin tổ chức */}
            <div className="w-full h-full lg:w-[300px] bg-white shadow-md p-5 rounded">
              <h3 className="text-sm font-bold text-global-6 mb-4">Thông tin tổ chức</h3>
              <div className="flex items-center mb-4">
                <img src="/images/img_ellipse_8_36x36.png" className="w-18 h-18 rounded-full mr-3" alt="Org" />
                <span className="text-[20px] font-semibold">Quỹ Vì trẻ em khuyết tật Việt Nam</span>
              </div>
              <p className="text-xs text-global-18 mb-3">
                "Quỹ Vì trẻ em khuyết tật Việt Nam là một tổ chức phi lợi nhuận, hoạt động trong lĩnh vực từ thiện, 
                      nhân đạo. Quỹ ra đời với mục đích làm cầu nối giữa các tổ chức, nhà hảo tâm với những trẻ em không may 
                      bị khuyết tật, di chứng chất độc da cam, nhằm chăm sóc, bảo vệ, giúp đỡ cuộc sống của các em, tạo điều 
                      kiện cho các em phát triển tối đa tiềm năng bản thân để có thể hòa nhập với cộng đồng."
              </p>
              <div className="text-xs text-global-16 mb-2">
                📍 Số 25 Vũ Trọng Phụng, Thanh Xuân, Hà Nội
              </div>
              <div className="text-xs text-global-16 mb-2">📞 0865019639</div>
              <div className="text-xs text-global-16">📧 quyvitreemkhuyettat@gmail.com</div>
            </div>
          </div>
        )

          {activeTab === 'donations' && (
            <div className="text-center py-8">
              <p className="text-global-6">Donation list will be displayed here.</p>
            </div>
          )}
        </div>

        {/* Share Campaign */}
        <div className="mt-8 mb-6">
          <h3 className="text-sm font-semibold text-global-19 mb-4">Share the campaign</h3>
          <button onClick={handleFacebookShare}>
            <img src="/images/img_rectangle_158.png" alt="Facebook" className="w-[70px] h-[26px]" />
          </button>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-global-19 mb-2">Review & Feedback</h3>
            <p className="text-sm font-semibold text-global-15 mb-4">User rating</p>
            
            {/* Rating Display */}
            <div className="flex items-center space-x-4 mb-6">
              <RatingBar rating={4} maxRating={5} size="medium" />
              <span className="text-sm font-semibold text-global-15">4.2 out of 5</span>
            </div>
          </div>

          {/* Sample Review */}
          <div className="bg-global-9 border border-global-9 rounded-md p-6 mb-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="/images/img_avatar.png" 
                  alt="User Avatar" 
                  className="w-6 h-6 rounded-full mr-3"
                />
                <span className="text-sm font-medium text-global-11">KaiB</span>
                <div className="w-1 h-1 bg-global-11 rounded-full mx-2"></div>
                <span className="text-sm font-normal text-global-11">22 Jul</span>
                <div className="ml-4 bg-global-14 text-global-11 px-3 py-1 rounded text-sm">
                  Donated
                </div>
              </div>
              <RatingBar rating={5} maxRating={5} size="small" />
            </div>
          </div>

          {/* Write Review Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleWriteReview}
              variant="outline"
              className="h-8 px-6 border border-button-2 text-button-2 rounded-md"
            >
              Write a review
            </Button>
          </div>
        </div>

        {/* Other Campaigns Section */}
        <div className="mt-12 bg-global-13 py-8">
          <h2 className="text-2xl font-bold text-center text-global-1 mb-8">Other campaigns</h2>
          
          <div className="flex justify-center space-x-8">
            {/* Campaign 1 */}
            <div className="w-[137px]">
              <div className="relative mb-4">
                <img 
                  src="/images/img_image_18_4.png" 
                  alt="Campaign 1" 
                  className="w-full h-[104px] object-cover rounded-sm"
                />
                <div className="absolute top-1 right-1 bg-global-7 text-global-8 px-1 py-0.5 rounded text-xs font-semibold">
                  Children
                </div>
              </div>
              <div className="bg-global-2 rounded-sm p-2 shadow-sm">
                <p className="text-xs font-semibold text-center underline text-global-6 mb-1">
                  Quỹ Từ tâm Đắk Lắk
                </p>
                <p className="text-sm font-semibold text-center text-global-3 mb-2">
                  Oh, who saves my face?
                </p>
                <img 
                  src="/images/img_rectangle_1.png" 
                  alt="Progress" 
                  className="w-full h-3 mb-1"
                />
                <div className="flex justify-between text-xs font-semibold text-global-6 mb-1">
                  <span>9.720.000</span>
                  <span>32.4%</span>
                </div>
                <p className="text-xs font-semibold text-global-6 mb-2">
                  with the goal of 30,000,000 VND
                </p>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-semibold text-global-5 mr-1">Detail</span>
                  <img 
                    src="/images/img_24_arrows_directions_right.svg" 
                    alt="Arrow" 
                    className="w-2 h-2"
                  />
                </div>
              </div>
              <img 
                src="/images/img_ellipse_8_2.png" 
                alt="Organization" 
                className="w-5 h-5 rounded-full mx-auto mt-2"
              />
            </div>

    {/* Chiến dịch 2 */}
    <div className="w-[206px]">
      <div className="relative mb-1 h-[130px]">
        <img
          src="/images/img_image_18_3.png"
          alt="Campaign 2"
          className="w-full h-full object-cover rounded-sm"
        />
        <div className="absolute top-1 right-1 bg-global-4 text-global-8 px-1 py-0.5 rounded text-xs font-semibold">
          Khuyết tật
        </div>
        <img
          src="/images/img_ellipse_8_3.png"
          alt="Org"
          className="w-10 h-10 rounded-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 border-2 border-white bg-white"
        />
      </div>
      <div className="bg-global-2 rounded-sm p-3 shadow-sm h-[160px] flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-center underline text-global-6 mb-1">
            Quỹ Hy vọng Huế
          </p>
          <p className="text-sm font-semibold text-center text-global-3 mb-2">
            XE LĂN ĐẾN TRƯỜNG
          </p>
          <img src="/images/img_rectangle_1.png" alt="Progress" className="w-full h-3 mb-1" />
          <div className="flex justify-between text-xs font-semibold text-global-6 mb-2">
            <span>5.300.000</span>
            <span>53.0%</span>
          </div>
          <p className="text-xs font-semibold text-global-6 mb-2">
            Mục tiêu 10,000,000 VND
          </p>
        </div>
        <div className="flex items-center justify-center cursor-pointer">
          <span className="text-xs font-semibold text-global-5 mr-1">Chi tiết</span>
          <img
            src="/images/img_24_arrows_directions_right.svg"
            alt="Arrow"
            className="w-2 h-2"
          />
        </div>
      </div>
    </div>

    {/* Chiến dịch 3 */}
    <div className="w-[206px]">
      <div className="relative mb-1 h-[130px]">
        <img
          src="/images/img_image_18_2.png"
          alt="Campaign 3"
          className="w-full h-full object-cover rounded-sm"
        />
        <div className="absolute top-1 right-1 bg-global-4 text-global-8 px-1 py-0.5 rounded text-xs font-semibold">
          Thiếu nhi
        </div>
        <img
          src="/images/img_image_18_2.png"
          alt="Org"
          className="w-10 h-10 rounded-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 border-2 border-white bg-white"
        />
      </div>
      <div className="bg-global-2 rounded-sm p-3 shadow-sm h-[160px] flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-center underline text-global-6 mb-1">
            Quỹ Ước mơ nhỏ
          </p>
          <p className="text-sm font-semibold text-center text-global-3 mb-2">
            MÁI TRƯỜNG CHO EM
          </p>
          <img src="/images/img_rectangle_1.png" alt="Progress" className="w-full h-3 mb-1" />
          <div className="flex justify-between text-xs font-semibold text-global-6 mb-2">
            <span>12.500.000</span>
            <span>41.7%</span>
          </div>
          <p className="text-xs font-semibold text-global-6 mb-2">
            Mục tiêu 30,000,000 VND
          </p>
        </div>
        <div className="flex items-center justify-center cursor-pointer">
          <span className="text-xs font-semibold text-global-5 mr-1">Chi tiết</span>
          <img
            src="/images/img_24_arrows_directions_right.svg"
            alt="Arrow"
            className="w-2 h-2"
          />
        </div>
      </div>
    </div>
  </div>

  {/* Nút xem thêm */}
  <div className="mt-4">
    <button className="text-sm font-semibold text-global-7 hover:underline">
      Xem thêm chiến dịch
    </button>
  </div>
</div>



      </div>

    </div>
  );
};

export default CampaignDetail;
