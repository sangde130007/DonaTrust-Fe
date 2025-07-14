import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';

const ProfileEdit = () => {
  const [formData, setFormData] = useState({
    accountName: 'Đạt Nguyễn Tiến',
    contactEmail: 'datnguyen109@gmail.com',
    sex: '',
    dateOfBirth: '',
    phoneNumber: '',
    linkFacebook: '',
    linkYoutube: '',
    linkTiktok: '',
    address: '',
    introduction: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dữ liệu gửi đi:', formData);
    alert('Cập nhật thông tin thành công!');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-16 bg-global-3">
        {/* Avatar và tiêu đề */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/images/avt.jpg"
            alt="Ảnh đại diện"
            className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-md object-cover"
          />
          <h2 className="mt-4 text-2xl font-bold text-global-1">
            Chỉnh sửa thông tin cá nhân
          </h2>
        </div>

        {/* Form */}
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-6 bg-white rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột trái */}
              <div className="space-y-5">
                <EditText
                  label="Tên tài khoản"
                  value={formData.accountName}
                  onChange={(value) => handleInputChange('accountName', value)}
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
                  onChange={(value) => handleInputChange('phoneNumber', value)}
                  placeholder="Nhập số điện thoại"
                  className="h-[45px]"
                />

                <EditText
                  label="Giới thiệu bản thân"
                  value={formData.introduction}
                  onChange={(value) => handleInputChange('introduction', value)}
                  placeholder="Tối đa 255 ký tự"
                  rows={4}
                  maxLength={255}
                />
              </div>

              {/* Cột phải */}
              <div className="space-y-5">
                <EditText
                  label="Email liên hệ"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(value) => handleInputChange('contactEmail', value)}
                  className="h-[45px]"
                />

                <EditText
                  label="Link Facebook"
                  value={formData.linkFacebook}
                  onChange={(value) => handleInputChange('linkFacebook', value)}
                  placeholder="Nhập link Facebook"
                  className="h-[45px]"
                />

                <EditText
                  label="Link Youtube"
                  value={formData.linkYoutube}
                  onChange={(value) => handleInputChange('linkYoutube', value)}
                  placeholder="Nhập link Youtube"
                  className="h-[45px]"
                />

                <EditText
                  label="Link Tiktok"
                  value={formData.linkTiktok}
                  onChange={(value) => handleInputChange('linkTiktok', value)}
                  placeholder="Nhập link Tiktok"
                  className="h-[45px]"
                />

                <EditText
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(value) => handleInputChange('address', value)}
                  placeholder="Nhập địa chỉ"
                  className="h-[45px]"
                />
              </div>
            </div>

            {/* Nút cập nhật */}
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                className="w-[180px] h-[40px] text-sm font-bold"
              >
                Cập nhật thông tin
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
