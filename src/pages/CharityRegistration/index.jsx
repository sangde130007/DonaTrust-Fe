import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import charityService from '../../services/charityService';

const CharityRegistration = () => {
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    organizationName: '',
    website: '',
    organizationEmail: '',
    organizationPhone: '',
    address: '',
    purposeOfRegistration: '',
    confirmAccurate: false,
    agreeTerms: false
  });

  const [files, setFiles] = useState({
    license: null,
    description: null,
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCheckboxChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    if (!formData.role.trim()) newErrors.role = 'Vui lòng nhập chức vụ';

    if (!formData.organizationName.trim()) newErrors.organizationName = 'Vui lòng nhập tên tổ chức';
    if (!formData.organizationEmail.trim()) newErrors.organizationEmail = 'Vui lòng nhập email tổ chức';
    else if (!/\S+@\S+\.\S+/.test(formData.organizationEmail)) newErrors.organizationEmail = 'Email tổ chức không hợp lệ';

    if (!formData.organizationPhone.trim()) newErrors.organizationPhone = 'Vui lòng nhập số điện thoại tổ chức';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ tổ chức';
    if (!formData.purposeOfRegistration.trim()) newErrors.purposeOfRegistration = 'Vui lòng nhập mục đích đăng ký';

    if (!files.license) newErrors.license = 'Vui lòng đính kèm giấy phép/công nhận';
    if (!files.description) newErrors.description = 'Vui lòng đính kèm mô tả tổ chức';

    if (!formData.confirmAccurate) newErrors.confirmAccurate = 'Vui lòng xác nhận thông tin chính xác';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập trước khi đăng ký tổ chức từ thiện.');
      window.location.href = '/signin';
      return;
    }

    setIsLoading(true);

    try {
      const charityData = {
        representativeInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role
        },
        organizationInfo: {
          name: formData.organizationName,
          website: formData.website || null,
          email: formData.organizationEmail,
          phoneNumber: formData.organizationPhone,
          address: formData.address
        },
        purposeOfRegistration: formData.purposeOfRegistration,
        documents: {
          license: files.license?.name,
          description: files.description?.name,
          logo: files.logo?.name
        }
      };

      await charityService.registerCharity(charityData);

      alert('Đăng ký tổ chức thành công! Chúng tôi sẽ xem xét hồ sơ và liên hệ lại.');

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
        agreeTerms: false
      });

      setFiles({
        license: null,
        description: null,
        logo: null
      });

    } catch (error) {
      setErrors({
        general: error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-global-3 flex flex-col">

      <div className="relative w-full h-[349px] bg-cover bg-center" style={{ backgroundImage: `url('/images/img_.png')` }}>
        <div className="absolute top-[316px] right-[40px]">
          <img src="/images/img_24_user_interface_image.svg" alt="Image Icon" className="w-6 h-6 rounded-[5px]" />
        </div>
      </div>

      <div className="flex-1 flex justify-center items-start py-20">
        <div className="relative">
          <img src="/images/img_image_27.png" alt="Form Background" className="w-[1115px] h-[743px]" />
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-[600px] bg-global-3 bg-opacity-95 p-8 rounded-lg shadow-lg">
              <h1 className="text-2xl font-inter font-semibold text-center text-global-1 mb-8">
                ĐĂNG KÝ TỔ CHỨC TỪ THIỆN
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Phần đại diện */}
                <div>
                  <h2 className="text-lg font-inter font-medium text-global-1 mb-4">
                    THÔNG TIN NGƯỜI ĐẠI DIỆN
                  </h2>

                  <EditText value={formData.fullName} onChange={handleInputChange('fullName')} placeholder="Họ và tên" error={errors.fullName} />
                  <EditText type="email" value={formData.email} onChange={handleInputChange('email')} placeholder="Email" error={errors.email} />
                  <EditText type="tel" value={formData.phoneNumber} onChange={handleInputChange('phoneNumber')} placeholder="Số điện thoại" error={errors.phoneNumber} />
                  <EditText value={formData.role} onChange={handleInputChange('role')} placeholder="Chức vụ" error={errors.role} />
                </div>

                {/* Phần tổ chức */}
                <div>
                  <h2 className="text-lg font-inter font-medium text-global-1 mb-4">
                    THÔNG TIN TỔ CHỨC
                  </h2>

                  <EditText value={formData.organizationName} onChange={handleInputChange('organizationName')} placeholder="Tên tổ chức" error={errors.organizationName} />
                  <EditText type="url" value={formData.website} onChange={handleInputChange('website')} placeholder="Website (không bắt buộc)" />
                  <EditText type="email" value={formData.organizationEmail} onChange={handleInputChange('organizationEmail')} placeholder="Email tổ chức" error={errors.organizationEmail} />
                  <EditText type="tel" value={formData.organizationPhone} onChange={handleInputChange('organizationPhone')} placeholder="SĐT tổ chức" error={errors.organizationPhone} />
                  <textarea
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    placeholder="Địa chỉ tổ chức"
                    required
                    className="w-full px-3 py-2 border border-global-4 rounded-md text-base font-inter text-global-1 placeholder-edittext-2 bg-global-3 focus:outline-none focus:ring-2 focus:ring-button-1 focus:border-transparent resize-vertical min-h-[80px]"
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>

                {/* File */}
                <div>
                  <h2 className="text-lg font-inter font-medium text-global-1 mb-4">TÀI LIỆU XÁC MINH</h2>

                  <label className="block text-sm font-inter text-global-1 mb-2">Giấy phép / công nhận</label>
                  <input type="file" onChange={handleFileChange('license')} className="mb-2" />
                  {errors.license && <p className="text-sm text-red-500">{errors.license}</p>}

                  <label className="block text-sm font-inter text-global-1 mb-2">Mô tả tổ chức</label>
                  <input type="file" onChange={handleFileChange('description')} className="mb-2" />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}

                  <label className="block text-sm font-inter text-global-1 mb-2">Logo (không bắt buộc)</label>
                  <input type="file" onChange={handleFileChange('logo')} />
                </div>

                {/* Mục đích */}
                <div>
                  <h2 className="text-lg font-inter font-medium text-global-1 mb-4">MỤC ĐÍCH ĐĂNG KÝ</h2>
                  <textarea
                    value={formData.purposeOfRegistration}
                    onChange={handleInputChange('purposeOfRegistration')}
                    placeholder="Mục đích đăng ký và cách bạn sẽ sử dụng nền tảng DonaTrust..."
                    required
                    className="w-full px-3 py-2 border border-global-4 rounded-md text-base font-inter text-global-1 placeholder-edittext-2 bg-global-3 focus:outline-none focus:ring-2 focus:ring-button-1 focus:border-transparent resize-vertical min-h-[100px]"
                  />
                  {errors.purposeOfRegistration && <p className="text-sm text-red-500">{errors.purposeOfRegistration}</p>}
                </div>

                {/* Checkbox */}
                <div className="space-y-3">
                  <CheckBox checked={formData.confirmAccurate} onChange={handleCheckboxChange('confirmAccurate')} label="Tôi xác nhận thông tin trên là chính xác" error={errors.confirmAccurate} />
                  <CheckBox checked={formData.agreeTerms} onChange={handleCheckboxChange('agreeTerms')} label="Tôi đồng ý với các điều khoản và chính sách của DonaTrust" error={errors.agreeTerms} />
                </div>

                {/* Button */}
                <div className="flex justify-center pt-4">
                  <Button type="submit" variant="primary" size="large" className="px-12 py-3" disabled={isLoading}>
                    {isLoading ? 'ĐANG GỬI...' : 'GỬI ĐĂNG KÝ'}
                  </Button>
                </div>
                {errors.general && <p className="text-center text-red-500 mt-4">{errors.general}</p>}

              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CharityRegistration;
