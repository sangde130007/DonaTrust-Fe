import React, { useEffect, useState } from "react";
import charityService from "../../services/charityService";
import { useNavigate } from "react-router-dom";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


const resolveImageUrl = (p) => {
  if (!p) return "";
  let url = String(p).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(url)) return url;
  url = url.replace(/^[A-Za-z]:\/.*?(\/uploads\/)/, "/uploads/");
  if (!url.startsWith("/")) url = "/" + url;
  if (url.startsWith("/uploads/")) return `${API_ORIGIN}${url}`;
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
        setCampaigns(res.campaigns || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  // ========== Thống kê ==========
  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const ended = campaigns.filter((c) => c.status === "ended").length;
  const totalRaised = campaigns.reduce(
    (sum, c) => sum + (Number(c.current_amount) || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-violet-700">
          Charity Dashboard
        </h1>
        <button
          onClick={() => navigate("/charity-dashboard/create")}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold shadow"
        >
          + Tạo chiến dịch mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-xl p-4 border-l-4 border-violet-500">
          <p className="text-sm text-gray-500">Tổng chiến dịch</p>
          <p className="text-2xl font-bold text-violet-700">{total}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">{active}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 border-l-4 border-gray-400">
          <p className="text-sm text-gray-500">Đã kết thúc</p>
          <p className="text-2xl font-bold text-gray-600">{ended}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Tổng quyên góp</p>
          <p className="text-2xl font-bold text-yellow-600">
            {totalRaised.toLocaleString("vi-VN")} VND
          </p>
        </div>
      </div>

      {/* Campaign list */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-violet-700">
          Danh sách chiến dịch
        </h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-500">Chưa có chiến dịch nào.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => {
              const cover =
                resolveImageUrl(
                  c.image_url || c.cover_image || c.image || c.thumbnail_url
                ) || "/images/img_image_18.png";
                
              const handleViewDetails = () => {
                navigate(`/charity-dashboard/campaigns/${c.campaign_id}`);
              };

              return (
                <div
                  key={c.campaign_id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col cursor-pointer"
                  onClick={handleViewDetails}
                >
                  {/* Ảnh */}
                  <div className="h-40 w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={cover}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "/images/img_image_18.png")
                      }
                      loading="lazy"
                    />
                  </div>

                  {/* Nội dung */}
                  <h3 className="text-lg font-semibold text-violet-700 truncate">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {c.description}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/charity-dashboard/campaigns/${c.campaign_id}/edit`
                        );
                      }}
                      className="flex-1 px-3 py-1 bg-violet-500 text-white rounded-lg hover:bg-violet-600 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Xác nhận xoá?")) {
                          charityService
                            .deleteMyCampaign(c.campaign_id)
                            .then(() => {
                              setCampaigns((prev) =>
                                prev.filter(
                                  (item) => item.campaign_id !== c.campaign_id
                                )
                              );
                            })
                            .catch((err) => alert(err.message));
                        }
                      }}
                      className="flex-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityDashboard;