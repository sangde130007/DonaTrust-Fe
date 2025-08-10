  import React, { useState, useEffect, useMemo } from 'react';
  import { useNavigate } from 'react-router-dom';
  import campaignService from '../../services/campaignService';

  const MAX_IMG_MB = 10;
  const MAX_GALLERY_COUNT = 10;

  const CreateCampaignForm = () => {
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
    });

    // files & preview
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
      return () => {
        if (qrPreview) URL.revokeObjectURL(qrPreview);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
      };
    }, [qrPreview, coverPreview, galleryPreviews]);

    const setField = (name, value) =>
      setFormData((prev) => ({ ...prev, [name]: value }));

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
      setQrPreview(URL.createObjectURL(f));
    };

    const handleCoverChange = (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const msg = validateImage(f);
      if (msg) { alert(msg); e.target.value = ''; return; }
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    };

    const handleGalleryChange = (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const remain = Math.max(0, MAX_GALLERY_COUNT - galleryFiles.length);
      const picked = files.slice(0, remain);

      const invalid = picked.find((f) => validateImage(f));
      if (invalid) { alert(validateImage(invalid)); e.target.value = ''; return; }

      const newPreviews = picked.map((f) => URL.createObjectURL(f));
      setGalleryFiles((prev) => [...prev, ...picked]);
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
      e.target.value = '';
    };

    const removeGalleryAt = (idx) => {
      setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
      setGalleryPreviews((prev) => {
        const url = prev[idx];
        if (url) URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== idx);
      });
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
      if (!coverFile) errs.cover_image = 'Nên thêm ảnh đại diện chiến dịch';

      setFormErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ''));

        // ĐÚNG tên field BE
        if (coverFile) fd.append('image', coverFile);
        galleryFiles.forEach((f) => fd.append('images', f));
        if (qrFile) fd.append('qr_image', qrFile);

        await campaignService.createCampaign(fd);
        navigate('/charity-dashboard');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Tạo chiến dịch mới</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block font-medium">Tên chiến dịch</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              className={`w-full border p-2 rounded ${formErrors.title ? 'border-red-500' : ''}`}
              placeholder="Ví dụ: Chung tay vì trẻ em vùng cao" required
            />
            {formErrors.title && <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block font-medium">Mô tả ngắn</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows={3}
              className={`w-full border p-2 rounded ${formErrors.description ? 'border-red-500' : ''}`}
              placeholder="Tóm tắt mục tiêu, đối tượng hưởng lợi..." required
            />
            {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
          </div>

          <div>
            <label className="block font-medium">Câu chuyện (mô tả chi tiết)</label>
            <textarea
              name="detailed_description" value={formData.detailed_description} onChange={handleChange} rows={6}
              className="w-full border p-2 rounded" placeholder="Kể câu chuyện, hoàn cảnh, kế hoạch sử dụng quỹ..."
            />
          </div>

          <div>
            <label className="block font-medium">Địa điểm</label>
            <input
              type="text" name="location" value={formData.location} onChange={handleChange}
              className={`w-full border p-2 rounded ${formErrors.location ? 'border-red-500' : ''}`}
              placeholder="VD: Xã A, Huyện B, Tỉnh C" required
            />
            {formErrors.location && <p className="text-sm text-red-600 mt-1">{formErrors.location}</p>}
          </div>

          <div>
            <label className="block font-medium">Số tiền cần gây quỹ (VND)</label>
            <input
              type="number" name="goal_amount" min="100000" value={formData.goal_amount} onChange={handleChange}
              className={`w-full border p-2 rounded ${formErrors.goal_amount ? 'border-red-500' : ''}`}
              placeholder="Ví dụ: 10000000" required
            />
            {formErrors.goal_amount && <p className="text-sm text-red-600 mt-1">{formErrors.goal_amount}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Ngày bắt đầu</label>
              <input
                type="date" name="start_date" min={todayStr} value={formData.start_date} onChange={handleChange}
                className={`w-full border p-2 rounded ${formErrors.start_date ? 'border-red-500' : ''}`} required
              />
              {formErrors.start_date && <p className="text-sm text-red-600 mt-1">{formErrors.start_date}</p>}
            </div>
            <div>
              <label className="block font-medium">Ngày kết thúc</label>
              <input
                type="date" name="end_date" min={formData.start_date || todayStr}
                value={formData.end_date} onChange={handleChange}
                className={`w-full border p-2 rounded ${formErrors.end_date ? 'border-red-500' : ''}`} required
              />
              {formErrors.end_date && <p className="text-sm text-red-600 mt-1">{formErrors.end_date}</p>}
            </div>
          </div>

          <div>
            <label className="block font-medium">Danh mục</label>
            <select
              name="category" value={formData.category} onChange={handleChange}
              className={`w-full border p-2 rounded ${formErrors.category ? 'border-red-500' : ''}`} required
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

          <div>
            <label className="block font-medium">Ảnh đại diện chiến dịch</label>
            <input type="file" accept="image/*" onChange={handleCoverChange}
              className={`w-full border p-2 rounded ${formErrors.cover_image ? 'border-red-500' : ''}`}
            />
            {formErrors.cover_image && <p className="text-sm text-red-600 mt-1">{formErrors.cover_image}</p>}
            {coverPreview && <img src={coverPreview} alt="Cover preview" className="mt-2 max-w-sm rounded border" />}
            <p className="text-xs text-gray-500 mt-1">Tối đa {MAX_IMG_MB}MB.</p>
          </div>

          <div>
            <label className="block font-medium">Thư viện ảnh (tối đa {MAX_GALLERY_COUNT} ảnh)</label>
            <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="w-full border p-2 rounded" />
            {!!galleryPreviews.length && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryPreviews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img src={src} alt={`Gallery ${idx}`} className="rounded border object-cover w-full h-32" />
                    <button type="button" onClick={() => removeGalleryAt(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6" title="Xoá ảnh">×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Mỗi ảnh tối đa {MAX_IMG_MB}MB.</p>
          </div>

          <div>
            <label className="block font-medium">QR thanh toán (ảnh)</label>
            <input type="file" accept="image/*" onChange={handleQrChange} className="w-full border p-2 rounded" />
          </div>
          {qrPreview && <img src={qrPreview} alt="QR preview" className="mt-2 max-w-xs rounded border" />}

          <button type="submit" disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60">
            {isLoading ? 'Đang tạo...' : 'Tạo chiến dịch'}
          </button>
        </form>
      </div>
    );
  };

  export default CreateCampaignForm;
