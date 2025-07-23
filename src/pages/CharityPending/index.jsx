import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CharityPendingPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/campaigns/pending')
      .then(res => setCampaigns(res.data))
      .catch(() => setError('Không thể tải danh sách chiến dịch chờ duyệt'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-global-3 min-h-screen">
      {/* Banner */}
      <div
        className="w-full h-[300px] bg-cover bg-center flex flex-col justify-center items-center"
        style={{
          backgroundImage: "url('/images/cham-pending.png')"
        }}
      >
        <h1 className="text-[32px] md:text-[40px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-button-4 to-button-3">
          Danh sách chiến dịch chờ duyệt
        </h1>
        <p className="text-white text-sm mt-2">
          Quản trị viên xác minh và duyệt chiến dịch gây quỹ
        </p>
      </div>

      {/* Nội dung */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-[24px] font-bold mb-8 text-center text-global-1">Danh sách chiến dịch</h2>

        {loading && <div className="text-center text-global-4 py-10">Đang tải dữ liệu...</div>}
        {error && <div className="text-center text-red-500 py-10">{error}</div>}

        <div className="space-y-6">
          {!loading && !error && campaigns.length === 0 && (
            <div className="text-center text-global-4 py-10">Không có chiến dịch nào đang chờ duyệt.</div>
          )}
          {campaigns.map((c) => (
            <div
              key={c.campaign_id}
              className="bg-white rounded-[16px] shadow-md flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={c.image_url || '/images/pending-demo.png'}
                alt="Ảnh chiến dịch"
                className="w-full md:w-1/3 object-cover h-[200px] md:h-auto"
              />
              <div className="p-5 flex flex-col justify-between md:w-2/3">
                <div>
                  <h3
                    className="text-button-4 font-semibold text-lg hover:underline cursor-pointer line-clamp-2"
                    onClick={() => navigate(`/charity-pending/${c.campaign_id}`)}
                  >
                    {c.title}
                  </h3>
                  <div className="text-sm text-global-2 mt-3 space-y-1">
                    <p>Nhà từ thiện: <span className="font-semibold">{c.charity?.name}</span></p>
                    <p>Người đại diện: <span className="font-semibold">{c.charity?.user?.full_name}</span> ({c.charity?.user?.email})</p>
                    <p>Danh mục: <span className="font-semibold">{c.category}</span></p>
                    <p>Mục tiêu: <span className="font-semibold">{Number(c.goal_amount).toLocaleString()} VNĐ</span></p>
                    <p>Trạng thái: <span className="font-semibold capitalize">{c.status}</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-sm text-global-4">
                    <FaMapMarkerAlt className="mr-1 text-global-4" />
                    {c.location || 'Chưa cập nhật'}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-global-4">Ngày bắt đầu</p>
                    <p className="font-bold text-sm">{c.start_date || 'Chưa có'}</p>
                    <button
                      className="mt-3 px-5 py-1 border text-sm border-button-4 text-button-4 rounded-full hover:bg-button-4 hover:text-white transition"
                      onClick={() => navigate(`/charity-pending/${c.campaign_id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { default as CampaignDetail } from './Detail';
export default CharityPendingPage;
