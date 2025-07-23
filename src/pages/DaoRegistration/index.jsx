import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';
import daoService from '../../services/daoService';

const DaoRegistration = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hasInterest = Object.values(formData.areasOfInterest).some((val) => val);
      if (!formData.fullName || !formData.email || !formData.introduction || !formData.experience) {
        alert('Please fill in all required fields.');
        return;
      }

      if (!hasInterest) {
        alert('Please select at least one area of interest.');
        return;
      }

      if (!formData.certificateFile) {
        alert('Please upload at least one certificate or proof of volunteering.');
        return;
      }

      if (!formData.commitment) {
        alert('Please confirm your commitment to DonaTrust principles.');
        return;
      }

      await daoService.registerDao(formData);
      setShowSuccessModal(true);
    } catch (error) {
      alert('Failed to register DAO member.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-global-3">
      {/* Hero Background */}
      <div
        className="w-full h-[349px] bg-cover bg-center relative"
        style={{ backgroundImage: `url('/images/img_.png')` }}
      >
        <div className="absolute top-[316px] right-[40px]">
          <img
            src="/images/img_24_user_interface_image.svg"
            alt="Image Icon"
            className="w-6 h-6 rounded-[5px]"
          />
        </div>
      </div>

      {/* Main Form */}
      <main className="flex flex-1 justify-center px-4 py-20 bg-global-1">
        <div className="w-full max-w-[714px] bg-global-3 rounded-[20px] shadow-lg px-6 py-10">
          <div className="mb-12 text-center">
            <h1 className="text-[32px] font-bold font-manrope text-global-1 leading-[44px] mb-6">
              BECOME A DAO MEMBER - DONATRUST
            </h1>
            <p className="text-base font-light leading-6 font-manrope text-global-1">
              Join the DAO community to monitor, vote and build a more transparent DonaTrust.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name Input */}
            <div>
              <label className="block mb-2 text-lg font-bold text-global-1">
                Full name: <span className="text-global-21">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-[46px] px-4 border rounded bg-white text-global-1"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block mb-2 text-lg font-bold text-global-1">
                Email: <span className="text-global-21">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full h-[46px] px-4 border rounded bg-white text-global-1"
              />
            </div>

            {/* Introduction */}
            <div>
              <label className="block mb-2 text-lg font-bold text-global-1">
                Introduce yourself: <span className="text-global-21">*</span>
              </label>
              <EditText
                value={formData.introduction}
                onChange={(value) => handleInputChange('introduction', value)}
                placeholder="Why do you want to join the DAO? What do you care about most?..."
                multiline
                rows={4}
                className="w-full"
              />
            </div>

            {/* Areas of Interest */}
            <div>
              <label className="block mb-2 text-lg font-bold text-global-1">
                Areas of interest: <span className="text-global-21">*</span>
              </label>
              <div className="flex flex-wrap gap-y-5 gap-x-6 mb-2">
                <CheckBox
                  checked={formData.areasOfInterest.education}
                  onChange={(c) => handleInterestChange('education', c)}
                  label="🎓 Education"
                />
                <CheckBox
                  checked={formData.areasOfInterest.medical}
                  onChange={(c) => handleInterestChange('medical', c)}
                  label="⛑️ Medical"
                />
                <CheckBox
                  checked={formData.areasOfInterest.children}
                  onChange={(c) => handleInterestChange('children', c)}
                  label="👶 Children"
                />
                <CheckBox
                  checked={formData.areasOfInterest.environment}
                  onChange={(c) => handleInterestChange('environment', c)}
                  label="🌿 Environment"
                />
                <CheckBox
                  checked={formData.areasOfInterest.naturalDisaster}
                  onChange={(c) => handleInterestChange('naturalDisaster', c)}
                  label="⛈️ Natural disaster"
                />
                <CheckBox
                  checked={formData.areasOfInterest.disability}
                  onChange={(c) => handleInterestChange('disability', c)}
                  label="🧑‍🦽 Disability"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block mb-2 text-lg font-bold text-global-1">
                Experience / understanding of charity: <span className="text-global-21">*</span>
              </label>
              <EditText
                value={formData.experience}
                onChange={(value) => handleInputChange('experience', value)}
                placeholder="Could be past contributions, DAO community knowledge"
                multiline
                rows={4}
                className="w-full"
              />
            </div>

            {/* Certificate Upload */}
            <div>
              <label className="block mb-2 text-lg font-bold text-global-1">
                Certificate, activity photos, proof of volunteering:{' '}
                <span className="text-global-21">*</span>
              </label>
              <input
                type="file"
                onChange={(e) => handleInputChange('certificateFile', e.target.files[0])}
                className="w-full h-[41px] px-4 py-2 border rounded text-sm bg-white text-global-1"
              />
              {formData.certificateFile && (
                <p className="mt-2 text-sm text-global-1">
                  Selected: {formData.certificateFile.name}
                </p>
              )}
            </div>

            {/* Commitment */}
            <div className="flex gap-4 items-start">
              <CheckBox
                checked={formData.commitment}
                onChange={(c) => handleInputChange('commitment', c)}
                className="mt-1"
              />
              <span className="flex-1 text-base leading-6 text-global-1">
                ✔️ I am committed to DonaTrust's principles of transparency, objectivity, and
                community service.
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-[163px] h-[38px] bg-button-4 rounded-[5px]"
                disabled={loading}
              >
                <span className="text-xs font-bold font-inter text-button-1 leading-[15px]">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-global-10">
          <div className="w-[679px] h-[185px] bg-global-3 border-2 border-global-1 rounded-[10px] flex flex-col items-center justify-center p-8">
            <p className="text-xl font-inter text-global-1 text-center mb-8 max-w-[628px]">
              Thank you for registering. DonaTrust administrators will review and respond to you via
              email and notification center.
            </p>
            <Button
              onClick={handleBackToHome}
              variant="primary"
              className="w-[235px] h-[43px] bg-button-4 rounded-[5px]"
            >
              <span className="text-xs font-bold font-inter text-button-1 leading-[15px]">
                Back to home page
              </span>
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DaoRegistration;
