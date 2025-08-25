import React, { useState } from 'react';
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import axios from "axios"; // Dùng axios để gọi API

const ReportCampaign = () => {
  // State quản lý các lựa chọn báo cáo
  const reasonsList = [
    "Thông tin chưa được xác thực",
    "Không có bằng chứng rõ ràng",
    "Sử dụng hình ảnh/thông tin nhạy cảm không đúng cách",
    "Có dấu hiệu lừa đảo/chiếm đoạt",
    "Tổ chức gây quỹ này không đáng tin cậy",
    "Khác"
  ];
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [commit, setCommit] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi tick checkbox lý do
  const handleReasonChange = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((item) => item !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  // Hàm xử lý khi submit báo cáo
  const handleSubmit = async () => {
    if (!commit) {
      alert("Vui lòng xác nhận cam kết trước khi gửi báo cáo!");
      return;
    }

    if (selectedReasons.length === 0) {
      alert("Vui lòng chọn ít nhất một lý do để báo cáo!");
      return;
    }

    setLoading(true);
    try {
      // Tạo formData để gửi kèm file
      const formData = new FormData();
      formData.append("campaignId", "12345"); // ID chiến dịch (thay thế bằng dữ liệu thực)
      formData.append("reasons", JSON.stringify(selectedReasons));
      formData.append("otherReason", otherReason);
      formData.append("description", description);
      files.forEach((file) => formData.append("files", file));

      // Gọi API
      const response = await axios.post("/api/report-campaign", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        alert("Báo cáo đã được gửi thành công!");
        // Reset form sau khi gửi
        setSelectedReasons([]);
        setOtherReason("");
        setDescription("");
        setFiles([]);
        setCommit(false);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Thông tin chiến dịch */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          📢 BÁO CÁO CHIẾN DỊCH GÂY QUỸ
        </h1>

        <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hình ảnh chiến dịch */}
          <div>
            <img
              src="/images/img_image_18_4.png"
              alt="Chiến dịch giúp đỡ Chang Thi Ha"
              className="w-full h-64 object-cover rounded-md"
            />
          </div>

          {/* Thông tin chiến dịch */}
          <div className="space-y-2 text-sm">
            <h2 className="text-lg font-semibold text-red-600">
              Hãy giúp Chang Thi Ha chữa trị căn bệnh nghiêm trọng.
            </h2>
            <p><strong>🎯 Mục tiêu chiến dịch:</strong> 30,000,000 VND</p>
            <p><strong>📍 Địa điểm:</strong> Hà Giang</p>
            <p><strong>⏳ Trạng thái:</strong> Đang chờ phê duyệt</p>
            <p><strong>📅 Ngày bắt đầu:</strong> 11/11/2025</p>
          </div>
        </div>
      </section>

      {/* Form báo cáo */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Lý do báo cáo */}
          <h2 className="text-lg font-semibold">📝 Lý do bạn muốn báo cáo chiến dịch này</h2>

          <div className="space-y-2 text-sm">
            {reasonsList.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`reason-${idx}`}
                  className="mt-1"
                  checked={selectedReasons.includes(reason)}
                  onChange={() => handleReasonChange(reason)}
                />
                <label htmlFor={`reason-${idx}`}>{reason}</label>
              </div>
            ))}

            {/* Lý do khác */}
            {selectedReasons.includes("Khác") && (
              <textarea
                placeholder="Nếu chọn 'Khác', vui lòng mô tả..."
                className="w-full mt-2 p-2 border rounded-md text-sm"
                rows={3}
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            )}
          </div>

          {/* Mô tả thêm */}
          <div>
            <h3 className="text-sm font-medium mb-1">📄 Mô tả bổ sung (nếu có)</h3>
            <textarea
              placeholder="Cung cấp thêm chi tiết nếu cần..."
              className="w-full p-2 border rounded-md text-sm"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Upload tài liệu */}
          <div>
            <h3 className="text-sm font-medium mb-1">📎 Tài liệu hoặc hình ảnh minh chứng (tùy chọn)</h3>
            <input
              type="file"
              className="text-sm"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </div>

          {/* Cam kết */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="commit"
              className="mt-1"
              checked={commit}
              onChange={(e) => setCommit(e.target.checked)}
            />
            <label htmlFor="commit" className="text-sm">
              Tôi cam kết phản ánh trung thực và chịu trách nhiệm về nội dung báo cáo này.
            </label>
          </div>

          {/* Nút gửi */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`${
                loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              } text-white px-6 py-2 rounded-md text-sm font-semibold`}
            >
              {loading ? "Đang gửi..." : "GỬI BÁO CÁO"}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ReportCampaign;
