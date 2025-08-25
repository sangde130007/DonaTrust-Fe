import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const MyDaoProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      <div
        className="h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/img__1.png')" }}
      >
        <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-40">
          <h1 className="text-white text-4xl font-bold">
            Hồ sơ DAO của tôi
          </h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-[15%] py-12 space-y-8">
        {/* Thông tin hồ sơ */}
        <section className="bg-white shadow-md rounded-lg p-8 relative -mt-20 z-10">
          <div className="flex items-center space-x-6">
            <img
              src="/path-to-avatar.jpg"
              alt="Avatar người dùng"
              className="h-24 w-24 rounded-full border-4 border-white shadow"
            />
            <div>
              <h1 className="text-2xl font-bold">Nguyễn Tiến Đạt</h1>
              <p className="text-gray-600 text-sm">@datnguyentien109</p>
              <p className="text-gray-500 text-sm">0 người theo dõi • 0 bài viết</p>
            </div>
          </div>
        </section>

        {/* Giới thiệu */}
        <div className="text-center mt-6">
          <h2 className="text-xl font-semibold">Thông tin DAO</h2>
          <p className="text-gray-700 text-sm mt-2">
            Tham gia giám sát cộng đồng, đóng góp xác minh và phát triển các chiến dịch gây quỹ minh bạch.
          </p>
        </div>

        {/* Tổng quan */}
        <section className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">📋 Tổng quan</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Trạng thái:</strong> ✅ Thành viên DAO</div>
            <div><strong>Ngày tham gia:</strong> 05/05/2025</div>
            <div><strong>Tổng số phiếu bầu:</strong> 15 phiếu</div>
            <div><strong>Tỷ lệ tham gia:</strong> 75% (15/20 đề xuất)</div>
            <div><strong>Điểm đóng góp cộng đồng:</strong> 🌟 135 điểm</div>
            <div><strong>Xếp hạng:</strong> Thành viên DAO Cấp 2</div>
            <div><strong>Huy hiệu:</strong> 🥈 Người đóng góp tích cực</div>
          </div>
        </section>

        {/* Điểm & Xếp hạng */}
        <section className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">🏅 Điểm đóng góp & Xếp hạng</h2>
          <p className="text-sm mb-2"><strong>Điểm hiện tại:</strong> 135</p>
          <ul className="list-disc list-inside text-sm">
            <li>Mỗi lần bỏ phiếu: +10 điểm</li>
            <li>Bình luận tích cực: +5 điểm</li>
          </ul>
        </section>

        {/* Lịch sử bỏ phiếu */}
        <section className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">🗳️ Lịch sử bỏ phiếu</h2>
          <div className="space-y-4">
            {[
              {
                title: "Giúp các bậc phụ huynh nghèo có cơ hội cứu con",
                vote: "👍 Đồng ý",
                result: "✅ Đã phê duyệt",
                date: "01/06/2025"
              },
              {
                title: "Hỗ trợ em Chang Thị Hà chữa bệnh hiểm nghèo",
                vote: "👍 Đồng ý",
                result: "✅ Đã phê duyệt",
                date: "30/05/2025"
              },
              {
                title: "Giải tỏa đất rừng để xây nhà cho người dân",
                vote: "👎 Không đồng ý",
                result: "❌ Đã từ chối",
                date: "29/05/2025"
              },
              {
                title: "Một nghìn cánh diều cho trẻ em vùng cao",
                vote: "👍 Đồng ý",
                result: "⏳ Đang xét duyệt",
                date: "29/05/2025"
              }
            ].map((item, idx) => (
              <div key={idx} className="border-b pb-2">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">
                  Bỏ phiếu: {item.vote} | Kết quả: {item.result} | Ngày bỏ phiếu: {item.date}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tùy chọn và hành động */}
        <section className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">⚙️ Tùy chọn và hành động</h2>
          <div className="space-y-3">
            <button className="text-blue-600 hover:underline text-sm">
              🔗 Xem điều khoản thành viên DAO
            </button>
            <button className="text-red-600 hover:underline text-sm">
              🧾 Rút khỏi thành viên DAO
            </button>
          </div>
        </section>
      </main>

    </div>
  );
};

export default MyDaoProfile;
