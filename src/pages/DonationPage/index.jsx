import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { usePayOS } from "payos-checkout";
import { io } from "socket.io-client";

const donationAmounts = [50000, 100000, 200000, 500000];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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

  const [toast, setToast] = useState(null); // {type, message}

  const pollingRef = useRef(null);
  const pollingAttempts = useRef(0);
  const socketRef = useRef(null);

  // ---------- Helpers ----------
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0 VND";
    const n = Number(value);
    if (!Number.isFinite(n)) return "0 VND";
    return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VND";
  };

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/campaigns/${id}`);
      const c = res.data;
      const endDate = c.end_date ? new Date(c.end_date) : null;
      const today = new Date();
      const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))) : 0;

      setCampaign({
        image: c.image_url || "/images/placeholder.jpg",
        title: c.title,
        org: c.charity?.name || "Đơn vị tiếp nhận",
        category: c.category,
        objective: Number(c.goal_amount) || 0,
        achieved: Number(c.current_amount) || 0,
        daysLeft,
        raw: c,
      });
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin chiến dịch");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  // ---------- Socket.IO ----------
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    // join room theo đúng BE: campaign_<id>
    const room = `campaign_${id}`;
    socket.emit("join_campaign", room);

    // BE của bạn emit: 'donation:completed'
    socket.on("donation:completed", (payload) => {
      // payload: { campaign_id, donation_id, tx_code, amount, new_amount, status, timestamp }
      if (!payload) return;
      // Cập nhật số tiền achieved
      setCampaign((c) => {
        if (!c) return c;
        const next = Number(payload.new_amount);
        if (Number.isFinite(next)) {
          return { ...c, achieved: next };
        }
        // fallback nếu BE không gửi new_amount
        const added = Number(payload.amount) || 0;
        return { ...c, achieved: (Number(c.achieved) || 0) + added };
      });

      // Toast
      const added = Number(payload.amount) || 0;
      setToast({
        type: "info",
        message: `🎉 Có người vừa quyên góp ${formatCurrency(added)}!`,
      });
    });

    // cleanup
    return () => {
      socket.emit("leave_campaign", room);
      socket.disconnect();
    };
  }, [id]);

  // ---------- Polling fallback ----------
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollingAttempts.current = 0;
  };

  const startPollingForUpdate = (prevAchieved = 0, expectedIncrease = 0) => {
    stopPolling();
    pollingAttempts.current = 0;

    pollingRef.current = setInterval(async () => {
      pollingAttempts.current += 1;
      try {
        const res = await axios.get(`${API_BASE_URL}/campaigns/${id}`);
        const latest = Number(res.data.current_amount) || 0;
        setCampaign((c) => (c ? { ...c, achieved: latest } : c));

        if (latest >= prevAchieved + (expectedIncrease || 1)) {
          setToast({ type: "success", message: "Thanh toán đã hoàn tất, cảm ơn bạn!" });
          setIsDialogOpen(false);
          stopPolling();
          await fetchCampaign();
        } else if (pollingAttempts.current >= 12) {
          stopPolling();
          setToast({
            type: "info",
            message: "Đang chờ xác nhận thanh toán. Số tiền sẽ cập nhật sau khi hệ thống xử lý.",
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (pollingAttempts.current >= 12) {
          stopPolling();
          setToast({
            type: "error",
            message: "Không thể kiểm tra cập nhật thanh toán. Vui lòng thử lại sau.",
          });
        }
      }
    }, 5000); // 5s
  };

  // ---------- PayOS ----------
  const { open /*, exit*/ } = usePayOS({
    RETURN_URL: window.location.origin + "/payment-success",
    ELEMENT_ID: "payos-iframe",
    CHECKOUT_URL: paymentData?.paymentUrl || "",
    embedded: false,
    onSuccess: async () => {
      setToast({ type: "success", message: "Thanh toán thành công! Cảm ơn bạn." });
      setIsDialogOpen(false);
      stopPolling();
      await fetchCampaign();
      // navigate("/"); // Nếu muốn điều hướng sau khi thanh toán
    },
    onCancel: () => {
      setToast({ type: "info", message: "Thanh toán đã bị hủy." });
      setIsDialogOpen(false);
      stopPolling();
    },
    onExit: () => {
      setIsDialogOpen(false);
      stopPolling();
    },
  });

  // ---------- Handlers ----------
  const percent =
    campaign && campaign.objective
      ? Math.min(100, Math.round((campaign.achieved / campaign.objective) * 100))
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

      const prevAchieved = campaign?.achieved || 0;

      const response = await axios.post(`${API_BASE_URL}/donations`, donationData);
      const {
        paymentUrl,
        qrCode,
        bankName,
        accountNumber,
        accountName,
        amount: paymentAmount,
        description,
      } = response.data;

      const paymentAmt = Number(paymentAmount) || Number(donationData.amount) || 0;

      setPaymentData({
        paymentUrl,
        qrCode,
        bankName,
        accountNumber,
        accountName,
        amount: paymentAmt,
        description,
      });

      setIsDialogOpen(true);

      // fallback polling (khi QR/chuyển khoản)
      startPollingForUpdate(prevAchieved, paymentAmt);
    } catch (err) {
      console.error("API Error:", err);
      alert("Lỗi khi tạo giao dịch: " + (err?.response?.data?.message || err.message));
    }
  };

  const handlePayWithPayOS = () => {
    if (paymentData?.paymentUrl) {
      open();
    } else {
      alert("Không có liên kết thanh toán.");
    }
  };

  const closeDialog = async () => {
    setIsDialogOpen(false);
    setPaymentData(null);
    stopPolling();
    await fetchCampaign();
  };

  // Auto hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------- Render ----------
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
      {/* placeholder cho PayOS nếu SDK cần */}
      <div id="payos-iframe" className="hidden" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign info */}
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
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tiến độ</span>
                <span className="text-sm text-gray-800">{percent}%</span>
              </div>
            </div>
          </div>

          {/* Donation form */}
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
              />
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

      {/* Dialog for QR/PayOS */}
      {isDialogOpen && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hoàn tất thanh toán</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: info */}
              <div className="space-y-4 text-gray-800">
                <div>
                  <span className="font-semibold">Ngân hàng:</span> {paymentData.bankName || "—"}
                </div>
                <div>
                  <span className="font-semibold">Số tài khoản:</span> {paymentData.accountNumber || "—"}
                </div>
                <div>
                  <span className="font-semibold">Chủ tài khoản:</span> {paymentData.accountName || "—"}
                </div>
                <div>
                  <span className="font-semibold">Số tiền:</span> {formatCurrency(paymentData.amount)}
                </div>
                <div>
                  <span className="font-semibold">Nội dung CK:</span> {paymentData.description || "—"}
                </div>

                
              </div>

              {/* Right: QR */}
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
                    return <div className="text-sm text-gray-600">Không có mã QR</div>;
                  })()}
                </Suspense>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản thủ công theo thông tin bên trái.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={closeDialog}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 bottom-6 z-60 p-4 rounded shadow-lg ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DonationPage;
