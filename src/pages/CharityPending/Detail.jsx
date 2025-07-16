import React from 'react';
import { FaMapMarkerAlt, FaRegStar } from 'react-icons/fa';

const CampaignDetail = () => {
  return (
    <div className="bg-global-3 min-h-screen">
      {/* Banner */}
      <div className="w-full h-[300px]">
        <img src="/images/cham-pending.png" alt="Banner" className="w-full h-full object-cover" />
      </div>

      {/* Nội dung chính */}
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-[20px] shadow-lg mt-[-80px] relative z-10">
        {/* Thông tin tiêu đề */}
        <div className="text-center mb-8">
          <p className="text-sm text-global-4">Chiến dịch gây quỹ cộng đồng</p>
          <h2 className="text-lg font-semibold text-button-4 mt-1">Quỹ Vì Trẻ Em Khuyết Tật Việt Nam</h2>
          <h1 className="text-[24px] font-bold text-global-1 mt-3 leading-snug">
            Chung tay giúp bé Chẳng Thị Hà chữa căn bệnh hiểm nghèo
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Bên trái: Nội dung chi tiết */}
          <div className="lg:w-2/3">
            <button className="mb-5 px-5 py-2 bg-button-4 text-white text-sm rounded-full hover:bg-button-3 transition">
              Nội dung chi tiết
            </button>
            <p className="text-sm text-global-2 leading-7">
              Mỗi đứa trẻ đều có ước mơ được học tập, hòa nhập và có bạn đồng hành. Nhưng Hà đã bị tước mất điều đó ngay từ khi sinh ra. 
              Bé mắc một căn bệnh hiếm gặp khiến việc đi lại, nói chuyện và sinh hoạt hằng ngày trở nên vô cùng khó khăn. 
              <br /><br />
              Gia đình Hà đang ngày đêm chật vật kiếm tiền để chữa trị và lo chi phí sinh hoạt tối thiểu. Nhờ sự giúp đỡ của cộng đồng, Hà hiện đang được điều trị tại Bệnh viện Nhi Trung ương. Tuy nhiên, chi phí đã vượt quá khả năng gia đình.
              <br /><br />
              Chiến dịch này nhằm kêu gọi 200.000.000 VNĐ để chi trả viện phí, chi phí phẫu thuật và phục hồi chức năng.
              <br /><br />
              Mỗi lượt bỏ phiếu của bạn giúp xác minh tính minh bạch và đẩy nhanh quá trình duyệt chiến dịch này.
            </p>
          </div>

          {/* Bên phải: Voting & Comment */}
          <div className="lg:w-1/3 bg-global-3 p-5 rounded-[16px] border border-gray-200 flex flex-col gap-4">
            <p className="text-sm text-global-4">
              Thời gian còn lại để bỏ phiếu: <span className="font-semibold text-global-1">7 ngày</span>
            </p>

            <div>
              <p className="text-sm text-global-4 mb-1">Tiến trình bỏ phiếu</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[70%]"></div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-green-600 font-semibold">Đồng ý 70%</span>
                <span className="text-red-500 font-semibold">Không đồng ý 30%</span>
              </div>
              <p className="text-xs text-global-4 mt-1">
                ✓ 7 lượt đồng ý <br />
                ✗ 3 lượt không đồng ý
              </p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-sm text-global-1 mb-2">Đánh giá & Bình luận</h4>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-3">
                  <textarea
                    rows={2}
                    placeholder="Nhập bình luận của bạn..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-button-4"
                  ></textarea>
                  <div className="flex mt-2 space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <FaRegStar key={j} className="text-yellow-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-full transition">
                Đồng ý
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-full transition">
                Không đồng ý
              </button>
            </div>

            <button className="text-xs text-gray-400 hover:underline mt-3 self-end">
              Báo cáo / Gắn cờ
            </button>
          </div>
        </div>

        {/* Phản hồi thêm */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm font-semibold mb-2 text-global-1">
            Bạn có biết gì về chiến dịch này?
          </p>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-button-4"
            placeholder="Chia sẻ thông tin, câu chuyện hoặc những lo ngại của bạn..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
