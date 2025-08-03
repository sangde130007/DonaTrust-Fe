import React, { useState, useEffect } from 'react';
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
    agreeTerms: false,
  });

  const [files, setFiles] = useState({
    license: null,
    description: null,
    logo: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleCheckboxChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
    // Clear error when user checks
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    setFiles((prev) => ({
      ...prev,
      [field]: file,
    }));
    // Clear error when user selects file
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.organizationName.trim())
      newErrors.organizationName = 'Organization name is required';
    if (!formData.organizationEmail.trim())
      newErrors.organizationEmail = 'Organization email is required';
    if (!formData.organizationPhone.trim())
      newErrors.organizationPhone = 'Organization phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.purposeOfRegistration.trim())
      newErrors.purposeOfRegistration = 'Purpose of registration is required';

    // File validation
    if (!files.license) newErrors.license = 'License document is required';
    if (!files.description) newErrors.description = 'Organization description is required';

    // Checkbox validation
    if (!formData.confirmAccurate)
      newErrors.confirmAccurate = 'Please confirm information accuracy';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Please agree to terms and conditions';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.organizationEmail && !/\S+@\S+\.\S+/.test(formData.organizationEmail)) {
      newErrors.organizationEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      alert('You must be logged in to register as a charity. Please sign in first.');
      window.location.href = '/signin';
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare form data for API
      const charityData = {
        representativeInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        },
        organizationInfo: {
          name: formData.organizationName,
          website: formData.website || null,
          email: formData.organizationEmail,
          phoneNumber: formData.organizationPhone,
          address: formData.address,
        },
        purposeOfRegistration: formData.purposeOfRegistration,
        documents: {
          license: files.license?.name,
          description: files.description?.name,
          logo: files.logo?.name,
        },
      };

      await charityService.registerCharity(charityData);

      alert(
        'Charity registration submitted successfully! We will review your application and get back to you soon.'
      );

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

      setFiles({
        license: null,
        description: null,
        logo: null,
      });
    } catch (error) {
      // Handle specific error cases
      if (error.status === 422) {
        // Handle validation errors
        const validationErrors = {};
        if (error.errors) {
          error.errors.forEach((err) => {
            validationErrors[err.field] = err.message;
          });
        }
        setErrors(validationErrors);
      } else if (error.status === 409) {
        setErrors({
          general: 'A charity registration already exists for this user or organization.',
        });
      } else {
        setErrors({
          general: error.message || 'Registration failed. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Representative Info', icon: '👤' },
    { id: 2, title: 'Organization Details', icon: '🏢' },
    { id: 3, title: 'Documents & Purpose', icon: '📄' },
    { id: 4, title: 'Review & Submit', icon: '✅' },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>
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
              {files[field] ? files[field].name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </label>
      </div>
      {errors[field] && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{errors[field]}</span>
        </p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Representative Information</h2>
        <p className="text-gray-600">Tell us about yourself as the organization representative</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
          <EditText
            value={formData.fullName}
            onChange={handleInputChange('fullName')}
            placeholder="Enter your full name"
            required
            error={errors.fullName}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
          <EditText
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Enter your email address"
            required
            error={errors.email}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
          <EditText
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            placeholder="Enter your phone number"
            required
            error={errors.phoneNumber}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role *</label>
          <select
            value={formData.role}
            onChange={handleInputChange('role')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Select your role</option>
            <option value="Founder">Founder</option>
            <option value="Director">Director</option>
            <option value="Manager">Manager</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Representative">Representative</option>
            <option value="Other">Other</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Organization Details</h2>
        <p className="text-gray-600">Provide information about your charity organization</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Organization Name *
          </label>
          <EditText
            value={formData.organizationName}
            onChange={handleInputChange('organizationName')}
            placeholder="Enter organization name"
            required
            error={errors.organizationName}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Website (Optional)
          </label>
          <EditText
            type="url"
            value={formData.website}
            onChange={handleInputChange('website')}
            placeholder="https://your-organization.com"
            error={errors.website}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Email *
            </label>
            <EditText
              type="email"
              value={formData.organizationEmail}
              onChange={handleInputChange('organizationEmail')}
              placeholder="contact@organization.com"
              required
              error={errors.organizationEmail}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Phone *
            </label>
            <EditText
              type="tel"
              value={formData.organizationPhone}
              onChange={handleInputChange('organizationPhone')}
              placeholder="Organization phone number"
              required
              error={errors.organizationPhone}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Organization Address *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Enter complete organization address"
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
          />
          {errors.address && (
            <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Documents & Purpose</h2>
        <p className="text-gray-600">Upload required documents and describe your purpose</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          📋 Required Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderFileUpload(
              'license',
              'License / Certification *',
              '.pdf,.doc,.docx,.jpg,.jpeg,.png',
              'PDF, DOC, DOCX, JPG, PNG (Max 5MB)'
            )}
          </div>

          <div>
            {renderFileUpload(
              'description',
              'Organization Description *',
              '.pdf,.doc,.docx',
              'PDF, DOC, DOCX (Max 5MB)'
            )}
          </div>
        </div>

        <div className="md:w-1/2">
          {renderFileUpload(
            'logo',
            'Organization Logo (Optional)',
            '.jpg,.jpeg,.png,.svg',
            'JPG, PNG, SVG (Max 2MB)'
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            🎯 Purpose of Registration
          </h3>
          <textarea
            value={formData.purposeOfRegistration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, purposeOfRegistration: e.target.value }))
            }
            placeholder="Please describe your purpose for registering with DonaTrust and how you plan to use the platform to help your community..."
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
          />
          {errors.purposeOfRegistration && (
            <p className="text-sm text-red-500 flex items-center space-x-1">
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information and confirm submission</p>
      </div>

      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Application Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Representative:</strong> {formData.fullName}
          </div>
          <div>
            <strong>Email:</strong> {formData.email}
          </div>
          <div>
            <strong>Organization:</strong> {formData.organizationName}
          </div>
          <div>
            <strong>Role:</strong> {formData.role}
          </div>
        </div>

        <div className="mt-4">
          <strong>Documents uploaded:</strong>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>License: {files.license?.name || 'Not uploaded'}</li>
            <li>Description: {files.description?.name || 'Not uploaded'}</li>
            <li>Logo: {files.logo?.name || 'Not uploaded'}</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Checkboxes */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Confirmation</h3>

        <div className="space-y-3">
          <CheckBox
            checked={formData.confirmAccurate}
            onChange={handleCheckboxChange('confirmAccurate')}
            label="I confirm that all information provided is accurate and complete"
            error={errors.confirmAccurate}
          />

          <CheckBox
            checked={formData.agreeTerms}
            onChange={handleCheckboxChange('agreeTerms')}
            label="I agree to the terms and conditions and privacy policy"
            error={errors.agreeTerms}
          />
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errors.general}</span>
          </p>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phoneNumber && formData.role;
      case 2:
        return (
          formData.organizationName &&
          formData.organizationEmail &&
          formData.organizationPhone &&
          formData.address
        );
      case 3:
        return files.license && files.description && formData.purposeOfRegistration;
      case 4:
        return formData.confirmAccurate && formData.agreeTerms;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join DonaTrust as a Charity</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Connect with donors and make a real impact in your community
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="flex space-x-4">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={!canProceedToNext()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !canProceedToNext()}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      '🚀 Submit Application'
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
