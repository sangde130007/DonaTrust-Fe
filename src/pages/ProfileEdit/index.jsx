import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    accountName: '',
    contactEmail: '',
    phoneNumber: '',
    sex: '',
    dateOfBirth: '',
    address: '',
    linkFacebook: '',
    linkYoutube: '',
    linkTiktok: '',
    introduction: '',
    profile_image: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getProfile();
      const userData = response.user || response;

      const profileData = {
        accountName: userData.full_name || '',
        contactEmail: userData.email || '',
        phoneNumber: userData.phone || '',
        sex: userData.gender || '',
        dateOfBirth: userData.date_of_birth || '',
        address: userData.address || '',
        linkFacebook: userData.link_facebook || '',
        linkYoutube: userData.link_youtube || '',
        linkTiktok: userData.link_tiktok || '',
        introduction: userData.bio || '',
        profile_image: userData.profile_image || ''
      };

      setFormData(profileData);
      setOriginalData(profileData);
    } catch (error) {
      setError(error.message || 'Không thể tải dữ liệu hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const changedFields = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalData[key]) {
          switch (key) {
            case 'accountName':
              changedFields.full_name = formData[key];
              break;
            case 'contactEmail':
              break; // Không cho phép đổi email
            case 'phoneNumber':
              changedFields.phone = formData[key];
              break;
            case 'sex':
              changedFields.gender = formData[key];
              break;
            case 'dateOfBirth':
              changedFields.date_of_birth = formData[key];
              break;
            case 'introduction':
              changedFields.bio = formData[key];
              break;
            case 'linkFacebook':
              changedFields.link_facebook = formData[key];
              break;
            case 'linkYoutube':
              changedFields.link_youtube = formData[key];
              break;
            case 'linkTiktok':
              changedFields.link_tiktok = formData[key];
              break;
            default:
              changedFields[key] = formData[key];
          }
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return;
      }

      await userService.updateProfile(changedFields);
      setOriginalData({ ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-16 bg-global-3">
        {/* Avatar và tiêu đề */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={formData.profile_image || '/images/avt.jpg'}
            alt="Ảnh đại diện"
            className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-md object-cover"
          />
          <h2 className="mt-4 text-2xl font-bold text-global-1">
            Chỉnh sửa thông tin cá nhân
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-10 py-6 bg-white rounded-xl shadow-lg">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-6">
              Cập nhật thông tin thành công!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột trái */}
              <div className="space-y-5">
                <EditText
                  label="Tên tài khoản"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  required
                  className="h-[45px]"
                />

                <div>
                  <label className="block text-sm font-medium text-global-4 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                    className="w-full h-[45px] px-3 py-2 border border-global-8 rounded-lg bg-global-3 text-base text-global-9 outline-none"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-global-4 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full h-[45px] px-3 py-2 border border-global-8 rounded-lg bg-global-3 text-base text-global-9 outline-none"
                  />
                </div>

                <EditText
                  label="Số điện thoại"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="h-[45px]"
                />

                <EditText
                  label="Giới thiệu bản thân"
                  value={formData.introduction}
                  onChange={(e) => handleInputChange('introduction', e.target.value)}
                  placeholder="Tối đa 255 ký tự"
                  rows={4}
                  maxLength={255}
                />
              </div>

              {/* Cột phải */}
              <div className="space-y-5">
                <EditText
                  label="Email (không thể thay đổi)"
                  type="email"
                  value={formData.contactEmail}
                  disabled
                  className="h-[45px] bg-gray-100 text-gray-500"
                />

                <EditText
                  label="Link Facebook"
                  value={formData.linkFacebook}
                  onChange={(e) => handleInputChange('linkFacebook', e.target.value)}
                  placeholder="Nhập link Facebook"
                  className="h-[45px]"
                />

                <EditText
                  label="Link Youtube"
                  value={formData.linkYoutube}
                  onChange={(e) => handleInputChange('linkYoutube', e.target.value)}
                  placeholder="Nhập link Youtube"
                  className="h-[45px]"
                />

                <EditText
                  label="Link Tiktok"
                  value={formData.linkTiktok}
                  onChange={(e) => handleInputChange('linkTiktok', e.target.value)}
                  placeholder="Nhập link Tiktok"
                  className="h-[45px]"
                />

                <EditText
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="h-[45px]"
                />
              </div>
            </div>

            {/* Nút cập nhật */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-[180px] h-[40px] text-sm font-bold"
              >
                {isSaving ? 'Đang lưu...' : 'Cập nhật thông tin'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileEdit;
