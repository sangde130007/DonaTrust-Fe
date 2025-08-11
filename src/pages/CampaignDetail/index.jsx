<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import campaignService from '../../services/campaignService';
=======
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import RatingBar from '../../components/ui/RatingBar';
>>>>>>> 23c75cb (payment)

const API_ORIGIN = 'http://localhost:5000';

const resolveImageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/uploads')) return `${API_ORIGIN}${p}`;
  return `${API_ORIGIN}/public/images/${p}`;
};

const CampaignDetailPage = () => {
  const { id } = useParams();
<<<<<<< HEAD
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        console.error('Lỗi lấy chi tiết chiến dịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) return <div className="text-center py-10">Đang tải chiến dịch...</div>;
  if (!campaign) return <div className="text-center py-10 text-red-500">Không tìm thấy chiến dịch.</div>;

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + ' VND';
  const getProgress = () => {
    const percent = (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100;
    return Math.min(100, percent).toFixed(1);
=======
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('detailed');
  const [reviewText, setReviewText] = useState('');
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDonationHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/donations/history?page=${page}&limit=5`, {
          params: { campaign_id: id },
        });
        setDonationHistory(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError('Không thể tải lịch sử quyên góp');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'donations') {
      fetchDonationHistory();
    }
  }, [activeTab, id, page]);

  const handleDonate = () => {
    navigate(`/donation/${id}`);
>>>>>>> 23c75cb (payment)
  };

  const daysLeft = () => {
    const now = new Date();
    const end = new Date(campaign.end_date);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>

<<<<<<< HEAD
          {campaign.image_url && (
            <img
              src={resolveImageUrl(campaign.image_url)}
              alt="Ảnh chiến dịch"
              className="mb-6 w-full max-w-xl rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
=======
      {/* Main Content */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Campaign Info Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left Column - Campaign Image and Details */}
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

          {/* Right Column - Campaign Details */}
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

              {/* Progress Bar */}
              <div className="w-full h-[22px] mb-4">
                <img 
                  src="/images/img_rectangle_1.png" 
                  alt="Progress" 
                  className="w-full h-full object-cover"
                />
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
                  <img 
                    src="/images/img__28x20.png" 
                    alt="Time" 
                    className="w-[20px] h-[28px] mr-3"
                  />
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

        {/* Tab Navigation */}
        <div className="flex mb-6">
          <Button
            onClick={() => setActiveTab('detailed')}
            variant={activeTab === 'detailed' ? 'tabActive' : 'tab'}
            className="h-9 px-8 rounded-none rounded-tl-[18px] border-b-0"
          >
            Detailed content
          </Button>
          <Button
            onClick={() => setActiveTab('donations')}
            variant={activeTab === 'donations' ? 'tabActive' : 'tab'}
            className="h-9 px-8 rounded-none rounded-tr-[18px] border-l border-global-8 text-global-11"
          >
            Donation List
          </Button>
        </div>

        {/* Tab Content */}
        <div className="border-t border-global-8 pt-6">
          {activeTab === 'detailed' && (
            <div className="flex gap-8">
              {/* Main Content */}
              <div className="flex-1">
                <div className="text-xs font-medium leading-4 text-global-18 mb-6">
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
                  <p>Trân trọng và biết ơn sự đóng góp của Quý vị.</p>
                </div>

                {/* Important Note */}
                <div className="bg-global-15 p-4 rounded">
                  <p className="text-xs font-medium leading-4 text-global-18">
                    *Toàn bộ số tiền quyên góp từ cộng đồng sẽ tự động chuyển thẳng tới Quỹ vì trẻ em khuyết tật Việt Nam 
                    (không qua DonaTrust) để triển khai dự án Tiếp sức đến trường 2025. Thông tin cập nhật về chương trình 
                    sẽ được cập nhật tại mục Báo cáo của dự án này.
                  </p>
                </div>
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

                  {/* Organization Description */}
                  <div className="relative mb-6">
                    <p className="text-xs font-medium leading-4 text-global-18 mb-4">
                      "Quỹ Vì trẻ em khuyết tật Việt Nam là một tổ chức phi lợi nhuận, hoạt động trong lĩnh vực từ thiện, 
                      nhân đạo. Quỹ ra đời với mục đích làm cầu nối giữa các tổ chức, nhà hảo tâm với những trẻ em không may 
                      bị khuyết tật, di chứng chất độc da cam, nhằm chăm sóc, bảo vệ, giúp đỡ cuộc sống của các em, tạo điều 
                      kiện cho các em phát triển tối đa tiềm năng bản thân để có thể hòa nhập với cộng đồng."
                    </p>
                    
                    {/* Location */}
                    <div className="flex items-start mb-4">
                      <img 
                        src="/images/img_24_user_interface_location.svg" 
                        alt="Location" 
                        className="w-6 h-6 mr-2 mt-1"
                      />
                      <div>
                        <p className="text-xs font-medium leading-4 text-global-16">
                          Số 25 Vũ Trọng Phụng, phường Thanh Xuân Trung, quận Thanh Xuân, Hà Nội
                        </p>
                        <p className="text-xs font-medium leading-[14px] text-global-16 mt-2">
                          0865019639
                        </p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center">
                      <img 
                        src="/images/img_24_user_interface_send.svg" 
                        alt="Email" 
                        className="w-6 h-6 mr-2"
                      />
                      <div className="flex items-center">
                        <img 
                          src="/images/img_mail.svg" 
                          alt="Mail" 
                          className="w-4 h-4 mr-2"
                        />
                        <span className="text-xs font-medium leading-[14px] text-global-16">
                          quyvitreemkhuyettat@gmail.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="text-left py-8">
              {loading && <p className="text-global-6">Đang tải...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && donationHistory.length === 0 && (
                <p className="text-global-6">Chưa có quyên góp nào.</p>
              )}
              {!loading && !error && donationHistory.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-global-6">
                      <thead className="bg-global-2">
                        <tr>
                          <th className="py-2 px-4 text-left">Tên</th>
                          <th className="py-2 px-4 text-left">Email</th>
                          <th className="py-2 px-4 text-left">Lời chúc</th>
                          <th className="py-2 px-4 text-left">Số tiền</th>
                          <th className="py-2 px-4 text-left">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donationHistory.map((donation, index) => (
                          <tr key={index} className="border-t border-global-8">
                            <td className="py-2 px-4">{donation.name || 'Ẩn danh'}</td>
                            <td className="py-2 px-4">{donation.email || 'Ẩn danh'}</td>
                            <td className="py-2 px-4">{donation.message}</td>
                            <td className="py-2 px-4">{donation.amount}</td>
                            <td className="py-2 px-4">{donation.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex justify-center mt-4 space-x-2">
                    <Button
                      onClick={() => handlePageChange(page - 1)}
                      variant="outline"
                      className="h-8 px-4 border border-button-2 text-button-2 rounded-md disabled:opacity-50"
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <span className="flex items-center text-global-6">
                      Trang {page} / {totalPages}
                    </span>
                    <Button
                      onClick={() => handlePageChange(page + 1)}
                      variant="outline"
                      className="h-8 px-4 border border-button-2 text-button-2 rounded-md disabled:opacity-50"
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Share Campaign */}
        <div className="mt-8 mb-6">
          <h3 className="text-sm font-semibold text-global-19 mb-4">Share the campaign</h3>
          <button onClick={handleFacebookShare}>
            <img 
              src="/images/img_rectangle_158.png" 
              alt="Share on Facebook" 
              className="w-[70px] h-[26px]"
>>>>>>> 23c75cb (payment)
            />
          )}

          <p className="text-lg text-gray-700 mb-6">{campaign.description}</p>

          {campaign.detailed_description && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Câu chuyện</h2>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {campaign.detailed_description}
              </p>
            </div>
          )}

          {campaign.gallery_images?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {campaign.gallery_images.map((img, idx) => (
                <img
                  key={idx}
                  src={resolveImageUrl(img)}
                  alt={`Gallery ${idx}`}
                  className="rounded-lg border object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 space-y-5">
          <div className="text-sm text-gray-500">Tiền ủng hộ được chuyển đến</div>
          <div className="font-bold text-xl text-green-600">
            {campaign.charity?.name || 'Đơn vị tiếp nhận'}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mục tiêu</span>
              <span className="font-semibold">{formatCurrency(campaign.goal_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Thời gian còn lại</span>
              <span className="text-green-600 font-semibold">{daysLeft()} ngày</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Địa điểm</span>
              <span>{campaign.location}</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${getProgress()}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>Đã đạt được</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(campaign.current_amount)} ({getProgress()}%)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold">
              Ủng hộ
            </button>
            <button className="flex-1 border border-green-500 text-green-500 hover:bg-green-100 py-2 rounded-lg font-semibold">
              Đồng hành gây quỹ
            </button>
          </div>

          {/* QR */}
          {campaign.qr_code_url && (
            <div className="text-center pt-4">
              <img
                src={resolveImageUrl(campaign.qr_code_url)}
                alt="QR code"
                className="mx-auto w-full max-w-xs rounded-lg border object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="text-sm mt-2 text-gray-600">Ủng hộ qua mã QR</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
