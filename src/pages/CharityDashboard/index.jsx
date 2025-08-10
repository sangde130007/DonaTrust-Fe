import React, { useEffect, useState } from 'react';
import charityService from '../../services/charityService';
import { useNavigate } from 'react-router-dom';

const API_ORIGIN = 'http://localhost:5000';

const resolveImageUrl = (p) => {
  if (!p) return '';
  let url = String(p).trim().replace(/\\/g, '/');
  if (/^https?:\/\//i.test(url)) return url;
  url = url.replace(/^[A-Za-z]:\/.*?(\/uploads\/)/, '/uploads/');
  if (!url.startsWith('/')) url = '/' + url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};

const CharityDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    charityService
      .getMyCampaigns()
      .then((res) => {
        setCampaigns(res.campaigns || res.data || []); // hỗ trợ nhiều kiểu trả dữ liệu
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải chiến dịch...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chiến dịch của bạn</h1>
        <button
          onClick={() => navigate('/charity-dashboard/create')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Tạo chiến dịch mới
        </button>
      </div>

      {campaigns.length === 0 ? (
        <p>Chưa có chiến dịch nào.</p>
      ) : (
        <ul className="space-y-3">
          {campaigns.map((c) => {
            const cover =
              resolveImageUrl(
                c.image_url || c.cover_image || c.image || c.thumbnail_url
              ) || '/images/img_image_18.png';

            return (
              <li
                key={c.campaign_id}
                className="p-4 border rounded shadow flex gap-4 items-start"
              >
                {/* Ảnh chiến dịch */}
                <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={cover}
                    alt={c.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/images/img_image_18.png'; }}
                    loading="lazy"
                  />
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{c.title}</h2>
                  <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/charity-dashboard/campaigns/${c.campaign_id}/edit`)
                      }
                      className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Xác nhận xoá?')) {
                          charityService
                            .deleteMyCampaign(c.campaign_id)
                            .then(() => {
                              setCampaigns((prev) =>
                                prev.filter((item) => item.campaign_id !== c.campaign_id)
                              );
                            })
                            .catch((err) => alert(err.message));
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CharityDashboard;
