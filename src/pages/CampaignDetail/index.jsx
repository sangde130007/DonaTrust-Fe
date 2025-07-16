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
    alert('Cảm ơn bạn đã ủng hộ! Đang chuyển hướng đến trang quyên góp...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Ủng hộ học sinh đến trường năm 2025',
        text: 'Hãy giúp đỡ trẻ em khuyết tật tiếp cận giáo dục',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết chiến dịch!');
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
            <span className="text-global-10">CHIẾN DỊCH</span>
            <span className="text-global-8"> </span>
            <span className="text-global-7">GÂY QUỸ</span>
            <span className="text-global-8"> </span>
            <span className="text-global-5">TỪ THIỆN</span>
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
            <div className="relative mb-0">
              <img src="/images/img_image_18_273x359.png" alt="Campaign" className="w-full h-[350px] object-cover rounded-lg" />
              <div className="absolute top-4 right-4 bg-global-4 text-white px-3 py-1 rounded text-sm font-semibold">Trẻ em</div>
            </div>
          </div>

          {/* Thông tin chiến dịch */}
          <div className="flex-1">
            <div className="bg-white rounded-sm p-6 shadow-md">
              <h2 className="text-2xl font-bold text-global-3 mb-2">Hỗ trợ học sinh đến trường năm 2025</h2>
              <div className="flex items-center mb-4">
                <img src="/images/img_ellipse_8_39x39.png" alt="Tổ chức" className="w-10 h-10 rounded-full mr-3" />
                <span className="text-base font-semibold text-global-6">Quỹ Vì trẻ em khuyết tật Việt Nam</span>
              </div>

              <div className="flex justify-between text-sm mb-2 font-inter text-global-6">
                <span>Mục tiêu</span>
                <span>30.000.000 VND</span>
              </div>
              <img src="/images/img_rectangle_1.png" alt="Progress" className="w-full h-[22px] mb-2" />

              <div className="flex justify-between mb-2 text-sm text-global-6 font-semibold">
                <span>85 lượt quyên góp</span>
                <span>Đã đạt được</span>
              </div>
              <div className="text-right text-xl font-bold text-global-21 mb-6">9.720.000 VND</div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img src="/images/img__28x20.png" alt="Thời gian" className="w-5 h-5 mr-2" />
                  <div>
                    <p className="text-xs font-semibold text-global-6">Còn lại</p>
                    <p className="text-sm font-semibold text-global-6">87 ngày</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/donationinfor">
                    <Button variant="secondary" className="h-9 px-4 text-sm bg-global-7 text-white rounded-sm">
                      Quyên góp
                    </Button>
                  </Link>
                  <Button onClick={handleShare} variant="primary" className="h-9 px-4 text-sm border border-gray-300 text-global-6 rounded-sm">
                    Chia sẻ
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
        )}

        {activeTab === 'donations' && (
  <div className="py-8 text-global-6 text-sm">
    {/* Search Donor */}
    <div className="mt-3 mb-4">
      <input
        type="text"
        className="w-full border px-3 py-2 rounded text-sm"
        placeholder="Nhập tên người quyên góp..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </div>

    {/* Donor Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-3 text-left font-semibold">Người quyên góp</th>
            <th className="py-2 px-3 text-left font-semibold">Số tiền</th>
            <th className="py-2 px-3 text-left font-semibold">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {pagedDonors.map((d, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="py-2 px-3">{d.name}</td>
              <td className="py-2 px-3">{d.amount}</td>
              <td className="py-2 px-3">{d.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        className="px-3 h-8 rounded border text-gray-500 border-gray-300 bg-white"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          className={`w-8 h-8 rounded border font-bold ${
            currentPage === i + 1
              ? 'text-pink-600 border-pink-500 bg-pink-100'
              : 'text-gray-700 border-gray-300 bg-white'
          }`}
          onClick={() => handlePageClick(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-3 h-8 rounded border text-gray-500 border-gray-300 bg-white"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  </div>
)}


        {/* Chia sẻ */}
        <div className="mt-12">
          <h3 className="text-sm font-bold text-global-19 mb-2">Chia sẻ chiến dịch</h3>
          <button onClick={handleFacebookShare}>
            <img src="/images/img_rectangle_158.png" alt="Facebook" className="w-[70px] h-[26px]" />
          </button>
        </div>

        {/* Đánh giá */}
        <div className="mt-10">
  <h3 className="text-xl font-bold text-global-19 mb-2">Đánh giá & Phản hồi</h3>
  <p className="text-sm font-semibold text-global-15 mb-4">Đánh giá từ người dùng</p>

  <div className="flex items-center gap-4 mb-6">
    <RatingBar rating={4.2} maxRating={5} size="medium" />
    <span className="text-sm font-semibold text-global-15">4.2 trên 5</span>
  </div>

  {/* Danh sách đánh giá */}
  {reviews.map((review) => (
    <div key={review.id} className="bg-global-9 border border-global-9 rounded-md p-4 shadow-md mb-6">
      <div className="flex items-center justify-between mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <img src={review.avatar} alt="User" className="w-6 h-6 rounded-full" />
          <span className="text-sm font-medium">{review.name}</span>
          <span className="text-sm text-global-11">• {review.date}</span>
          {review.donated && (
            <span className="ml-4 bg-global-14 text-global-11 px-2 py-1 rounded text-xs">
              Đã quyên góp
            </span>
          )}
        </div>
        <RatingBar rating={review.rating} maxRating={5} size="small" />
      </div>
      <p className="text-sm text-global-11 mb-3">{review.content}</p>

      {/* Like & Reply */}
      <div className="flex gap-6 text-xs text-global-15 font-medium mb-2">
        <button className="flex items-center gap-1 hover:text-red-600">
          <FaRegHeart className="text-red-500" />
          <span>Thích ({review.likes})</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <FaReply />
          <span>Trả lời</span>
        </button>
      </div>

      {/* Các câu trả lời */}
      {review.replies.map((reply) => (
        <div key={reply.id} className="pl-6 mt-2 border-l border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-global-19">{reply.name}</span>
            <span className="text-xs text-global-11">• {reply.date}</span>
          </div>
          <p className="text-sm text-global-11">{reply.content}</p>
        </div>
      ))}
    </div>
  ))}

  {/* Nhập đánh giá mới */}
  <div className="mt-8 border-t pt-6">
    <h4 className="text-sm font-semibold mb-2">Gửi đánh giá của bạn</h4>
    <div className="flex items-center gap-4 mb-4">
      <span className="text-sm font-medium">Đánh giá:</span>
      <ReactStars
        count={5}
        value={ratingValue}
        onChange={setRatingValue}
        size={24}
        activeColor="#ffd700"
      />
    </div>
    <textarea
      value={reviewText}
      onChange={(e) => setReviewText(e.target.value)}
      rows={4}
      placeholder="Nhập nội dung đánh giá của bạn..."
      className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-blue-500"
    />
    <div className="flex justify-end mt-4">
      <Button onClick={handleSendReview} variant="secondary" className="h-9 px-6 rounded-md bg-global-7 text-white">
        Gửi đánh giá
      </Button>
    </div>
  </div>
</div>
{/* Các chiến dịch khác */}
<div className="mt-16 px-[15%] text-center">
  <h3 className="text-xl font-bold text-global-19 mb-6">CÁC CHIẾN DỊCH GÂY QUỸ KHÁC</h3>

  <div className="flex flex-wrap justify-center gap-6 mb-6">
    {/* Chiến dịch 1 */}
    <div className="w-[206px]">
      <div className="relative mb-1 h-[130px]">
        <img
          src="/images/img_image_18_4.png"
          alt="Campaign 1"
          className="w-full h-full object-cover rounded-sm"
        />
        <div className="absolute top-1 right-1 bg-global-4 text-global-8 px-1 py-0.5 rounded text-xs font-semibold">
          Trẻ em
        </div>
        <img
          src="/images/img_ellipse_8_2.png"
          alt="Org"
          className="w-10 h-10 rounded-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 border-2 border-white bg-white"
        />
      </div>
      <div className="bg-global-2 rounded-sm p-3 shadow-sm h-[160px] flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-center underline text-global-6 mb-1">
            Quỹ Từ Tâm Đắk Lắk
          </p>
          <p className="text-sm font-semibold text-center text-global-3 mb-2">
            CHUNG TAY ĐẾN TRƯỜNG
          </p>
          <img src="/images/img_rectangle_1.png" alt="Progress" className="w-full h-3 mb-1" />
          <div className="flex justify-between text-xs font-semibold text-global-6 mb-2">
            <span>9.720.000</span>
            <span>32.4%</span>
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
