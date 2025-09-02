import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import campaignService from '../../services/campaignService';

const API_ORIGIN = 'http://localhost:5000';
const MAX_REPORT_FILES = 5;
const MAX_IMG_MB = 10;

// Modal component
const AlertModal = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
        <h3
          className={`text-lg font-semibold mb-4 ${type === "success" ? "text-green-600" : "text-red-600"
            }`}
        >
          {type === "success" ? "Thông báo" : "Lỗi"}
        </h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};


const resolveImageUrl = (p) => {
  if (!p) return 'https://via.placeholder.com/400x300.png?text=No+Image';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/uploads')) return `${API_ORIGIN}${p}`;
  return `${API_ORIGIN}/public/images/${p}`;
};

const formatCurrency = (amount) => {
  if (!amount) return '0 VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatStatus = (status) => {
  const statusMap = {
    active: 'Đang hoạt động',
    pending: 'Đang chờ phê duyệt',
    completed: 'Đã hoàn thành',
    paused: 'Tạm dừng',
    cancelled: 'Đã hủy',
  };
  return statusMap[status] || 'Không xác định';
};

const ReportCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [alert, setAlert] = useState({ message: "", type: "" });

  const reasonsList = [
    "Thông tin chưa được xác thực",
    "Không có bằng chứng rõ ràng",
    "Sử dụng hình ảnh/thông tin nhạy cảm không đúng cách",
    "Có dấu hiệu lừa đảo/chiếm đoạt",
    "Tổ chức gây quỹ này không đáng tin cậy",
    "Khác",
  ];

  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [commit, setCommit] = useState(false);

  // ✅ state hiển thị alert
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        console.error('Lỗi lấy chi tiết chiến dịch:', err);
        setErrorMessage("Không thể tải thông tin chiến dịch.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCampaign();
  }, [id]);

  const handleReasonChange = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason]
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = [];
    const errors = [];
    setFileError('');

    for (const f of selectedFiles) {
      const mb = f.size / (1024 * 1024);
      if (!f.type.startsWith('image/')) {
        errors.push(`"${f.name}" không phải ảnh hợp lệ.`);
        continue;
      }
      if (mb > MAX_IMG_MB) {
        errors.push(`"${f.name}" vượt quá ${MAX_IMG_MB}MB.`);
        continue;
      }
      validFiles.push(f);
    }

    let combined = [...files, ...validFiles];
    if (combined.length > MAX_REPORT_FILES) {
      errors.push(`Chỉ chọn tối đa ${MAX_REPORT_FILES} ảnh.`);
      combined = combined.slice(0, MAX_REPORT_FILES);
    }

    setFiles(combined);
    if (errors.length) setFileError(errors.join('\n'));

    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!commit) {
      return setErrorMessage("⚠️ Vui lòng xác nhận cam kết trước khi gửi báo cáo!");
    }
    if (selectedReasons.length === 0) {
      return setErrorMessage("⚠️ Vui lòng chọn ít nhất một lý do báo cáo!");
    }

    setSubmitLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("reasons", JSON.stringify(selectedReasons));

      if (selectedReasons.includes("Khác") && otherReason.trim()) {
        formData.append("otherReason", otherReason.trim());
      }

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      files.forEach((file) => {
        formData.append("evidence_files", file);
      });

      const res = await campaignService.reportCampaign(id, formData);
      const data = res?.data || res;
      console.log("Response từ API báo cáo:", data);
      if (data.status === "fail") {

        setAlert({ message: data.message || "Có lỗi xảy ra khi gửi báo cáo.", type: "error" });
        
      } else {
        setAlert({ message: "✅ Báo cáo đã được gửi thành công!", type: "success" });
        setTimeout(() => navigate(`/campaign/${id}`), 3000);
      }
    } catch (error) {
      console.error(error);
      setAlert({ message: error?.response?.data?.message || "🚨 Có lỗi xảy ra.", type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!campaign) return <div className="text-center py-20 text-red-600">Không tìm thấy chiến dịch.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <section className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">📢 BÁO CÁO CHIẾN DỊCH GÂY QUỸ</h1>
        <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={resolveImageUrl(campaign.image_url)}
              alt={`Chiến dịch ${campaign.title}`}
              className="w-full h-64 object-cover rounded-md border"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300.png?text=Image+Error'; }}
            />
          </div>
          <div className="space-y-2 text-sm">
            <h2 className="text-lg font-semibold text-red-600">{campaign.title}</h2>
            <p><strong>Tổ chức:</strong> {campaign.charity?.name || 'Chưa xác định'}</p>
            <p><strong>🎯 Mục tiêu chiến dịch:</strong> {formatCurrency(campaign.goal_amount)}</p>
            <p><strong>📍 Địa điểm:</strong> {campaign.location}</p>
            <p><strong>⏳ Trạng thái:</strong> {formatStatus(campaign.status)}</p>
            <p><strong>📅 Ngày bắt đầu:</strong> {formatDate(campaign.start_date)}</p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
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

          <div>
            <h3 className="text-sm font-medium mb-1">
              🔎 Bằng chứng (tối đa {MAX_REPORT_FILES} ảnh, ≤ {MAX_IMG_MB}MB/ảnh)
            </h3>
            <input
              type="file"
              multiple
              accept="image/*"
              className="text-sm"
              onChange={handleFileChange}
            />
            {fileError && <p className="text-red-500 text-xs mt-2 whitespace-pre-line">{fileError}</p>}

            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {files.map((f, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={`preview-${idx}`}
                      className="object-cover w-32 h-24 rounded-lg border"
                      onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border shadow text-red-500"
                      title="Xoá ảnh"
                      onClick={() => removeFile(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          {/* ✅ Hiển thị alert message */}
          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={submitLoading}
              className={`text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors ${submitLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {submitLoading ? "Đang gửi..." : "GỬI BÁO CÁO"}
            </button>
          </div>
        </div>
      </section>
      <AlertModal
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />
    </div>
  );
};

export default ReportCampaign;
