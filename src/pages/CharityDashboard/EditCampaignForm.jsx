import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import charityService from '../../services/charityService';

const MAX_IMG_MB = 10;
const MAX_GALLERY_COUNT = 10;

/** ORIGIN để load ảnh tĩnh /uploads (KHÔNG có /api ở cuối).
 *  Vite: VITE_API_ORIGIN (vd: http://localhost:5000)
 */
const API_ORIGIN =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000';

/* ============== Helpers ============== */

// /uploads/... -> absolute + fix backslash
const normalizeUrl = (u) => {
  if (!u) return '';
  const fixed = String(u).replace(/\\/g, '/');
  if (/^https?:\/\//i.test(fixed)) return fixed;
  const origin = API_ORIGIN.replace(/\/+$/, '');
  const path = fixed.startsWith('/') ? fixed : `/${fixed}`;
  return `${origin}${path}`;
};

// string -> array (smart)
const smartSplit = (s) =>
  String(s)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

// Chuẩn hoá gallery từ mọi kiểu: array, JSON string, object list, CSV string
const normalizeGallery = (v) => {
  if (!v) return [];
  let arr = v;

  if (typeof v === 'string') {
    const s = v.trim();
    if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
      try {
        arr = JSON.parse(s);
      } catch {
        arr = smartSplit(s);
      }
    } else {
      arr = smartSplit(s);
    }
  }

  if (!Array.isArray(arr)) arr = [arr];

  return arr
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'object') return item.url || item.src || item.path || '';
      return String(item);
    })
    .filter(Boolean)
    .map(normalizeUrl);
};

// Lấy gallery từ nhiều key khác nhau của campaign
const pickGallery = (campaign) => {
  const candidates = [
    campaign.images,
    campaign.gallery,
    campaign.gallery_images,
    campaign.media,
    campaign.photos,
    campaign.image_list,
    campaign.media_urls,
  ].filter((x) => x != null);

  for (const cand of candidates) {
    const norm = normalizeGallery(cand);
    if (norm.length) return norm;
  }
  return [];
};

const EditCampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailed_description: '',
    goal_amount: '',
    start_date: '',
    end_date: '',
    category: '',
    location: '',
    qr_code_url: '',
  });

  // files & previews
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [keptExistingGalleryUrls, setKeptExistingGalleryUrls] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    // cleanup only blob: URLs
    return () => {
      if (qrPreview?.startsWith?.('blob:')) URL.revokeObjectURL(qrPreview);
      if (coverPreview?.startsWith?.('blob:')) URL.revokeObjectURL(coverPreview);
      galleryPreviews.forEach((u) => {
        if (u?.startsWith?.('blob:')) URL.revokeObjectURL(u);
      });
    };
  }, [qrPreview, coverPreview, galleryPreviews]);

  // Fetch campaign data by ID
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const campaign = await charityService.getMyCampaignById(id);

        // Cover: thử nhiều field; nếu không có lấy ảnh đầu của gallery
        let coverGuess =
          campaign.image ||
          campaign.cover_image_url ||
          campaign.image_url ||
          campaign.cover ||
          '';

        const galleryAbs = pickGallery(campaign);
        if (!coverGuess && galleryAbs.length) coverGuess = galleryAbs[0];

        const absCover = coverGuess ? normalizeUrl(coverGuess) : '';
        const absQr = campaign.qr_code_url ? normalizeUrl(campaign.qr_code_url) : '';

        setFormData({
          title: campaign.title || '',
          description: campaign.description || '',
          detailed_description: campaign.detailed_description || '',
          goal_amount: campaign.goal_amount || '',
          start_date: campaign.start_date?.substring(0, 10) || '',
          end_date: campaign.end_date?.substring(0, 10) || '',
          category: campaign.category || '',
          location: campaign.location || '',
          qr_code_url: absQr,
        });

        setCoverPreview(absCover);
        setKeptExistingGalleryUrls(galleryAbs);
        setQrPreview(absQr);
      } catch (err) {
        setError('Không thể tải chiến dịch');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const setField = (name, value) => setFormData((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  const validateImage = (f) => {
    if (!f.type.startsWith('image/')) return 'File không phải ảnh';
    if (f.size > MAX_IMG_MB * 1024 * 1024) return `Ảnh vượt quá ${MAX_IMG_MB}MB`;
    return '';
  };

  const handleQrChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const msg = validateImage(f);
    if (msg) { alert(msg); e.target.value = ''; return; }
    setQrFile(f);
    const url = URL.createObjectURL(f);
    if (qrPreview?.startsWith?.('blob:')) URL.revokeObjectURL(qrPreview);
    setQrPreview(url);
  };

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const msg = validateImage(f);
    if (msg) { alert(msg); e.target.value = ''; return; }
    setCoverFile(f);
    const url = URL.createObjectURL(f);
    if (coverPreview?.startsWith?.('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverPreview(url);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalCurrent = keptExistingGalleryUrls.length + galleryFiles.length;
    const remain = Math.max(0, MAX_GALLERY_COUNT - totalCurrent);
    const picked = files.slice(0, remain);

    const invalid = picked.find((f) => validateImage(f));
    if (invalid) { alert(validateImage(invalid)); e.target.value = ''; return; }

    const newPreviews = picked.map((f) => URL.createObjectURL(f));
    setGalleryFiles((prev) => [...prev, ...picked]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeNewGalleryAt = (idx) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => {
      const url = prev[idx];
      if (url?.startsWith?.('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingGalleryAt = (idx) => {
    setKeptExistingGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const errs = {};
    const { title, description, goal_amount, start_date, end_date, category, location } = formData;

    if (!title.trim()) errs.title = 'Vui lòng nhập tên chiến dịch';
    if (!description.trim()) errs.description = 'Vui lòng mô tả ngắn';
    if (!goal_amount || Number(goal_amount) < 100000) errs.goal_amount = 'Tối thiểu 100.000 VND';
    if (!start_date) errs.start_date = 'Chọn ngày bắt đầu';
    if (!end_date) errs.end_date = 'Chọn ngày kết thúc';
    if (start_date && end_date && new Date(end_date) < new Date(start_date))
      errs.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    if (!category) errs.category = 'Chọn danh mục';
    if (!location.trim()) errs.location = 'Nhập địa điểm';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ''));

      if (coverFile) fd.append('image', coverFile);
      keptExistingGalleryUrls.forEach((url) => fd.append('keep_image_urls', url));
      galleryFiles.forEach((f) => fd.append('images', f));
      if (qrFile) fd.append('qr_image', qrFile);

      await charityService.updateMyCampaign(id, fd);
      navigate('/charity-dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật chiến dịch');
    }
  };

  if (isLoading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Chỉnh sửa chiến dịch</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
        {/* 1) Tên chiến dịch */}
        <div>
          <label className="block font-medium">Tên chiến dịch</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${formErrors.title ? 'border-red-500' : ''}`}
            placeholder="Ví dụ: Chung tay vì trẻ em vùng cao"
            required
          />
          {formErrors.title && <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>}
        </div>

        {/* 2) Mô tả ngắn */}
        <div>
          <label className="block font-medium">Mô tả ngắn</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full border p-2 rounded ${formErrors.description ? 'border-red-500' : ''}`}
            placeholder="Tóm tắt mục tiêu, đối tượng hưởng lợi..."
            required
          />
          {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
        </div>

        {/* 3) Câu chuyện (mô tả chi tiết) */}
        <div>
          <label className="block font-medium">Câu chuyện (mô tả chi tiết)</label>
          <textarea
            name="detailed_description"
            value={formData.detailed_description}
            onChange={handleChange}
            rows={6}
            className="w-full border p-2 rounded"
            placeholder="Kể câu chuyện, hoàn cảnh, kế hoạch sử dụng quỹ..."
          />
        </div>

        {/* 4) Địa điểm */}
        <div>
          <label className="block font-medium">Địa điểm</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${formErrors.location ? 'border-red-500' : ''}`}
            placeholder="VD: Xã A, Huyện B, Tỉnh C"
            required
          />
          {formErrors.location && <p className="text-sm text-red-600 mt-1">{formErrors.location}</p>}
        </div>

        {/* 5) Số tiền cần gây quỹ */}
        <div>
          <label className="block font-medium">Số tiền cần gây quỹ (VND)</label>
          <input
            type="number"
            name="goal_amount"
            min="100000"
            value={formData.goal_amount}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${formErrors.goal_amount ? 'border-red-500' : ''}`}
            placeholder="Ví dụ: 10000000"
            required
          />
          {formErrors.goal_amount && <p className="text-sm text-red-600 mt-1">{formErrors.goal_amount}</p>}
        </div>

        {/* 6) Ngày bắt đầu / kết thúc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Ngày bắt đầu</label>
            <input
              type="date"
              name="start_date"
              min={todayStr}
              value={formData.start_date}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${formErrors.start_date ? 'border-red-500' : ''}`}
              required
            />
            {formErrors.start_date && <p className="text-sm text-red-600 mt-1">{formErrors.start_date}</p>}
          </div>
          <div>
            <label className="block font-medium">Ngày kết thúc</label>
            <input
              type="date"
              name="end_date"
              min={formData.start_date || todayStr}
              value={formData.end_date}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${formErrors.end_date ? 'border-red-500' : ''}`}
              required
            />
            {formErrors.end_date && <p className="text-sm text-red-600 mt-1">{formErrors.end_date}</p>}
          </div>
        </div>

        {/* 7) Danh mục */}
        <div>
          <label className="block font-medium">Danh mục</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${formErrors.category ? 'border-red-500' : ''}`}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            <option value="education">Giáo dục</option>
            <option value="health">Y tế</option>
            <option value="environment">Môi trường</option>
            <option value="emergency">Khẩn cấp</option>
            <option value="others">Khác</option>
          </select>
          {formErrors.category && <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>}
        </div>

        {/* 8) Ảnh đại diện */}
        <div>
          <label className="block font-medium">Ảnh đại diện chiến dịch</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} className="w-full border p-2 rounded" />
          {coverPreview && <img src={coverPreview} alt="Cover preview" className="mt-2 max-w-sm rounded border" />}
          <p className="text-xs text-gray-500 mt-1">Tối đa {MAX_IMG_MB}MB.</p>
        </div>

        {/* 9) Thư viện ảnh */}
        <div>
          <label className="block font-medium">Thư viện ảnh (tối đa {MAX_GALLERY_COUNT} ảnh)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="w-full border p-2 rounded"
          />

          <p className="text-sm text-gray-600 mt-2">Ảnh hiện có:</p>
          {keptExistingGalleryUrls.length ? (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              {keptExistingGalleryUrls.map((src, idx) => (
                <div key={`old-${idx}`} className="relative">
                  <img src={src} alt={`Existing ${idx}`} className="rounded border object-cover w-full h-32" />
                  <button
                    type="button"
                    onClick={() => removeExistingGalleryAt(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6"
                    title="Loại ảnh này khỏi chiến dịch"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Chưa có ảnh trong thư viện.</p>
          )}

          {!!galleryPreviews.length && (
            <>
              <p className="text-sm text-gray-600 mt-3">Ảnh mới thêm:</p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryPreviews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative">
                    <img src={src} alt={`New Gallery ${idx}`} className="rounded border object-cover w-full h-32" />
                    <button
                      type="button"
                      onClick={() => removeNewGalleryAt(idx)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6"
                      title="Xoá ảnh"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-xs text-gray-500 mt-1">Mỗi ảnh tối đa {MAX_IMG_MB}MB.</p>
        </div>

        {/* 10) QR (ảnh) */}
        <div>
          <label className="block font-medium">QR thanh toán (ảnh)</label>
          <input type="file" accept="image/*" onChange={handleQrChange} className="w-full border p-2 rounded" />
          {qrPreview && <img src={qrPreview} alt="QR preview" className="mt-2 max-w-xs rounded border" />}
        </div>

        {/* 11) Link QR */}
        <div>
          <label className="block font-medium">Link mã QR (nếu dùng URL)</label>
          <input
            type="text"
            name="qr_code_url"
            value={formData.qr_code_url}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Nếu tải ảnh QR lên, server có thể ưu tiên ảnh thay vì URL.
          </p>
        </div>

        {/* 12) Submit */}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Cập nhật chiến dịch
        </button>
      </form>
    </div>
  );
};

export default EditCampaignForm;
