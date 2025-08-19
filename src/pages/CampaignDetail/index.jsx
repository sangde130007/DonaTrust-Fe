import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import campaignService from '../../services/campaignService';
import axios from 'axios';

// const { user, getToken } = useAuth?.() || {}; // nếu có AuthContext thì thay bằng project của bạn

const API_ORIGIN = 'http://localhost:5000';

const resolveImageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/uploads')) return `${API_ORIGIN}${p}`;
  return `${API_ORIGIN}/public/images/${p}`;
};

const MAX_UPDATE_IMAGES = 10;
const MAX_IMG_MB = 10;

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('detailed');

  // ===== Donations =====
  const [donationHistory, setDonationHistory] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ===== Activities =====
  const [activities, setActivities] = useState([]);
  const [actLoading, setActLoading] = useState(false);
  const [actError, setActError] = useState(null);
  const [actPage, setActPage] = useState(1);
  const [actTotalPages, setActTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  // ===== Create Update (owner only) =====
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [spentAmount, setSpentAmount] = useState('');
  const [spentItems, setSpentItems] = useState([{ label: '', amount: '' }]);
  const [updateImages, setUpdateImages] = useState([]);
  const [formError, setFormError] = useState('');

  // ===== Scrollable gallery =====
  const stripRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = stripRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scrollByAmount = (dir = 1) => {
    const el = stripRef.current;
    if (!el) return;
    const amount = Math.ceil(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // ===== Lightbox (gallery & activity) =====
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  const openLightbox = (imagesArray, idx) => {
    if (!Array.isArray(imagesArray) || imagesArray.length === 0) return;
    setLightboxImages(imagesArray);
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => setIsLightboxOpen(false);
  const gotoPrev = () => {
    if (!lightboxImages.length) return;
    setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);
  };
  const gotoNext = () => {
    if (!lightboxImages.length) return;
    setLightboxIndex((i) => (i + 1) % lightboxImages.length);
  };

  // ===== Fetch campaign =====
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

  // Recalc gallery scroll btns
  useEffect(() => {
    const el = stripRef.current;
    updateScrollButtons();
    const onScroll = () => updateScrollButtons();
    const onResize = () => updateScrollButtons();
    if (el) el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (el) el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [campaign?.gallery_images?.length]);

  // ===== Fetch donations =====
  useEffect(() => {
    const fetchDonationHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_ORIGIN}/api/donations/history?page=${page}&limit=5`, {
          params: { campaign_id: id },
        });
        setDonationHistory(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError('Không thể tải lịch sử quyên góp');
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'donations') fetchDonationHistory();
  }, [activeTab, id, page]);

  // ===== Fetch activities =====
  const loadActivities = async (pageToLoad = actPage) => {
    setActLoading(true);
    setActError(null);
    try {
      const { data } = await axios.get(`${API_ORIGIN}/api/campaigns/${id}/updates`, {
        params: { page: pageToLoad, limit: 5 },
      });
      setActivities(data.updates || data.data || []);
      setActTotalPages(data.totalPages || 1);
      setActPage(data.page || pageToLoad);
    } catch (e) {
      console.error(e);
      setActError('Không thể tải hoạt động');
    } finally {
      setActLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id, actPage]);

  const handleDonate = () => navigate(`/donation/${id}`);
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };
  const handleActPageChange = (newPage) => {
    if (newPage > 0 && newPage <= actTotalPages) {
      setActPage(newPage);
      loadActivities(newPage);
    }
  };

  const formatCurrency = (val) => Number(val || 0).toLocaleString('vi-VN') + ' VND';
  const getProgress = () => {
    const percent = (Number(campaign?.current_amount) / Number(campaign?.goal_amount || 1)) * 100;
    return Math.min(100, percent).toFixed(1);
  };
  const daysLeft = () => {
    const now = new Date();
    const end = new Date(campaign?.end_date);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // ===== Owner check =====
  const decodeJwt = (raw) => {
    try {
      const token = raw.startsWith('"') ? JSON.parse(raw) : raw;
      const [, payloadB64] = token.split('.');
      if (!payloadB64) return null;
      return JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
  };

  const currentUser = useMemo(() => {
    // Ưu tiên object 'user' trong localStorage
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        return {
          user_id: u.user_id || u.id || u._id || null,
          role: u.role || null,
          charity_id: u.charity_id || u?.charity?.charity_id || null,
        };
      }
    } catch {}

    // Fallback: JWT
    try {
      const tok =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token');
      if (tok) {
        const p = decodeJwt(tok) || {};
        return {
          user_id: p.user_id || p.id || p._id || null,
          role: p.role || null,
          charity_id: p.charity_id || p?.charity?.charity_id || null,
        };
      }
    } catch {}
    return { user_id: null, role: null, charity_id: null };
  }, []);

  const isOwner = useMemo(() => {
    if (!campaign) return false;

    const campaignOwnerCandidates = [
      campaign?.owner_id,
      campaign?.created_by,
      campaign?.creator_id,
      campaign?.owner?.user_id,
      campaign?.charity_owner_id,
    ].filter(Boolean).map(String);

    const campaignCharityId =
      (campaign?.charity_id && String(campaign?.charity_id)) ||
      (campaign?.charity?.charity_id && String(campaign?.charity?.charity_id)) ||
      null;

    const campaignCharityOwnerUserId =
      (campaign?.charity?.user_id && String(campaign?.charity?.user_id)) || null;

    const meUserId = currentUser?.user_id && String(currentUser.user_id);
    const meCharityId = currentUser?.charity_id && String(currentUser.charity_id);
    const meRole = currentUser?.role;

    if (meRole === 'admin') return true;
    if (meUserId && campaignOwnerCandidates.includes(meUserId)) return true;
    if (meUserId && campaignCharityOwnerUserId && meUserId === campaignCharityOwnerUserId) return true;
    if (meCharityId && campaignCharityId && meCharityId === campaignCharityId) return true;

    return false;
  }, [campaign, currentUser]);

  useEffect(() => {
    if (activeTab === 'activity') {
      console.debug('[Activity tab] currentUser=', currentUser);
      console.debug('[Activity tab] campaign.charity_id=', campaign?.charity_id, 'campaign.charity?.charity_id=', campaign?.charity?.charity_id, 'campaign.charity?.user_id=', campaign?.charity?.user_id);
      console.debug('[Activity tab] derived isOwner=', isOwner);
    }
  }, [activeTab, isOwner, campaign, currentUser]);

  // ===== Handlers for Update Form =====
  const onPickImages = (files) => {
    const arr = Array.from(files || []);
    const valid = [];
    const errors = [];

    for (const f of arr) {
      const mb = f.size / (1024 * 1024);
      if (!f.type.startsWith('image/')) {
        errors.push(`"${f.name}" không phải ảnh hợp lệ.`);
        continue;
      }
      if (mb > MAX_IMG_MB) {
        errors.push(`"${f.name}" vượt quá ${MAX_IMG_MB}MB.`);
        continue;
      }
      valid.push(f);
    }

    let combined = [...updateImages, ...valid];
    if (combined.length > MAX_UPDATE_IMAGES) {
      errors.push(`Chỉ chọn tối đa ${MAX_UPDATE_IMAGES} ảnh cho một cập nhật.`);
      combined = combined.slice(0, MAX_UPDATE_IMAGES);
    }

    setUpdateImages(combined);
    if (errors.length) setFormError(errors.join('\n'));
  };

  const removePicked = (idx) => {
    setUpdateImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSpentItem = (index, key, value) => {
    setSpentItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  };

  const addSpentItem = () => {
    setSpentItems((prev) => [...prev, { label: '', amount: '' }]);
  };

  const removeSpentItem = (index) => {
    setSpentItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setUpdateTitle('');
    setUpdateContent('');
    setSpentAmount('');
    setSpentItems([{ label: '', amount: '' }]);
    setUpdateImages([]);
    setFormError('');
  };

  const getAuthHeaders = () => {
    // Ưu tiên token ở localStorage.accessToken
    let token = localStorage.getItem('accessToken');

    if (!token) {
      try {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const u = JSON.parse(userRaw);
          token = u?.token || u?.accessToken || null;
        }
      } catch {}
    }

    if (!token) {
      console.warn('Không tìm thấy token trong localStorage');
      return {};
    }

    return { Authorization: `Bearer ${token}` };
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!updateContent.trim() && !updateTitle.trim()) {
      setFormError('Vui lòng nhập ít nhất tiêu đề hoặc nội dung.');
      return;
    }

    let spentItemsClean = spentItems
      .filter((it) => (it.label?.trim() || '') !== '' || (it.amount?.toString().trim() || '') !== '')
      .map((it) => ({
        label: (it.label || '').trim(),
        amount: Number(it.amount || 0),
      }));

    if (spentAmount && isNaN(Number(spentAmount))) {
      setFormError('Tổng chi phải là số.');
      return;
    }

    try {
      setIsSubmitting(true);
      const form = new FormData();
      if (updateTitle.trim()) form.append('title', updateTitle.trim());
      if (updateContent.trim()) form.append('content', updateContent.trim());
      if (spentAmount !== '') form.append('spent_amount', String(Number(spentAmount)));
      if (spentItemsClean.length > 0) form.append('spent_items', JSON.stringify(spentItemsClean));
      updateImages.forEach((file) => form.append('images', file));

      await axios.post(`${API_ORIGIN}/api/campaigns/${id}/updates`, form, {
        withCredentials: false,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      await loadActivities(1);
      setActPage(1);
      resetForm();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Đăng cập nhật thất bại. Vui lòng thử lại.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== Delete update (admin/owner/author) =====
  const canDeleteUpdate = (u) => {
    const meId = currentUser?.user_id && String(currentUser.user_id);
    const myRole = currentUser?.role;
    if (myRole === 'admin') return true;
    if (isOwner) return true;
    return meId && String(u.created_by || u.author_id || '') === meId;
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!updateId) return;
    const ok = window.confirm('Bạn chắc chắn muốn xoá cập nhật này?');
    if (!ok) return;

    try {
      setDeletingId(updateId);
      await axios.delete(`${API_ORIGIN}/api/campaigns/${id}/updates/${updateId}`, {
        headers: { ...getAuthHeaders() },
        withCredentials: false,
      });

      // Xoá tại chỗ khỏi state (không cần reload)
      setActivities((prev) =>
        prev.filter((u) => String(u.id || u.update_id) !== String(updateId))
      );
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Xoá cập nhật thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải chiến dịch...</div>;
  if (!campaign) return <div className="text-center py-10 text-red-500">Không tìm thấy chiến dịch.</div>;

  const mainImage = campaign.image_url || (campaign.gallery_images?.[0] ?? '');

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>

          {mainImage && (
            <img
              src={resolveImageUrl(mainImage)}
              alt="Ảnh chiến dịch"
              className="mb-6 w-full max-w-xl rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}

          {/* GALLERY (cuộn ngang + lightbox) */}
          {Array.isArray(campaign.gallery_images) && campaign.gallery_images.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-3">Thư viện ảnh</h2>

              <div className="relative">
                {/* Nút trái */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollByAmount(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                               w-10 h-10 rounded-full bg-purple-200/90 hover:bg-purple-200
                               shadow flex items-center justify-center"
                    aria-label="Cuộn trái"
                    title="Cuộn trái"
                  >
                    ‹
                  </button>
                )}

                {/* Track cuộn */}
                <div
                  ref={stripRef}
                  className="overflow-x-auto scrollbar-none flex gap-3 snap-x snap-mandatory scroll-px-2 px-12"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {campaign.gallery_images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => openLightbox(campaign.gallery_images, idx)}
                      className="shrink-0 snap-start"
                      title={`Ảnh ${idx + 1}`}
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Gallery ${idx + 1}`}
                        loading="lazy"
                        className="w-48 h-32 md:w-56 md:h-36 object-cover rounded-2xl border
                                   transition-transform duration-200 hover:scale-105"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>

                {/* Nút phải */}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollByAmount(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                               w-10 h-10 rounded-full bg-purple-200/90 hover:bg-purple-200
                               shadow flex items-center justify-center"
                    aria-label="Cuộn phải"
                    title="Cuộn phải"
                  >
                    ›
                  </button>
                )}

                {/* Fades mép */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent rounded-l-2xl" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent rounded-r-2xl" />
              </div>
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
            <button
              onClick={handleDonate}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
            >
              Ủng hộ
            </button>
            <button className="flex-1 border border-green-500 text-green-500 hover:bg-green-100 py-2 rounded-lg font-semibold">
              Đồng hành gây quỹ
            </button>
          </div>

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

      {/* Tab Navigation */}
      <div className="flex mt-8 mb-6">
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-6 py-2 rounded-t-lg ${activeTab === 'detailed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Chi tiết
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-6 py-2 rounded-t-lg ${activeTab === 'activity' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Hoạt động
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-6 py-2 rounded-t-lg ${activeTab === 'donations' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Danh sách ủng hộ
        </button>
      </div>

      {/* Tab Content */}
      <div className="border-t border-gray-300 pt-6">
        {activeTab === 'detailed' && (
          <div className="py-8">
            <p className="text-lg text-gray-700 mb-6">{campaign.description}</p>
            {campaign.detailed_description && (
              <div className="mt-4">
                <h2 className="text-2xl font-semibold mb-4">Câu chuyện</h2>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {campaign.detailed_description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== Tab Hoạt động ===== */}
        {activeTab === 'activity' && (
          <div className="py-8 space-y-6">
            {/* Form tạo cập nhật (chỉ chủ chiến dịch) */}
            {isOwner && (
              <div className="bg-white border rounded-xl shadow p-5">
                <h3 className="text-xl font-semibold mb-3">Đăng cập nhật mới</h3>

                {formError && (
                  <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmitUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (tuỳ chọn)</label>
                    <input
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="VD: Cập nhật tuần 2 – phát quà tại xã A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                    <textarea
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
                      placeholder="Mô tả tiến độ, hoạt động, cảm ơn nhà hảo tâm..."
                    />
                  </div>

                  {/* Chi tiêu */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổng chi (VND, tuỳ chọn)</label>
                      <input
                        value={spentAmount}
                        onChange={(e) => setSpentAmount(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="VD: 2500000"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chi tiết khoản chi (tuỳ chọn)</label>
                      <div className="space-y-2">
                        {spentItems.map((it, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              value={it.label}
                              onChange={(e) => updateSpentItem(i, 'label', e.target.value)}
                              className="flex-1 border rounded-lg px-3 py-2"
                              placeholder="Nội dung chi (VD: Mua gạo)"
                            />
                            <input
                              value={it.amount}
                              onChange={(e) => updateSpentItem(i, 'amount', e.target.value)}
                              className="w-40 border rounded-lg px-3 py-2"
                              placeholder="Số tiền"
                              inputMode="numeric"
                            />
                            <button
                              type="button"
                              className="px-3 rounded-lg border hover:bg-gray-50"
                              onClick={() => removeSpentItem(i)}
                              title="Xoá"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSpentItem}
                          className="text-sm text-purple-700 hover:underline"
                        >
                          + Thêm khoản chi
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ảnh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ảnh minh hoạ (tối đa {MAX_UPDATE_IMAGES} ảnh, ≤ {MAX_IMG_MB}MB/ảnh)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onPickImages(e.target.files)}
                    />
                    {updateImages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {updateImages.map((f, idx) => {
                          const url = URL.createObjectURL(f);
                          return (
                            <div key={idx} className="relative">
                              <img
                                src={url}
                                alt={`picked-${idx}`}
                                className="h-24 w-32 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-white border rounded-full w-7 h-7 shadow"
                                title="Xoá ảnh"
                                onClick={() => removePicked(idx)}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-5 py-2 rounded-lg text-white font-semibold ${isSubmitting ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                      {isSubmitting ? 'Đang đăng...' : 'Đăng cập nhật'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Danh sách hoạt động */}
            {actLoading && <p className="text-center text-gray-600">Đang tải...</p>}
            {actError && <p className="text-center text-red-500">{actError}</p>}
            {!actLoading && !actError && activities.length === 0 && (
              <p className="text-center text-gray-600">Chiến dịch chưa có hoạt động</p>
            )}

            {!actLoading && !actError && activities.length > 0 && (
              <>
                <div className="space-y-4">
                  {activities.map((u) => {
                    const uid = u.id || u.update_id;
                    return (
                      <div key={uid} className="bg-white rounded-xl shadow p-4 border">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold">{u.title || 'Cập nhật'}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {new Date(u.created_at || u.date || u.createdAt).toLocaleString('vi-VN')}
                            </span>
                            {canDeleteUpdate(u) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUpdate(uid)}
                                disabled={deletingId === uid}
                                className={`text-sm px-3 py-1 rounded-md border ${deletingId === uid ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50 text-red-600 border-red-300'}`}
                                title="Xoá cập nhật này"
                              >
                                {deletingId === uid ? 'Đang xoá...' : 'Xoá'}
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-800 whitespace-pre-line">{u.content}</p>

                        {(u.spent_amount || (u.spent_items && u.spent_items.length)) && (
                          <div className="mt-3 bg-purple-50 border border-purple-100 rounded p-3">
                            {u.spent_amount != null && (
                              <div className="font-medium text-purple-700">
                                Tổng chi: {Number(u.spent_amount).toLocaleString('vi-VN')} VND
                              </div>
                            )}
                            {u.spent_items?.length > 0 && (
                              <ul className="mt-1 list-disc pl-5 text-sm text-purple-900">
                                {u.spent_items.map((it, i) => (
                                  <li key={i}>{it.label}: {Number(it.amount).toLocaleString('vi-VN')} VND</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {Array.isArray(u.images) && u.images.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
                            {u.images.map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="shrink-0"
                                onClick={() => openLightbox(u.images, idx)}
                                title="Xem ảnh"
                              >
                                <img
                                  src={resolveImageUrl(img)}
                                  alt=""
                                  loading="lazy"
                                  className="h-28 w-40 object-cover rounded-lg border"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => handleActPageChange(actPage - 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                    disabled={actPage === 1}
                  >
                    Trước
                  </button>
                  <span className="flex items-center text-gray-600">
                    Trang {actPage} / {actTotalPages}
                  </span>
                  <button
                    onClick={() => handleActPageChange(actPage + 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                    disabled={actPage === actTotalPages}
                  >
                    Sau
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="py-8">
            {loading && <p className="text-center text-gray-600">Đang tải...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!loading && !error && donationHistory.length === 0 && (
              <p className="text-center text-gray-600">Chưa có quyên góp nào.</p>
            )}
            {!loading && !error && donationHistory.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left">Tên</th>
                        <th className="py-2 px-4 text-left">Email</th>
                        <th className="py-2 px-4 text-left">Lời chúc</th>
                        <th className="py-2 px-4 text-left">Số tiền</th>
                        <th className="py-2 px-4 text-left">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationHistory.map((donation, index) => (
                        <tr key={index} className="border-t border-gray-300">
                          <td className="py-2 px-4">{donation.name || 'Ẩn danh'}</td>
                          <td className="py-2 px-4">{donation.email || 'Ẩn danh'}</td>
                          <td className="py-2 px-4">{donation.message}</td>
                          <td className="py-2 px-4">{formatCurrency(donation.amount)}</td>
                          <td className="py-2 px-4">{new Date(donation.created_at).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                    disabled={page === 1}
                  >
                    Trước
                  </button>
                  <span className="flex items-center text-gray-600">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                    disabled={page === totalPages}
                  >
                    Sau
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={resolveImageUrl(lightboxImages[lightboxIndex])}
              alt={`Ảnh ${lightboxIndex + 1}`}
              className="max-h-[80vh] w-full object-contain rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />

            <button
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 bg-white/90 hover:bg-white text-gray-800 rounded-full w-9 h-9 shadow flex items-center justify-center"
              aria-label="Đóng"
              title="Đóng"
            >
              ✕
            </button>

            <button
              onClick={gotoPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full w-10 h-10 shadow flex items-center justify-center"
              aria-label="Ảnh trước"
              title="Ảnh trước"
            >
              ‹
            </button>
            <button
              onClick={gotoNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full w-10 h-10 shadow flex items-center justify-center"
              aria-label="Ảnh sau"
              title="Ảnh sau"
            >
              ›
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/90 text-sm">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailPage;
