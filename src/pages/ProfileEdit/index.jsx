import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    address: '',
    district: '',
    ward: '',
    bio: '',
    profile_image: '',
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

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
      setError(null);

      const response = await userService.getProfile();
      const userData = response.user || response;

      const profileData = {
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        date_of_birth: userData.date_of_birth || '',
        address: userData.address || '',
        district: userData.district || '',
        ward: userData.ward || '',
        bio: userData.bio || '',
        profile_image: userData.profile_image || '',
      };

      setFormData(profileData);
      setOriginalData(profileData);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'Không thể tải dữ liệu hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (success) {
      setSuccess(false);
    }
  };

  const handleAvatarClick = () => {
    console.log('🎯 Avatar clicked - opening file dialog');
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target.files[0];
    console.log('📁 File selected:', file ? file.name : 'No file');

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, GIF, hoặc WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Kích thước file ảnh phải nhỏ hơn 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Create preview IMMEDIATELY
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      console.log('🖼️ Preview created:', previewUrl);

      console.log('📤 Starting avatar upload process...');

      // Call REAL API upload
      const response = await userService.uploadAvatar(file);

      console.log('✅ Avatar upload API response:', response);

      // Get the new avatar URL from response
      const newAvatarUrl = response.avatar_url || response.profile_image;

      if (!newAvatarUrl) {
        throw new Error('Không có URL ảnh đại diện từ server');
      }

      console.log('🔄 Updating avatar URL in state:', newAvatarUrl);

      // Clear preview and update with actual server URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setAvatarPreview(null);

      // Update form data with new avatar URL
      setFormData((prev) => ({
        ...prev,
        profile_image: newAvatarUrl,
      }));

      // Update original data as well since this is an immediate save
      setOriginalData((prev) => ({
        ...prev,
        profile_image: newAvatarUrl,
      }));

      // Update AuthContext with new user data
      if (response.user && updateUser) {
        updateUser(response.user);
        console.log('🔄 Updated auth context with new user data');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      console.log('🔄 Avatar update completed successfully');
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      setError(error.message || 'Không thể tải lên ảnh đại diện');

      // Clean up preview on error
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      // Only send changed fields (excluding profile_image since it's handled separately)
      const changedFields = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalData[key] && key !== 'email' && key !== 'profile_image') {
          changedFields[key] = formData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return;
      }

      console.log('📤 Updating profile with changes:', changedFields);

      const response = await userService.updateProfile(changedFields);
      const updatedUser = response.user || response;

      console.log('✅ Profile update successful:', updatedUser);

      // Update both form data and original data with the response
      const updatedData = {
        full_name: updatedUser.full_name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        gender: updatedUser.gender || '',
        date_of_birth: updatedUser.date_of_birth || '',
        address: updatedUser.address || '',
        district: updatedUser.district || '',
        ward: updatedUser.ward || '',
        bio: updatedUser.bio || '',
        profile_image: updatedUser.profile_image || '',
      };

      setFormData(updatedData);
      setOriginalData(updatedData);

      if (updateUser) {
        updateUser(updatedUser);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      setError(error.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  // Get current avatar to display - optimized to prevent loops
  const getCurrentAvatar = React.useMemo(() => {
    if (avatarPreview) {
      console.log('🖼️ Using avatar preview:', avatarPreview);
      return avatarPreview;
    }

    if (formData.profile_image) {
      console.log('🖼️ Using profile image:', formData.profile_image);
      // Check if it's a relative URL and make it absolute
      const imageUrl = formData.profile_image.startsWith('http')
        ? formData.profile_image
        : `${window.location.origin}${formData.profile_image}`;
      return imageUrl;
    }

    console.log('🖼️ Using fallback avatar');
    return '/images/avt.jpg'; // Use your actual default avatar path
  }, [avatarPreview, formData.profile_image]);

  if (!isAuthenticated) {
    return null; // Will redirect to sign-in
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          <p className="text-lg text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-2xl bg-global-3">
      {/* Add padding-top to push below fixed header */}
      <div className="relative pt-24">
        {/* Avatar and Label */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={getCurrentAvatar}
              alt="Profile Picture"
              className="w-[120px] h-[120px] rounded-full border-4 border-global-3 bg-white object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleAvatarClick}
              onError={(e) => {
                console.log('🖼️ Avatar load failed, using fallback');
                e.target.src = '/images/avt.jpg';
              }}
            />

            {/* Upload overlay */}
            <div
              className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-0 rounded-full transition-all duration-200 cursor-pointer hover:bg-opacity-30"
              onClick={handleAvatarClick}
            >
              <div className="opacity-0 transition-opacity duration-200 hover:opacity-100">
                {isUploadingAvatar ? (
                  <div className="w-8 h-8 rounded-full border-b-2 border-white animate-spin"></div>
                ) : (
                  <div className="text-center text-white">
                    <svg className="mx-auto mb-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs">Thay đổi</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload status indicator */}
            {isUploadingAvatar && (
              <div className="absolute -bottom-2 left-1/2 px-2 py-1 text-xs text-white bg-blue-600 rounded-full transform -translate-x-1/2">
                Đang tải lên...
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />

          <span className="mt-4 text-xl font-bold font-inter text-global-8">
            {formData.full_name || 'Người dùng'}
          </span>

          <p className="mt-2 max-w-xs text-sm text-center text-gray-600">
            Nhấp vào ảnh đại diện của bạn để tải lên ảnh mới
            <br />
            <span className="text-xs text-gray-500">Hỗ trợ: JPEG, PNG, GIF, WebP (tối đa 5MB)</span>
          </p>
        </div>

        {/* Edit Form Section */}
        <div className="px-4 py-8 mx-auto max-w-5xl md:px-6">
          <h1 className="mb-12 text-2xl font-bold text-center font-inter text-global-1">
            Chỉnh sửa thông tin cá nhân
          </h1>

          {/* Error Message */}
          {error && (
            <div className="p-4 mb-6 bg-red-50 rounded-md border border-red-200">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchUserProfile}
                className="mt-2 text-red-600 underline hover:no-underline"
              >
                Thử tải lại dữ liệu hồ sơ
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 mb-6 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-600">
                {isUploadingAvatar
                  ? 'Tải lên ảnh đại diện thành công!'
                  : 'Cập nhật hồ sơ thành công!'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <EditText
                  label="Họ và tên"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                  className="h-[45px]"
                />

                <div>
                  <label className="block mb-1 text-sm font-medium font-inter text-global-4">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full h-[45px] px-3 py-2 border border-global-8 rounded-lg bg-global-3 text-base font-inter text-global-9 outline-none"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium font-inter text-global-4">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full h-[45px] px-3 py-2 border border-global-8 rounded-lg bg-global-3 text-base font-inter text-global-9 outline-none"
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <EditText
                  label="Số điện thoại"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Số điện thoại"
                  className="h-[45px]"
                />

                <div>
                  <label className="block mb-1 text-sm font-medium font-inter text-global-4">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tối đa 255 ký tự"
                    maxLength={255}
                    rows={4}
                    className="px-3 py-2 w-full text-base rounded-lg border outline-none resize-none border-global-8 bg-global-3 font-inter text-global-9"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/255 ký tự</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block mb-1 text-sm font-medium font-inter text-global-4">
                    Email (Không thể thay đổi)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full h-[45px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-base font-inter text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <EditText
                  label="Quận/Huyện"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Quận/Huyện"
                  className="h-[45px]"
                />

                <EditText
                  label="Phường/Xã"
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', e.target.value)}
                  placeholder="Phường/Xã"
                  className="h-[45px]"
                />

                <EditText
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Địa chỉ"
                  className="h-[45px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving || isUploadingAvatar}
                className="w-[200px] h-[40px] text-sm font-bold"
              >
                {isSaving ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
