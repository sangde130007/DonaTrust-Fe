// src/pages/CharityRegistration/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';
import Button from '../../components/ui/Button';

import { useAuth } from '../../context/AuthContext';
import charityService from '../../services/charityService';

// Giới hạn dung lượng file
const MAX_5MB = 5 * 1024 * 1024;
const MAX_2MB = 2 * 1024 * 1024;

const CharityRegistration = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    // Đại diện
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    // Tổ chức
    organizationName: '',
    website: '',
    organizationEmail: '',
    organizationPhone: '',
    address: '',
    // có thể chưa có city ở UI -> gửi 'Unknown'
    purposeOfRegistration: '',
    // xác nhận
    confirmAccurate: false,
    agreeTerms: false,
  });

  const [files, setFiles] = useState({
    license: null,      // Giấy phép/Chứng nhận (bắt buộc)
    description: null,  // Mô tả tổ chức PDF/DOC (bắt buộc)
    logo: null,         // Logo (không bắt buộc)
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Tự điền thông tin người dùng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const clearFieldError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  // ====== Checkboxes ======
  // Master = true khi cả 2 ô con đều true
  const masterConfirmed = formData.confirmAccurate && formData.agreeTerms;

  // Click master -> áp trạng thái cho cả 2 ô con
  const handleMasterConfirmToggle = (e) => {
    const v = e.target.checked;
    setFormData(prev => ({
      ...prev,
      confirmAccurate: v,
      agreeTerms: v,
    }));
    setErrors(prev => ({ ...prev, confirmAccurate: '', agreeTerms: '' }));
  };

  // Click từng ô con -> cập nhật bình thường
  const handleCheckboxChange = (field) => (e) => {
    const v = e.target.checked;
    setFormData(prev => ({ ...prev, [field]: v }));
    clearFieldError(field);
  };

  // ====== Files ======
  const validateFile = (file, { maxSize, types }) => {
    if (!file) return null;
    if (maxSize && file.size > maxSize) {
      return `Dung lượng vượt quá ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
    }
    if (types && types.length) {
      const ok = types.some((type) => file.type.includes(type));
      if (!ok) return 'Định dạng tệp không được hỗ trợ';
    }
    return null;
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files?.[0];

    let rule = { maxSize: MAX_5MB, types: ['pdf', 'msword', 'officedocument', 'jpeg', 'jpg', 'png'] };
    if (field === 'description') rule = { maxSize: MAX_5MB, types: ['pdf', 'msword', 'officedocument'] };
    if (field === 'logo')        rule = { maxSize: MAX_2MB, types: ['svg', 'jpeg', 'jpg', 'png'] };

    const err = validateFile(file, rule);
    setFiles(prev => ({ ...prev, [field]: file || null }));
    setErrors(prev => ({ ...prev, [field]: err || '' }));
  };

  // ====== Validate trước khi submit ======
  const validateForm = () => {
    const newErrors = {};
    const isEmail = (v) => /\S+@\S+\.\S+/.test(v);

    // Required
    if (!formData.fullName.trim())          newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim())             newErrors.email = 'Vui lòng nhập email';
    if (!formData.phoneNumber.trim())       newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    if (!formData.role.trim())              newErrors.role = 'Vui lòng chọn vai trò';

    if (!formData.organizationName.trim())  newErrors.organizationName = 'Vui lòng nhập tên tổ chức';
    if (!formData.organizationEmail.trim()) newErrors.organizationEmail = 'Vui lòng nhập email tổ chức';
    if (!formData.organizationPhone.trim()) newErrors.organizationPhone = 'Vui lòng nhập số điện thoại tổ chức';
    if (!formData.address.trim())           newErrors.address = 'Vui lòng nhập địa chỉ tổ chức';

    if (!formData.purposeOfRegistration.trim())
      newErrors.purposeOfRegistration = 'Vui lòng mô tả mục đích đăng ký';

    // Email format
    if (formData.email && !isEmail(formData.email))                     newErrors.email = 'Email không hợp lệ';
    if (formData.organizationEmail && !isEmail(formData.organizationEmail))
      newErrors.organizationEmail = 'Email tổ chức không hợp lệ';

    // Files required
    if (!files.license)     newErrors.license = 'Vui lòng tải giấy phép/chứng nhận';
    if (!files.description) newErrors.description = 'Vui lòng tải mô tả tổ chức';

    // Confirmations
    if (!formData.confirmAccurate) newErrors.confirmAccurate = 'Vui lòng xác nhận tính chính xác của thông tin';
    if (!formData.agreeTerms)      newErrors.agreeTerms = 'Vui lòng đồng ý điều khoản và chính sách';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ====== Submit ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isAuthenticated) {
      alert('Bạn cần đăng nhập để đăng ký trở thành tổ chức từ thiện.');
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Build FormData đúng field BE yêu cầu (KHÔNG dùng field "data")
      const fd = new FormData();

      // TEXT
      fd.append('name', (formData.organizationName || '').trim()); // BẮT BUỘC
      const purpose = (formData.purposeOfRegistration || '').trim();
      fd.append('description', purpose);
      fd.append('mission', purpose);
      fd.append('license_number', 'TMP-' + Date.now()); // tạm thời vì UI chưa có input số giấy phép
      fd.append('address', (formData.address || '').trim());
      fd.append('city', 'Unknown'); // nếu bạn có input city, thay vào đây
      fd.append('phone', (formData.organizationPhone || '').trim());
      fd.append('email', (formData.organizationEmail || '').trim());
      if (formData.website?.trim()) fd.append('website_url', formData.website.trim());

      // FILES
      if (files.license)     fd.append('license', files.license);
      if (files.description) fd.append('description', files.description);
      if (files.logo)        fd.append('logo', files.logo);

      // Gọi API
      await charityService.registerCharity(fd);

      alert('Gửi đăng ký tổ chức từ thiện thành công! Chúng tôi sẽ xem xét và phản hồi sớm.');

      // Reset form
      setFormData({
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        phoneNumber: '',
        role: '',
        organizationName: '',
        website: '',
        organizationEmail: '',
        organizationPhone: '',
        address: '',
        purposeOfRegistration: '',
        confirmAccurate: false,
        agreeTerms: false,
      });
      setFiles({ license: null, description: null, logo: null });
      setCurrentStep(1);
    } catch (error) {
      // backend có thể trả {status, message} hoặc {errors}
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Gửi đăng ký thất bại. Vui lòng thử lại.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ====== UI Steps ======
  const steps = [
    { id: 1, title: 'Thông tin đại diện', icon: '👤' },
    { id: 2, title: 'Chi tiết tổ chức', icon: '🏢' },
    { id: 3, title: 'Tài liệu & Mục đích', icon: '📄' },
    { id: 4, title: 'Xem lại & Gửi', icon: '✅' },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className="flex flex-col items-center focus:outline-none"
              title={step.title}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                }`}
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {step.icon}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 rounded-full transition-all duration-300 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderFileUpload = (field, label, accept, description) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type="file"
          onChange={handleFileChange(field)}
          accept={accept}
          className="hidden"
          id={`${field}-upload`}
        />
        <label
          htmlFor={`${field}-upload`}
          className={`w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 hover:border-blue-400 hover:bg-blue-50 ${
            files[field] ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="text-2xl">{files[field] ? '✅' : '📁'}</div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {files[field] ? files[field].name : 'Nhấn để chọn hoặc kéo thả tệp'}
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </label>
      </div>
      {errors[field] && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span>
          <span>{errors[field]}</span>
        </p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thông tin người đại diện</h2>
        <p className="text-gray-600">Hãy cho chúng tôi biết về bạn với vai trò đại diện tổ chức</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
          <EditText
            value={formData.fullName}
            onChange={handleInputChange('fullName')}
            placeholder="Nhập họ và tên"
            required
            error={errors.fullName}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
          <EditText
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Nhập email"
            required
            error={errors.email}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
          <EditText
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            placeholder="Nhập số điện thoại"
            required
            error={errors.phoneNumber}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Vai trò của bạn *</label>
          <select
            value={formData.role}
            onChange={handleInputChange('role')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Chọn vai trò</option>
            <option value="Founder">Người sáng lập</option>
            <option value="Director">Giám đốc</option>
            <option value="Manager">Quản lý</option>
            <option value="Coordinator">Điều phối viên</option>
            <option value="Representative">Đại diện</option>
            <option value="Other">Khác</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.role}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chi tiết tổ chức</h2>
        <p className="text-gray-600">Cung cấp thông tin về tổ chức từ thiện của bạn</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tên tổ chức *</label>
          <EditText
            value={formData.organizationName}
            onChange={handleInputChange('organizationName')}
            placeholder="Nhập tên tổ chức"
            required
            error={errors.organizationName}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Website (không bắt buộc)</label>
          <EditText
            type="url"
            value={formData.website}
            onChange={handleInputChange('website')}
            placeholder="https://to-chuc-cua-ban.vn"
            error={errors.website}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email tổ chức *</label>
            <EditText
              type="email"
              value={formData.organizationEmail}
              onChange={handleInputChange('organizationEmail')}
              placeholder="lienhe@tochuc.vn"
              required
              error={errors.organizationEmail}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">SĐT tổ chức *</label>
            <EditText
              type="tel"
              value={formData.organizationPhone}
              onChange={handleInputChange('organizationPhone')}
              placeholder="Số điện thoại tổ chức"
              required
              error={errors.organizationPhone}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ tổ chức *</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Nhập địa chỉ đầy đủ của tổ chức"
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
          />
          {errors.address && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.address}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tài liệu & Mục đích</h2>
        <p className="text-gray-600">Tải các tài liệu bắt buộc và mô tả mục đích đăng ký</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">📋 Tài liệu bắt buộc</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderFileUpload(
              'license',
              'Giấy phép / Chứng nhận *',
              '.pdf,.doc,.docx,.jpg,.jpeg,.png',
              'Hỗ trợ PDF, DOC, DOCX, JPG, PNG (Tối đa 5MB)'
            )}
          </div>

          <div>
            {renderFileUpload(
              'description',
              'Mô tả tổ chức *',
              '.pdf,.doc,.docx',
              'Hỗ trợ PDF, DOC, DOCX (Tối đa 5MB)'
            )}
          </div>
        </div>

        <div className="md:w-1/2">
          {renderFileUpload(
            'logo',
            'Logo tổ chức (không bắt buộc)',
            '.jpg,.jpeg,.png,.svg',
            'Hỗ trợ JPG, PNG, SVG (Tối đa 2MB)'
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">🎯 Mục đích đăng ký</h3>
          <textarea
            value={formData.purposeOfRegistration}
            onChange={(e) => setFormData(prev => ({ ...prev, purposeOfRegistration: e.target.value }))}
            placeholder="Mô tả mục đích tham gia DonaTrust và cách bạn dự định sử dụng nền tảng để giúp cộng đồng..."
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
          />
          {errors.purposeOfRegistration && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              <span>{errors.purposeOfRegistration}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Xem lại & Gửi</h2>
        <p className="text-gray-600">Vui lòng kiểm tra lại thông tin trước khi gửi</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Tóm tắt hồ sơ</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Người đại diện:</strong> {formData.fullName || '-'}</div>
          <div><strong>Email:</strong> {formData.email || '-'}</div>
          <div><strong>Tổ chức:</strong> {formData.organizationName || '-'}</div>
          <div><strong>Vai trò:</strong> {formData.role || '-'}</div>
        </div>

        <div className="mt-4">
          <strong>Tệp đã tải lên:</strong>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>Giấy phép: {files.license?.name || 'Chưa tải'}</li>
            <li>Mô tả: {files.description?.name || 'Chưa tải'}</li>
            <li>Logo: {files.logo?.name || 'Chưa tải'}</li>
          </ul>
        </div>
      </div>

      {/* Xác nhận */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        {/* Ô master */}
        <CheckBox
          checked={masterConfirmed}
          onChange={handleMasterConfirmToggle}
          label="Tôi đồng ý xác nhận tất cả các điều kiện"
          id="confirm_all"
        />

        {/* Hai điều kiện con */}
        <div className="ml-6 space-y-3">
          <CheckBox
            checked={formData.confirmAccurate}
            onChange={handleCheckboxChange('confirmAccurate')}
            label="Tôi xác nhận toàn bộ thông tin đã cung cấp là chính xác và đầy đủ"
            id="confirm_accurate"
          />
          {errors.confirmAccurate && <p className="text-sm text-red-500 mt-1">⚠️ {errors.confirmAccurate}</p>}

          <CheckBox
            checked={formData.agreeTerms}
            onChange={handleCheckboxChange('agreeTerms')}
            label="Tôi đồng ý với điều khoản sử dụng và chính sách riêng tư"
            id="agree_terms"
          />
          {errors.agreeTerms && <p className="text-sm text-red-500 mt-1">⚠️ {errors.agreeTerms}</p>}
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errors.general}</span>
          </p>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tham gia DonaTrust với tư cách Tổ chức</h1>
          <p className="text-xl md:text-2xl opacity-90">Kết nối với nhà hảo tâm và tạo tác động thực sự cho cộng đồng</p>
        </div>
      </div>

      {/* Form chính */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderCurrentStep()}

            {/* Nút điều hướng */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Quay lại
              </button>

              <div className="flex space-x-4">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                  >
                    Tiếp tục →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang gửi...</span>
                      </span>
                    ) : (
                      '🚀 Gửi hồ sơ'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CharityRegistration;
