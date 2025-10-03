import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import campaignService from '../../services/campaignService';
import ChatButton from '../../components/ui/ChatButton';
import axios from 'axios';

// const { user, getToken } = useAuth?.() || {}; // nếu có AuthContext thì thay bằng project của bạn

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


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

  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

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
    let scrollPosition = 0;

    // Lưu vị trí cuộn trước khi tải dữ liệu
    const saveScrollPosition = () => {
      scrollPosition = window.scrollY || window.pageYOffset;
    };

    // Khôi phục vị trí cuộn
    const restoreScrollPosition = () => {
      window.scrollTo(0, scrollPosition);
    };

    const fetchDonationHistory = async () => {
      setLoading(true);
      saveScrollPosition(); // Lưu vị trí trước khi tải
      try {
        const response = await axios.get(`${API_ORIGIN}/donations/history?page=${page}&limit=5`, {
          params: { campaign_id: id },
        });
        console.log('Dữ liệu API:', response.data.data);
        const formattedData = response.data.data.map(d => ({
          donation_id: d.donation_id,
          campaign_id: d.campaign_id,
          amount: Number(d.amount) || 0,
          message: d.message || '',
          anonymous: d.is_anonymous || false,
          status: d.status || 'unknown',
          created_at: d.created_at || null,
          name: d.is_anonymous ? null : (d.name || null),
          email: d.is_anonymous ? null : (d.email || null),
        }));
        console.log('Dữ liệu đã format:', formattedData);
        setDonationHistory(formattedData);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        setError('Không thể tải lịch sử quyên góp');
      } finally {
        setLoading(false);
        setTimeout(restoreScrollPosition, 0);
      }
    };
    if (activeTab === 'donations') fetchDonationHistory();
  }, [activeTab, id, page]);

  // ===== Fetch activities =====
  const loadActivities = async (pageToLoad = actPage) => {
    setActLoading(true);
    setActError(null);
    try {
      const { data } = await axios.get(`${API_ORIGIN}/campaigns/${id}/updates`, {
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

  const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num) || val == null) {
      return '0 VND';
    }
    return num.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' VND';
  };
  const formatDate = (dateStr) => {
    if (!dateStr || isNaN(new Date(dateStr))) {
      return 'Không xác định';
    }
    return new Date(dateStr).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
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
    } catch { }

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
    } catch { }
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
      } catch { }
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

      await axios.post(`${API_ORIGIN}/campaigns/${id}/updates`, form, {
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
      await axios.delete(`${API_ORIGIN}/campaigns/${id}/updates/${updateId}`, {
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

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        console.error('Lỗi lấy chi tiết chiến dịch:', err);
      }
    };
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchStatementData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [donationsRes, activitiesRes] = await Promise.all([
        axios.get(`${API_ORIGIN}/donations/history`, { params: { campaign_id: id } }),
        axios.get(`${API_ORIGIN}/campaigns/${id}/updates`),
      ]);

      const incomeTransactions = (donationsRes.data.data || []).map(tx => ({
        ...tx,
        type: 'income',
        amount: tx.amount,
        date: tx.date || new Date().toISOString(),
        content: `Ủng hộ ${tx.amount.toLocaleString()} VND từ ${tx.sender || 'Ẩn danh'}`,
      }));

      const expenseTransactions = (activitiesRes.data.updates || []).map(tx => ({
        ...tx,
        type: 'expense',
        amount: -(tx.spent_amount || 0),
        date: tx.date || new Date().toISOString(),
        content: `Chi cho hoạt động: ${tx.content}`,
      }));

      const combinedTransactions = [...incomeTransactions, ...expenseTransactions];

      combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(combinedTransactions);

    } catch (err) {
      console.error("Failed to fetch statement data:", err);
      setError("Không thể tải dữ liệu sao kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStatementData();
    }
  }, [id]);

  const getFilteredTransactions = () => {
    let filteredByTab = transactions;
    switch (filter) {
      case "income":
        filteredByTab = transactions.filter((tx) => tx.type === "income");
        break;
      case "expense":
        filteredByTab = transactions.filter((tx) => tx.type === "expense");
        break;
      default:
        break;
    }

    if (searchTerm.trim() === "") {
      return filteredByTab;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return filteredByTab.filter(tx =>
      (tx.content && tx.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (tx.id && String(tx.id).toLowerCase().includes(lowerCaseSearchTerm))
    );
  };

  const filteredTransactions = getFilteredTransactions();
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirst, indexOfLast);

  const calculateTotals = () => {
    const income = transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { income, expense };
  };

  const { income: filteredIncome, expense: filteredExpense } = calculateTotals();

  if (loading) return <div className="py-10 text-center">Đang tải chiến dịch...</div>;
  if (!campaign) return <div className="py-10 text-center text-red-500">Không tìm thấy chiến dịch.</div>;

  const mainImage = campaign.image_url || (campaign.gallery_images?.[0] ?? '');

  const handleReportClick = () => {
    navigate(`/reportcampaign/${id}`);
  };
  return (
    <div className="container px-4 py-10 mx-auto">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* LEFT */}
        <div className="w-full lg:w-2/3">
          <h1 className="mb-4 text-3xl font-bold">{campaign.title}</h1>

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
              <h2 className="mb-3 text-xl font-semibold">Thư viện ảnh</h2>

              <div className="relative">
                {/* Nút trái */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollByAmount(-1)}
                    className="flex absolute left-0 top-1/2 z-10 justify-center items-center w-10 h-10 rounded-full shadow -translate-y-1/2 bg-purple-200/90 hover:bg-purple-200"
                    aria-label="Cuộn trái"
                    title="Cuộn trái"
                  >
                    ‹
                  </button>
                )}

                {/* Track cuộn */}
                <div
                  ref={stripRef}
                  className="flex overflow-x-auto gap-3 px-12 scrollbar-none snap-x snap-mandatory scroll-px-2"
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
                        className="object-cover w-48 h-32 rounded-2xl border transition-transform duration-200 md:w-56 md:h-36 hover:scale-105"
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
                    className="flex absolute right-0 top-1/2 z-10 justify-center items-center w-10 h-10 rounded-full shadow -translate-y-1/2 bg-purple-200/90 hover:bg-purple-200"
                    aria-label="Cuộn phải"
                    title="Cuộn phải"
                  >
                    ›
                  </button>
                )}

                {/* Fades mép */}
                <div className="absolute top-0 left-0 w-10 h-full bg-gradient-to-r from-white to-transparent rounded-l-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-10 h-full bg-gradient-to-l from-white to-transparent rounded-r-2xl pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="p-6 space-y-5 w-full bg-white rounded-xl shadow-lg lg:w-1/3">
          <div className="text-sm text-gray-500">Tiền ủng hộ được chuyển đến</div>
          <div className="text-xl font-bold text-green-600">
            {campaign.charity?.name || 'Đơn vị tiếp nhận'}
          </div>

          <div className="pt-4 space-y-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mục tiêu</span>
              <span className="font-semibold">{formatCurrency(campaign.goal_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Thời gian còn lại</span>
              <span className="font-semibold text-green-600">{daysLeft()} ngày</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div className="h-3 bg-green-500 rounded-full" style={{ width: `${getProgress()}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>Đã đạt được</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(campaign.current_amount)} ({getProgress()}%)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleDonate}
                className="flex-1 py-2 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                Ủng hộ
              </button>
              <button className="flex-1 py-2 font-semibold text-green-500 rounded-lg border border-green-500 hover:bg-green-100">
                Đồng hành gây quỹ
              </button>
            </div>
            <button
              onClick={handleReportClick}
              className="flex justify-center items-center gap-2 w-full py-2 text-sm font-semibold text-gray-500 rounded-lg border hover:bg-gray-100">
              <span role="img" aria-label="flag">🚩</span>
              Báo cáo chiến dịch gây quỹ
            </button>
          </div>

          {campaign.qr_code_url && (
            <div className="pt-4 text-center">
              <img
                src={resolveImageUrl(campaign.qr_code_url)}
                alt="QR code"
                className="object-contain mx-auto w-full max-w-xs rounded-lg border"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="mt-2 text-sm text-gray-600">Ủng hộ qua mã QR</div>
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
        <button
          onClick={() => setActiveTab('saoke')}
          className={`px-6 py-2 rounded-t-lg ${activeTab === 'saoke' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Danh sách Sao Kê
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-2 rounded-t-lg ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Chat
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-6 border-t border-gray-300">
        {activeTab === 'detailed' && (
          <div className="py-8">
            <p className="mb-6 text-lg text-gray-700">{campaign.description}</p>
            {campaign.detailed_description && (
              <div className="mt-4">
                <h2 className="mb-4 text-2xl font-semibold">Câu chuyện</h2>
                <p className="leading-relaxed text-gray-800 whitespace-pre-line">
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
              <div className="p-5 bg-white rounded-xl border shadow">
                <h3 className="mb-3 text-xl font-semibold">Đăng cập nhật mới</h3>

                {formError && (
                  <div className="p-2 mb-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmitUpdate} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Tiêu đề (tuỳ chọn)</label>
                    <input
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      className="px-3 py-2 w-full rounded-lg border"
                      placeholder="VD: Cập nhật tuần 2 – phát quà tại xã A"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Nội dung</label>
                    <textarea
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
                      placeholder="Mô tả tiến độ, hoạt động, cảm ơn nhà hảo tâm..."
                    />
                  </div>

                  {/* Chi tiêu */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Tổng chi (VND, tuỳ chọn)</label>
                      <input
                        value={spentAmount}
                        onChange={(e) => setSpentAmount(e.target.value)}
                        className="px-3 py-2 w-full rounded-lg border"
                        placeholder="VD: 2500000"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Chi tiết khoản chi (tuỳ chọn)</label>
                      <div className="space-y-2">
                        {spentItems.map((it, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              value={it.label}
                              onChange={(e) => updateSpentItem(i, 'label', e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border"
                              placeholder="Nội dung chi (VD: Mua gạo)"
                            />
                            <input
                              value={it.amount}
                              onChange={(e) => updateSpentItem(i, 'amount', e.target.value)}
                              className="px-3 py-2 w-40 rounded-lg border"
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
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Ảnh minh hoạ (tối đa {MAX_UPDATE_IMAGES} ảnh, ≤ {MAX_IMG_MB}MB/ảnh)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onPickImages(e.target.files)}
                    />
                    {updateImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {updateImages.map((f, idx) => {
                          const url = URL.createObjectURL(f);
                          return (
                            <div key={idx} className="relative">
                              <img
                                src={url}
                                alt={`picked-${idx}`}
                                className="object-cover w-32 h-24 rounded-lg border"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border shadow"
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
                      <div key={uid} className="p-4 bg-white rounded-xl border shadow">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-lg font-semibold">{u.title || 'Cập nhật'}</h3>
                          <div className="flex gap-3 items-center">
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
                          <div className="p-3 mt-3 bg-purple-50 rounded border border-purple-100">
                            {u.spent_amount != null && (
                              <div className="font-medium text-purple-700">
                                Tổng chi: {Number(u.spent_amount).toLocaleString('vi-VN')} VND
                              </div>
                            )}
                            {u.spent_items?.length > 0 && (
                              <ul className="pl-5 mt-1 text-sm list-disc text-purple-900">
                                {u.spent_items.map((it, i) => (
                                  <li key={i}>{it.label}: {Number(it.amount).toLocaleString('vi-VN')} VND</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {Array.isArray(u.images) && u.images.length > 0 && (
                          <div className="flex overflow-x-auto gap-2 mt-3 scrollbar-none">
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
                                  className="object-cover w-40 h-28 rounded-lg border"
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
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={actPage === 1}
                  >
                    Trước
                  </button>
                  <span className="flex items-center text-gray-600">
                    Trang {actPage} / {actTotalPages}
                  </span>
                  <button
                    onClick={() => handleActPageChange(actPage + 1)}
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50"
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
                        <th className="px-4 py-2 text-left">Tên</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Lời chúc</th>
                        <th className="px-4 py-2 text-left">Số tiền</th>
                        <th className="px-4 py-2 text-left">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationHistory.map((donation, index) => (
                        <tr key={index} className="border-t border-gray-300">
                          <td className="px-4 py-2">{donation.anonymous ? 'Ẩn danh' : (donation.name || 'Ẩn danh')}</td>
                          <td className="px-4 py-2">{donation.anonymous ? 'Ẩn danh' : (donation.email || 'Ẩn danh')}</td>
                          <td className="px-4 py-2">{donation.message || ''}</td>
                          <td className="px-4 py-2">{formatCurrency(donation.amount)}</td>
                          <td className="px-4 py-2">{formatDate(donation.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={page === 1}
                  >
                    Trước
                  </button>
                  <span className="flex items-center text-gray-600">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={page === totalPages}
                  >
                    Sau
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {/* ===== Tab Sao Kê ===== */}
        {activeTab === 'saoke' && (
          <div className="flex flex-col min-h-screen bg-white px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-red-600">
                Sao kê chiến dịch: {campaign ? campaign.title : id}
              </h2>
              <p>
                TỔNG THU:{" "}
                <span className="text-green-600 font-bold">
                  +{filteredIncome.toLocaleString()} VND
                </span>{" "}
                / TỔNG CHI:{" "}
                <span className="text-red-600 font-bold">-{filteredExpense.toLocaleString()} VND</span>
              </p>
              <p>
                Số dư:{" "}
                <span className={`font-bold ${filteredIncome - filteredExpense >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {filteredIncome - filteredExpense >= 0 ? "+" : ""}{(filteredIncome - filteredExpense).toLocaleString()} VND
                </span>
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => {
                    setFilter('income');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Tiền thu
                </button>
                <button
                  onClick={() => {
                    setFilter('expense');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Tiền chi
                </button>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm giao dịch..."
                className="px-4 py-2 border rounded-lg w-1/3"
              />
            </div>

            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2">Mã giao dịch</th>
                    <th className="px-4 py-2">Người chuyển/nhận</th>
                    <th className="px-4 py-2">Ngày chuyển</th>
                    <th className="px-4 py-2">Số tiền (VND)</th>
                    <th className="px-4 py-2">Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{tx.id}</td>
                      <td className="px-4 py-2">{tx.created_by || 'Không rõ'}</td>
                      <td className="px-4 py-2">
                        {new Date(tx.date).toLocaleString('vi-VN')}
                      </td>
                      <td
                        className={`px-4 py-2 font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{tx.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => handleActPageChange(actPage - 1)}
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={actPage === 1}
                  >
                    Trước
                  </button>
                  <span className="flex items-center text-gray-600">
                    Trang {actPage} / {actTotalPages}
                  </span>
                  <button
                    onClick={() => handleActPageChange(actPage + 1)}
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={actPage === actTotalPages}
                  >
                    Sau
                  </button>
                </div>
          </div>
        )}
        {/* ===== Tab Chat ===== */}
        {activeTab === 'chat' && (
          <div className="py-8">
            <div className="p-6 bg-white rounded-xl border shadow">
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-semibold text-gray-800">
                  Chat với tổ chức từ thiện
                </h3>
                <p className="text-gray-600">
                  Hãy đặt câu hỏi hoặc trao đổi với tổ chức về chiến dịch này
                </p>
              </div>

              <div className="flex justify-center">
                <ChatButton
                  type="campaign"
                  entityId={id}
                  entityData={campaign}
                  buttonText="Bắt đầu chat"
                  className="px-6 py-3 text-lg"
                />
              </div>

              <div className="mt-6 text-sm text-center text-gray-500">
                <p>• Chat trực tiếp với tổ chức từ thiện</p>
                <p>• Hỏi đáp về chiến dịch và tiến độ</p>
                <p>• Nhận thông báo cập nhật mới nhất</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && lightboxImages.length > 0 && (
        <div
          className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/80"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={resolveImageUrl(lightboxImages[lightboxIndex])}
              alt={`Ảnh ${lightboxIndex + 1}`}
              className="max-h-[80vh] w-full object-contain rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />

            <button
              onClick={closeLightbox}
              className="flex absolute -top-3 -right-3 justify-center items-center w-9 h-9 text-gray-800 rounded-full shadow bg-white/90 hover:bg-white"
              aria-label="Đóng"
              title="Đóng"
            >
              ✕
            </button>

            <button
              onClick={gotoPrev}
              className="flex absolute left-0 top-1/2 justify-center items-center w-10 h-10 text-gray-900 rounded-full shadow -translate-y-1/2 bg-white/90 hover:bg-white"
              aria-label="Ảnh trước"
              title="Ảnh trước"
            >
              ‹
            </button>
            <button
              onClick={gotoNext}
              className="flex absolute right-0 top-1/2 justify-center items-center w-10 h-10 text-gray-900 rounded-full shadow -translate-y-1/2 bg-white/90 hover:bg-white"
              aria-label="Ảnh sau"
              title="Ảnh sau"
            >
              ›
            </button>

            <div className="absolute bottom-2 left-1/2 text-sm -translate-x-1/2 text-white/90">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailPage;
