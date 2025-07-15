import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import './campaignPendingDetail.css';
import { useNavigate, useParams } from 'react-router-dom';

const CampaignPendingDetailPage = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams(); // Lấy campaign id từ URL
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(32.4);
  }, []);

  const handleApprove = () => {
    Modal.confirm({
      title: 'Approve/Reject',
      content: (
        <div>
          <p>Are you sure about this?</p>
          <TextArea placeholder="Enter your reason..." rows={4} />
        </div>
      ),
      okText: 'Ok',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        setShowModal(false);
      },
      onCancel() {
        // không làm gì cả
      },
    });
  };

  return (
    <div className="min-h-screen bg-global-3 shadow-2xl">
      <Header />
      {/* Banner */}
      <div className="campaign-pending-detail-banner text-center text-white d-flex align-items-center justify-content-center flex-column"></div>
      {/* Main Content */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="campaign-pending-detail">
          <div className="campaign-detail-container">
            <div className="campaign-header">
              <p className="campaign-subtitle">Charity Fundraising</p>
              <h3 className="campaign-org">Quỹ Vì trẻ em khuyết tật Việt Nam</h3>
              <h1 className="campaign-title">Please help Chang Thi Ha cure her serious illness.</h1>
            </div>

            <div className="campaign-content-wrapper">
              {/* Left content */}
              <div className="campaign-content">
                <p>
                  Mỗi đứa trẻ đều có ước mơ và khát khao được học tập, được hòa nhập và có những người bạn đồng hành trên hành trình trưởng thành. Nhưng không phải trẻ em nào cũng có được cơ hội đó, đặc biệt là trẻ khuyết tật. Nếu không được đến trường, các em không chỉ mất đi cơ hội tiếp cận kiến thức mà còn mất đi những cơ hội quý giá để kết bạn và cảm thấy gắn kết với thế giới xung quanh. Sự cô đơn, nhút nhát và những rào cản vô hình có thể kìm hãm các em trong thế giới riêng của mình, trong khi chỉ cần một cơ hội, một cánh cửa mở ra, có thể thay đổi tương lai và cuộc sống của các em.Năm 2025, Quỹ sẽ tiếp tục
                  phối hợp với Đoàn Thanh niên Cộng sản Bộ Ngoại giao
                  thực hiện chương trình ý nghĩa này với mục tiêu trao tặng 1.200 suất học bổng,
                  mỗi suất trị giá 4.000.000 đồng. Chúng tôi đang kêu gọi gây quỹ 200 triệu đồng trên
                  nền tảng DonaTrust, tương đương 50 suất học bổng, và sẽ mở rộng kêu gọi trên
                  các nền tảng khác để lan tỏa sự hỗ trợ đến nhiều trẻ em khuyết tật hơn. Chương trình “Hỗ trợ đến trường” của Quỹ Bảo trợ Trẻ em Khuyết tật không chỉ hỗ trợ vật chất
                  và điều kiện học tập cho trẻ em khuyết tật, mà còn mang đến cho các em
                  cơ hội - cơ hội được học tập, kết bạn, hòa nhập và phát triển
                  bình đẳng.Mỗi đứa trẻ đều có ước mơ và khát khao được học tập, được hòa nhập và có những người bạn đồng hành trên hành trình trưởng thành. Nhưng không phải trẻ em nào cũng có được cơ hội đó, đặc biệt là trẻ khuyết tật. Nếu không được đến trường, các em không chỉ mất đi cơ hội tiếp cận kiến thức mà còn mất đi những cơ hội quý giá để kết bạn và cảm thấy gắn kết với thế giới xung quanh. Sự cô đơn, nhút nhát và những rào cản vô hình có thể kìm hãm các em trong thế giới riêng của mình, trong khi chỉ cần một cơ hội, một cánh cửa mở ra, có thể thay đổi tương lai và cuộc sống của các em.</p>
                  <h5 className="campaign-question">
                    Bạn biết gì về chiến dịch gây quỹ này?
                  </h5>
                  <div className="campaign-feedback">
                    <textarea placeholder="Please leave any additional information you know about this fundraising campaign..." />
                    <button className="btn-send-icon" title="Send">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="send-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
              </div>

              {/* Right vote box */}
              <div className="vote-box">
                <div className="vote-info">
                  <p>
                    <span>🕒</span> Thời gian còn lại để bỏ phiếu: <strong>15 ngày</strong>
                  </p>
                  <p>
                    🎯 Mục tiêu: <strong>30,000,000 VND</strong>
                  </p>
                </div>

                <div className="vote-progress">
                  <div className="vote-bar">
                    <div
                      className="ĐỒNG ý"
                      style={{
                        width: '50%',
                      }}
                    />
                    <div
                      className="TỪ CHỐI"
                      style={{
                        width: '50%',
                      }}
                    />
                  </div>
                  <div className="vote-labels">
                    <span className="agree-label">ĐỒNG Ý: 50%</span>
                    <span className="disagree-label">50%</span>
                  </div>
                </div>

                <p className="total-votes">🧮 Tổng cộng 20 phiếu bầu</p>
                <p className="votes-detail">✅ 10 phiếu đồng ý &nbsp;&nbsp; ❌ 10 phiếu từ chối</p>

                <div className="vote-comments">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="comment-box">
                      <div className="comment-header">
                        <input type="checkbox" name={`vote${i}`} />
                        <span>Bình luận{i}</span>
                      </div>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={star <= (hover || rating) ? 'star filled' : 'star'}
                            onClick={() => {
                              setRating(star);
                              console.log(star);
                            }}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="vote-actions">
                  <button
                    className="btn-agree"
                    onClick={() => {
                      handleApprove();
                    }}
                  >
                    DôNG Ý
                  </button>
                  <button className="btn-disagree">TỪ CHỐI</button>
                </div>

                <p className="report-flag">
                  🚩 <a href="#">Gắn cờ/Báo cáo lừa đảo</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CampaignPendingDetailPage;
