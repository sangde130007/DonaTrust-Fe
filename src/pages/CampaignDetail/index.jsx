import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import campaignService from '../../services/campaignService';

const API_ORIGIN = 'http://localhost:5000';

const resolveImageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/uploads')) return `${API_ORIGIN}${p}`;
  return `${API_ORIGIN}/public/images/${p}`;
};

const CampaignDetailPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        console.error('Lỗi lấy chi tiết chiến dịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) return <div className="text-center py-10">Đang tải chiến dịch...</div>;
  if (!campaign) return <div className="text-center py-10 text-red-500">Không tìm thấy chiến dịch.</div>;

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + ' VND';
  const getProgress = () => {
    const percent = (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100;
    return Math.min(100, percent).toFixed(1);
  };

  const daysLeft = () => {
    const now = new Date();
    const end = new Date(campaign.end_date);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>

          {campaign.image_url && (
            <img
              src={resolveImageUrl(campaign.image_url)}
              alt="Ảnh chiến dịch"
              className="mb-6 w-full max-w-xl rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}

          <p className="text-lg text-gray-700 mb-6">{campaign.description}</p>

          {campaign.detailed_description && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Câu chuyện</h2>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {campaign.detailed_description}
              </p>
            </div>
          )}

          {campaign.gallery_images?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {campaign.gallery_images.map((img, idx) => (
                <img
                  key={idx}
                  src={resolveImageUrl(img)}
                  alt={`Gallery ${idx}`}
                  className="rounded-lg border object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 space-y-5">
          <div className="text-sm text-gray-500">Tiền ủng hộ được chuyển đến</div>
          <div className="font-bold text-xl text-green-600">
            {campaign.charity?.name || 'Đơn vị tiếp nhận'}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mục tiêu</span>
              <span className="font-semibold">{formatCurrency(campaign.goal_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Thời gian còn lại</span>
              <span className="text-green-600 font-semibold">{daysLeft()} ngày</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Địa điểm</span>
              <span>{campaign.location}</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${getProgress()}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>Đã đạt được</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(campaign.current_amount)} ({getProgress()}%)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold">
              Ủng hộ
            </button>
            <button className="flex-1 border border-green-500 text-green-500 hover:bg-green-100 py-2 rounded-lg font-semibold">
              Đồng hành gây quỹ
            </button>
          </div>

          {/* QR */}
          {campaign.qr_code_url && (
            <div className="text-center pt-4">
              <img
                src={resolveImageUrl(campaign.qr_code_url)}
                alt="QR code"
                className="mx-auto w-full max-w-xs rounded-lg border object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="text-sm mt-2 text-gray-600">Ủng hộ qua mã QR</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
