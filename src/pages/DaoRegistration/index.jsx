import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import EditText from '../../components/ui/EditText';
import CheckBox from '../../components/ui/CheckBox';
import DatePicker from '../../components/ui/DatePicker';

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
      disability: false
    },
    certificateFile: null,
    commitment: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestChange = (interest, checked) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: {
        ...prev.areasOfInterest,
        [interest]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.introduction || !formData.experience) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Check if at least one area of interest is selected
    const hasInterest = Object.values(formData.areasOfInterest).some(value => value);
    if (!hasInterest) {
      alert('Please select at least one area of interest.');
      return;
    }
    
    if (!formData.commitment) {
      alert('Please confirm your commitment to DonaTrust principles.');
      return;
    }
    
    console.log('DAO Registration submitted:', formData);
    setShowSuccessModal(true);
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-global-3 flex flex-col">
      <Header />
      
      {/* Hero Background Image */}
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
      
      {/* Main Content */}
      <div className="flex-1 bg-global-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[714px] bg-global-3 rounded-[20px] shadow-lg p-[62px] relative z-10">
            <div className="text-center mb-[51px]">
              <h1 className="text-[32px] font-bold font-manrope text-global-1 leading-[44px] mb-[51px]">
                BECOME A DAO MEMBER - DONATRUST
              </h1>
              <p className="text-base font-light font-manrope text-global-1 leading-6">
                Join the DAO community to monitor, vote and build a more transparent DonaTrust.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-[32px]">
              {/* Full Name */}
              <div>
                <label className="block text-lg font-bold font-manrope text-global-1 leading-[25px] mb-[32px]">
                  Full name: <span className="text-global-21">*</span>
                </label>
                <div className="w-[617px] h-[46px] bg-global-7 rounded-[10px] flex items-center px-[26px]">
                  <span className="text-base font-manrope text-global-1 leading-[22px]">
                    {formData.fullName}
                  </span>
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-lg font-bold font-manrope text-global-1 leading-[25px] mb-[32px]">
                  Email: <span className="text-global-21">*</span>
                </label>
                <div className="w-[617px] h-[46px] bg-global-7 rounded-[10px] flex items-center px-[26px]">
                  <span className="text-base font-manrope text-global-1 leading-[22px]">
                    {formData.email}
                  </span>
                </div>
              </div>
              
              {/* Introduction */}
              <div>
                <label className="block text-lg font-bold font-manrope text-global-1 leading-[25px] mb-[30px]">
                  Introduce yourself: <span className="text-global-21">*</span>
                </label>
                <EditText
                  value={formData.introduction}
                  onChange={(e) => handleInputChange('introduction', e.target.value)}
                  placeholder="Why do you want to join the DAO? What do you care about most?..."
                  multiline
                  rows={4}
                  className="w-[617px] h-[87px]"
                />
              </div>
              
              {/* Areas of Interest */}
              <div>
                <label className="block text-lg font-bold font-manrope text-global-1 leading-[25px] mb-[32px]">
                  Areas of interest: <span className="text-global-21">*</span>
                </label>
                
                {/* First Row */}
                <div className="flex space-x-[23px] mb-[36px]">
                  <CheckBox
                    checked={formData.areasOfInterest.education}
                    onChange={(checked) => handleInterestChange('education', checked)}
                    label="🎓 Education"
                    className="w-[118px]"
                  />
                  <CheckBox
                    checked={formData.areasOfInterest.medical}
                    onChange={(checked) => handleInterestChange('medical', checked)}
                    label="⛑️ Medical"
                    className="w-[100px]"
                  />
                  <CheckBox
                    checked={formData.areasOfInterest.children}
                    onChange={(checked) => handleInterestChange('children', checked)}
                    label="👶 Children"
                    className="w-[105px]"
                  />
                  <CheckBox
                    checked={formData.areasOfInterest.environment}
                    onChange={(checked) => handleInterestChange('environment', checked)}
                    label="🌿 Environment"
                    className="w-[136px]"
                  />
                </div>
                
                {/* Second Row */}
                <div className="flex space-x-[19px]">
                  <CheckBox
                    checked={formData.areasOfInterest.naturalDisaster}
                    onChange={(checked) => handleInterestChange('naturalDisaster', checked)}
                    label="⛈️ Natural disaster"
                    className="w-[160px]"
                  />
                  <CheckBox
                    checked={formData.areasOfInterest.disability}
                    onChange={(checked) => handleInterestChange('disability', checked)}
                    label="🧑‍🦽 Disability"
                    className="w-[110px]"
                  />
                </div>
              </div>
              
              {/* Experience */}
              <div>
                <label className="block text-lg font-bold font-manrope text-global-1 leading-[25px] mb-[30px]">
                  Experience / understanding of charity: <span className="text-global-21">*</span>
                </label>
                <EditText
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Could be past contributions, DAO community knowledge"
                  multiline
                  rows={4}
                  className="w-[617px] h-[87px]"
                />
              </div>
              
              {/* Certificate Upload */}
              <div>
                <label className="block text-lg font-bold font-manrope text-global-1 leading-[25px] mb-[30px]">
                  Certificate, activity photos, proof of volunteering: <span className="text-global-21">*</span>
                </label>
                <DatePicker className="w-[617px] h-[41px]" />
              </div>
              
              {/* Commitment Checkbox */}
              <div className="flex items-start space-x-[26px]">
                <CheckBox
                  checked={formData.commitment}
                  onChange={(checked) => handleInputChange('commitment', checked)}
                  className="mt-1"
                />
                <span className="text-base font-manrope text-global-1 leading-6 flex-1">
                  ✔️ I am committed to DonaTrust's principles of transparency, objectivity, and community service.
                </span>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center pt-[40px]">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-[163px] h-[38px] bg-button-4 rounded-[5px]"
                >
                  <span className="text-xs font-bold font-inter text-button-1 leading-[15px]">
                    Submit Request
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-global-10 flex items-center justify-center z-50">
          <div className="w-[679px] h-[185px] bg-global-3 border-2 border-global-1 rounded-[10px] flex flex-col items-center justify-center p-8">
            <p className="text-xl font-inter text-global-1 leading-[25px] text-center mb-8 max-w-[628px]">
              Thank you for registering. DonaTrust administrators will review and respond to you via email and notification center.
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
      
      <Footer />
    </div>
  );
};

export default DaoRegistration;