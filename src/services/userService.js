import api from './api';

class UserService {
  // Get user profile (authenticated)
  async getProfile() {
    try {
      console.log('📤 Fetching user profile...');
      const response = await api.get('/users/profile');
      console.log('✅ Profile fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      throw this.handleError(error);
    }
  }

  // Update user profile (authenticated) - profile_image is NOT included here
  async updateProfile(profileData) {
    try {
      console.log('📤 Updating user profile with data:', profileData);

      // Remove profile_image from profileData if it exists (should not be updated via this method)
      const { profile_image, ...allowedData } = profileData;

      if (profile_image) {
        console.warn('⚠️ profile_image field removed from update - use uploadAvatar() instead');
      }

      const response = await api.put('/users/profile', allowedData);
      console.log('✅ Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw this.handleError(error);
    }
  }

  // Upload avatar (authenticated) - This is the ONLY way to update profile image
  async uploadAvatar(avatarFile) {
    try {
      console.log('📤 Uploading avatar file:', {
        name: avatarFile.name,
        size: avatarFile.size,
        type: avatarFile.type,
      });

      // Validate file on frontend first
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.type)) {
        throw new Error('Invalid file type. Please select JPEG, PNG, GIF, or WebP image.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxSize) {
        throw new Error('File size too large. Please select an image smaller than 5MB.');
      }

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      console.log('📦 Sending FormData to /users/upload-avatar');

      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for file uploads
      });

      console.log('✅ Avatar upload successful:', response.data);
      console.log('✅ Avatar URL in response:', response.data.avatar_url);
      console.log('✅ User data in response:', response.data.user);

      // Ensure we have the avatar URL
      if (!response.data.avatar_url && !response.data.profile_image) {
        console.error('❌ No avatar URL in response!', response.data);
        throw new Error('Server did not return avatar URL');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);

      // Handle specific upload errors
      if (error.response?.status === 413) {
        throw new Error('File size too large. Please select a smaller image.');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file type. Please select a valid image file.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file.');
      }

      throw this.handleError(error);
    }
  }

  // Change password (authenticated)
  async changePassword(passwordData) {
    try {
      console.log('📤 Changing password...');
      const response = await api.put('/users/change-password', passwordData);
      console.log('✅ Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw this.handleError(error);
    }
  }

  // Deactivate account (authenticated)
  async deactivateAccount() {
    try {
      console.log('📤 Deactivating account...');
      const response = await api.put('/users/deactivate');
      console.log('✅ Account deactivated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to deactivate account:', error);
      throw this.handleError(error);
    }
  }

  // Get user statistics (authenticated)
  async getUserStats() {
    try {
      console.log('📤 Fetching user statistics...');
      const response = await api.get('/users/stats');
      console.log('✅ User stats fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user stats:', error);
      throw this.handleError(error);
    }
  }

  // Get user donations (authenticated)
  async getUserDonations(filters = {}) {
    try {
      console.log('📤 Fetching user donations with filters:', filters);
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);

      const queryString = params.toString();
      const url = queryString ? `/donations?${queryString}` : '/donations';

      const response = await api.get(url);
      console.log('✅ User donations fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user donations:', error);
      throw this.handleError(error);
    }
  }

  // Get user's supported campaigns (authenticated)
  async getSupportedCampaigns() {
    try {
      console.log('📤 Fetching supported campaigns...');
      const response = await api.get('/users/supported-campaigns');
      console.log('✅ Supported campaigns fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch supported campaigns:', error);
      throw this.handleError(error);
    }
  }

  // Validate if a string looks like an image URL (optional utility)
  validateImageUrl(url) {
    if (!url) return true; // Empty URL is valid

    try {
      new URL(url);

      // Check if URL looks like an image
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const urlLower = url.toLowerCase();
      const hasImageExtension = imageExtensions.some((ext) => urlLower.includes(ext));
      const hasImageDomain =
        urlLower.includes('imgur') ||
        urlLower.includes('cloudinary') ||
        urlLower.includes('amazonaws') ||
        urlLower.includes('googleusercontent');

      return hasImageExtension || hasImageDomain;
    } catch {
      return false;
    }
  }

  // Utility to get full image URL
  getImageUrl(imagePath) {
    if (!imagePath) return '/images/img_avatar.png';

    // If already full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Add base URL for relative paths
    const baseUrl = import.meta.env.VITE_ASSET_URL|| 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      // Handle specific error cases
      let message = data.message || 'An error occurred';

      if (status === 401) {
        message = 'Authentication required. Please login again.';
      } else if (status === 403) {
        message = 'Access denied. You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'Resource not found.';
      } else if (status === 413) {
        message = 'File too large. Please select a smaller image.';
      } else if (status === 415) {
        message = 'Unsupported file type. Please select a valid image file.';
      } else if (status === 422) {
        message = 'Validation failed. Please check your input.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }

      return {
        status,
        message,
        errors: data.errors || [],
        details: data.details || null,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'Network error. Please check your internet connection and try again.',
        errors: [],
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        errors: [],
      };
    }
  }
}

export default new UserService();
