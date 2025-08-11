import React, { useState, useEffect, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { usePayOS } from "payos-checkout";

const donationAmounts = [50000, 100000, 200000, 500000];

const DonationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const [blessing, setBlessing] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { open, exit } = usePayOS({
    RETURN_URL: "http://localhost:5173/payment-success",
    ELEMENT_ID: "payos-iframe",
    CHECKOUT_URL: paymentData?.paymentUrl || "",
    embedded: false,
    onSuccess: (event) => {
      alert("Thanh toán thành công! Quay về trang chính.");
      navigate("/");
      setIsDialogOpen(false);
    },
    onCancel: (event) => {
      alert("Thanh toán đã bị hủy.");
      setIsDialogOpen(false);
    },
    onExit: (event) => {
      setIsDialogOpen(false);
    },
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/campaigns/${id}`);
        const campaignData = response.data;

        const endDate = new Date(campaignData.end_date);
        const today = new Date();
        const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

        setCampaign({
          image: campaignData.image_url || "/images/placeholder.jpg",
          title: campaignData.title,
          org: campaignData.charity.name,
          category: campaignData.category,
          objective: campaignData.goal_amount,
          achieved: campaignData.current_amount,
          daysLeft,
        });
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin chiến dịch");
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "—") return "—";
    return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VND";
  };

  const percent = campaign && campaign.objective
    ? Math.round((campaign.achieved / campaign.objective) * 100)
    : 0;

  const handleAmountInput = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
  };

  const handleAmountButton = (val) => {
    setAmount(val.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const donationData = {
        campaign_id: id,
        amount: parseFloat(amount),
        blessing,
        full_name: anonymous ? null : fullname,
        email,
        anonymous,
      };
      const response = await axios.post("http://localhost:5000/api/donations", donationData);
      console.log("API Response:", response.data); // Kiểm tra phản hồi
      const { paymentUrl, qrCode, bankName, accountNumber, accountName, amount: paymentAmount, description } = response.data;
      if (!qrCode) {
        console.warn("qrCode is missing or null:", response.data);
      }
      setPaymentData({ paymentUrl, qrCode, bankName, accountNumber, accountName, amount: paymentAmount, description });
      setIsDialogOpen(true);
    } catch (err) {
      console.error("API Error:", err);
      alert("Lỗi khi tạo giao dịch: " + err.message);
    }
  };

  const handlePayWithPayOS = () => {
    if (paymentData?.paymentUrl) {
      open();
    } else {
      alert("Không có liên kết thanh toán.");
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setPaymentData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <h2 className="text-3xl font-bold text-pink-500 mb-6">{campaign.org}</h2>
            <div className="relative mb-6">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-90 object-cover rounded-lg"
              />
              <span className="absolute top-4 left-4 bg-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                {campaign.daysLeft} ngày còn lại
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{campaign.title}</h3>
            <div className="bg-gray-50 rounded-lg p-4 flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Mục tiêu</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(campaign.objective)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Đã đạt được</span>
                <span className="text-2xl font-bold text-pink-500">
                  {formatCurrency(campaign.achieved)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiến độ</span>
                <span className="text-sm text-gray-800">{percent}%</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col">
            <form onSubmit={handleSubmit} autoComplete="off" className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Thông tin quyên góp
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền quyên góp <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountInput}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-right font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="0"
                  min="0"
                  required
                />
                <span className="ml-3 text-lg font-semibold text-gray-700">VND</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {donationAmounts.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => handleAmountButton(v)}
                    className={`py-2 rounded-lg font-semibold border transition ${
                      amount === v.toString()
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lời chúc (tùy chọn)
              </label>
              <textarea
                value={blessing}
                onChange={(e) => setBlessing(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Nhập lời chúc yêu thương..."
                rows="4"
              ></textarea>
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">
                Thông tin người quyên góp
              </h4>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Nhập họ tên"
                required={!anonymous}
                disabled={anonymous}
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Nhập email"
                required
              />
              <div className="flex items-center mb-6">
                <input
                  id="anonymous"
                  type="checkbox"
                  checked={anonymous}
                  onChange={() => setAnonymous(!anonymous)}
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Tôi muốn ẩn danh khi quyên góp
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg text-lg transition uppercase"
              >
                Quyên góp ngay
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Dialog for QR Code and PayOS Checkout */}
      {isDialogOpen && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Hoàn tất thanh toán
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột trái - Thông tin thanh toán */}
              <div className="space-y-4 text-gray-800">
                <div>
                  <span className="font-semibold">Ngân hàng:</span>{" "}
                  {paymentData.bankName || "—"}
                </div>
                <div>
                  <span className="font-semibold">Số tài khoản:</span>{" "}
                  {paymentData.accountNumber || "—"}
                </div>
                <div>
                  <span className="font-semibold">Chủ tài khoản:</span>{" "}
                  {paymentData.accountName || "—"}
                </div>
                <div>
                  <span className="font-semibold">Số tiền:</span>{" "}
                  {formatCurrency(paymentData.amount)}
                </div>
                <div>
                  <span className="font-semibold">Nội dung CK:</span>{" "}
                  {paymentData.description || "—"}
                </div>
              </div>

              {/* Cột phải - QR Code */}
              <div className="flex justify-center items-center">
                <Suspense fallback={<div>Đang tải mã QR...</div>}>
                  {(() => {
                    const qr = paymentData.qrCode;
                    if (qr && qr.startsWith("data:image/")) {
                      return (
                        <img
                          src={qr}
                          alt="QR Code"
                          className="w-64 h-64 rounded-lg border p-2"
                        />
                      );
                    }
                    return (
                      <div className="text-sm text-gray-600">
                        Không có mã QR
                      </div>
                    );
                  })()}
                </Suspense>
              </div>
            </div>

            {/* Ghi chú */}
            <p className="text-sm text-gray-500 mt-4 text-center">
              Quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản thủ công theo thông tin bên trái.
            </p>

            {/* Nút đóng */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeDialog}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPage;