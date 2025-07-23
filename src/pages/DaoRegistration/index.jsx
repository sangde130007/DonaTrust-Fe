import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';

const DaoRegistration = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Dat Nguyen Tien',
    email: 'Datnguyentien@gmail.com',
    introduction: '',
    experience: '',
    areasOfInterest: {
      education: false,
      medical: false,
      children: false,
      environment: false,
      naturalDisaster: false,
      disability: false,
    },
    certificateFile: null,
    commitment: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestChange = (interest, checked) => {
    setFormData((prev) => ({
      ...prev,
      areasOfInterest: {
        ...prev.areasOfInterest,
        [interest]: checked,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasInterest = Object.values(formData.areasOfInterest).some((val) => val);
    if (!formData.fullName || !formData.email || !formData.introduction || !formData.experience) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    if (!hasInterest) {
      alert('Vui lòng chọn ít nhất một lĩnh vực bạn quan tâm.');
      return;
    }

    if (!formData.certificateFile) {
      alert('Vui lòng tải lên ít nhất một bằng chứng hoạt động thiện nguyện.');
      return;
    }

    if (!formData.commitment) {
      alert('Vui lòng xác nhận cam kết với nguyên tắc của DonaTrust.');
      return;
    }

    console.log('Đăng ký DAO:', formData);
    setShowSuccessModal(true);
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-global-3">
      {/* Hero Background */}
      <div
        className="w-full h-[349px] bg-cover bg-center relative"
        style={{ backgroundImage: `url('/images/img_.png')` }}
      >
        <div className="absolute top-[316px] right-[40px]">
          <img
            src="/images/img_24_user_interface_image.svg"
            alt="Biểu tượng ảnh"
            className="w-6 h-6 rounded-[5px]"
          />
        </div>
      </div>

      {/* Main Form */}
      <main className="flex-1 bg-global-1 py-20 flex justify-center px-4">
        <div className="w-full max-w-[714px] bg-global-3 rounded-[20px] shadow-lg px-6 py-10">
          <div className="text-center mb-12">
            <h1 className="text-[32px] font-bold font-manrope text-global-1 leading-[44px] mb-6">
              ĐĂNG KÝ THÀNH VIÊN DAO - DONATRUST
            </h1>
            <p className="text-base font-light font-manrope text-global-1 leading-6">
              Tham gia cộng đồng DAO để giám sát, bỏ phiếu và xây dựng một DonaTrust minh bạch hơn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name Input */}
            <div>
              <label className="block text-lg font-bold text-global-1 mb-2">
                Họ và tên: <span className="text-global-21">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                className="w-full h-[46px] px-4 border rounded bg-white text-global-1"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-lg font-bold text-global-1 mb-2">
                Email: <span className="text-global-21">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full h-[46px] px-4 border rounded bg-white text-global-1"
              />
            </div>

            {/* Introduction */}
            <div>
              <label className="block text-lg font-bold text-global-1 mb-2">
                Giới thiệu bản thân: <span className="text-global-21">*</span>
              </label>
              <EditText
                value={formData.introduction}
                onChange={(value) => handleInputChange('introduction', value)}
                placeholder="Vì sao bạn muốn tham gia DAO? Bạn quan tâm điều gì nhất?..."
                multiline
                rows={4}
                className="w-full"
              />
            </div>

            {/* Areas of Interest */}
            <div>
              <label className="block text-lg font-bold text-global-1 mb-2">
                Lĩnh vực quan tâm: <span className="text-global-21">*</span>
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-5 mb-2">
                <CheckBox
                  checked={formData.areasOfInterest.education}
                  onChange={(c) => handleInterestChange('education', c)}
                  label="🎓 Giáo dục"
                />
                <CheckBox
                  checked={formData.areasOfInterest.medical}
                  onChange={(c) => handleInterestChange('medical', c)}
                  label="⛑️ Y tế"
                />
                <CheckBox
                  checked={formData.areasOfInterest.children}
                  onChange={(c) => handleInterestChange('children', c)}
                  label="👶 Trẻ em"
                />
                <CheckBox
                  checked={formData.areasOfInterest.environment}
                  onChange={(c) => handleInterestChange('environment', c)}
                  label="🌿 Môi trường"
                />
                <CheckBox
                  checked={formData.areasOfInterest.naturalDisaster}
                  onChange={(c) => handleInterestChange('naturalDisaster', c)}
                  label="⛈️ Thiên tai"
                />
                <CheckBox
                  checked={formData.areasOfInterest.disability}
                  onChange={(c) => handleInterestChange('disability', c)}
                  label="🧑‍🦽 Người khuyết tật"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-lg font-bold text-global-1 mb-2">
                Kinh nghiệm / hiểu biết về hoạt động thiện nguyện: <span className="text-global-21">*</span>
              </label>
              <EditText
                value={formData.experience}
                onChange={(value) => handleInputChange('experience', value)}
                placeholder="Có thể là các đóng góp trước đây, hiểu biết về cộng đồng DAO..."
                multiline
                rows={4}
                className="w-full"
              />
            </div>

            {/* Certificate Upload */}
            <div>
              <label className="block text-lg font-bold text-global-1 mb-2">
                Giấy chứng nhận, ảnh hoạt động, bằng chứng thiện nguyện: <span className="text-global-21">*</span>
              </label>
              <input
                type="file"
                onChange={(e) => handleInputChange('certificateFile', e.target.files[0])}
                className="w-full h-[41px] px-4 py-2 border rounded text-sm bg-white text-global-1"
              />
              {formData.certificateFile && (
                <p className="mt-2 text-sm text-global-1">
                  Đã chọn: {formData.certificateFile.name}
                </p>
              )}
            </div>

            {/* Commitment */}
            <div className="flex items-start gap-4">
              <CheckBox
                checked={formData.commitment}
                onChange={(c) => handleInputChange('commitment', c)}
                className="mt-1"
              />
              <span className="text-base text-global-1 leading-6 flex-1">
                ✔️ Tôi cam kết tuân thủ các nguyên tắc minh bạch, khách quan và phục vụ cộng đồng của DonaTrust.
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-[163px] h-[38px] bg-button-4 rounded-[5px]"
              >
                <span className="text-xs font-bold font-inter text-button-1 leading-[15px]">
                  Gửi đăng ký
                </span>
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-global-10 flex items-center justify-center z-50">
          <div className="w-[679px] h-[185px] bg-global-3 border-2 border-global-1 rounded-[10px] flex flex-col items-center justify-center p-8">
            <p className="text-xl font-inter text-global-1 text-center mb-8 max-w-[628px]">
              Cảm ơn bạn đã đăng ký. Ban quản trị DonaTrust sẽ xem xét và phản hồi qua email và trung tâm thông báo.
            </p>
            <Button
              onClick={handleBackToHome}
              variant="primary"
              className="w-[235px] h-[43px] bg-button-4 rounded-[5px]"
            >
              <span className="text-xs font-bold font-inter text-button-1 leading-[15px]">
                Quay về trang chủ
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaoRegistration;
