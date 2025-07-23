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
    api
      .get('/admin/campaigns/pending')
      .then((res) => setCampaigns(res.data))
      .catch(() => setError('Không thể tải các chiến dịch chờ duyệt'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero */}
      <div
        className="w-full h-[250px] bg-cover bg-center flex flex-col justify-center items-center"
        style={{
          backgroundImage: "url('images/cham-pending.png')",
        }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500 md:text-4xl">
          Chiến dịch gây quỹ từ thiện
        </h1>
        <p className="mt-2 text-sm text-white">Danh sách các chiến dịch gây quỹ chờ phê duyệt</p>
      </div>

      {/* Content */}
      <div className="px-4 py-8 mx-auto max-w-5xl">
        <h2 className="mb-6 text-2xl font-bold text-center">Chiến dịch chờ duyệt</h2>

        {loading && <div className="py-10 text-center text-gray-500">Đang tải...</div>}
        {error && <div className="py-10 text-center text-red-500">{error}</div>}

        <div className="space-y-6">
          {!loading && !error && campaigns.length === 0 && (
            <div className="py-10 text-center text-gray-400">Không có chiến dịch chờ duyệt.</div>
          )}
          {campaigns.map((c) => (
            <div
              key={c.campaign_id}
              className="flex overflow-hidden flex-col bg-white rounded-md shadow-md md:flex-row"
            >
              <img
                src={c.image_url || '/images/pending-demo.png'}
                alt="Campaign"
                className="object-cover w-full md:w-1/3"
              />
              <div className="p-4 md:w-2/3">
                <h3
                  className="font-semibold text-blue-600 cursor-pointer text-md hover:underline"
                  onClick={() => navigate(`/charity-pending/${c.campaign_id}`)}
                >
                  {c.title}
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p className="mb-1">
                    Tổ chức từ thiện: <span className="font-semibold">{c.charity?.name}</span>
                  </p>
                  <p className="mb-1">
                    Người tạo: <span className="font-semibold">{c.charity?.user?.full_name}</span> (
                    {c.charity?.user?.email})
                  </p>
                  <p className="mb-1">
                    Danh mục: <span className="font-semibold">{c.category}</span>
                  </p>
                  <p className="mb-1">
                    Mục tiêu:{' '}
                    <span className="font-semibold">
                      {Number(c.goal_amount).toLocaleString()} VND
                    </span>
                  </p>
                  <p className="mb-1">
                    Trạng thái: <span className="font-semibold capitalize">{c.status}</span>
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-1 text-gray-500" />
                    {c.location || 'Không có'}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Bắt đầu</p>
                    <p className="font-bold text-md">{c.start_date}</p>
                    <button
                      className="px-4 py-1 mt-2 text-sm rounded border border-gray-400 hover:bg-gray-100"
                      onClick={() => navigate(`/charity-pending/${c.campaign_id}`)}
                    >
                      XEM CHI TIẾT
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
