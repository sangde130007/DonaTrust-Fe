import api from './api';

class AdminService {
  // Get all users (admin only)
  async getAllUsers(filters = {}) {
    try {
      console.log('📤 Fetching all users with filters:', filters);

      const params = new URLSearchParams();

      // Add pagination parameters
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      // Add filter parameters
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = queryString ? `/admin/users?${queryString}` : '/admin/users';

      const response = await api.get(url);
      console.log('✅ Users fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw this.handleError(error);
    }
  }

  // Get user by ID (admin only)
  async getUserById(userId) {
    try {
      console.log('📤 Fetching user by ID:', userId);
      const response = await api.get(`/admin/users/${userId}`);
      console.log('✅ User fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      throw this.handleError(error);
    }
  }

  // Update user status (admin only)
  async updateUserStatus(userId, status) {
    try {
      console.log('📤 Updating user status:', { userId, status });
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      console.log('✅ User status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      throw this.handleError(error);
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    try {
      console.log('📤 Updating user role:', { userId, role });
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      console.log('✅ User role updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user role:', error);
      throw this.handleError(error);
    }
  }

  // Approve DAO member (admin only) - UPDATED FUNCTION
  async approveDaoMember(userId) {
    try {
      console.log('📤 Approving DAO member:', userId);
      // Using the correct endpoint format from the API documentation
      const response = await api.put(`/admin/users/${userId}/approve-dao`);
      console.log('✅ DAO member approved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to approve DAO member:', error);
      throw this.handleError(error);
    }
  }

  // Reject DAO member (admin only) - NEW FUNCTION
  async rejectDaoMember(userId, rejectionReason = '') {
    try {
      console.log('📤 Rejecting DAO member:', { userId, rejectionReason });
      const requestBody = { rejection_reason: rejectionReason || 'Không đủ điều kiện' };
      const response = await api.put(`/admin/users/${userId}/reject-dao`, requestBody);
      console.log('✅ DAO member rejected successfully with reason:', rejectionReason);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to reject DAO member:', error);
      throw this.handleError(error);
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      console.log('📤 Deleting user:', userId);
      const response = await api.delete(`/admin/users/${userId}`);
      console.log('✅ User deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw this.handleError(error);
    }
  }

  // Ban/Unban user (admin only)
  async banUser(userId, reason = '') {
    try {
      console.log('📤 Banning user:', { userId, reason });
      const requestBody = { reason: reason || 'Vi phạm quy định' };
      const response = await api.put(`/admin/users/${userId}/ban`, requestBody);
      console.log('✅ User banned successfully with reason:', reason);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to ban user:', error);
      throw this.handleError(error);
    }
  }

  async unbanUser(userId) {
    try {
      console.log('📤 Unbanning user:', userId);
      const response = await api.put(`/admin/users/${userId}/unban`);
      console.log('✅ User unbanned successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to unban user:', error);
      throw this.handleError(error);
    }
  }

  // Get admin statistics
  async getAdminStats() {
    try {
      console.log('📤 Fetching admin statistics...');
      const response = await api.get('/admin/stats');
      console.log('✅ Admin stats fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch admin stats:', error);
      throw this.handleError(error);
    }
  }

  // Utility function to format user data for display
  formatUserData(user) {
    return {
      ...user,
      displayName: user.full_name || 'N/A',
      displayEmail: user.email || 'N/A',
      displayPhone: user.phone || 'N/A',
      displayRole: this.formatRole(user.role),
      displayStatus: this.formatStatus(user.status),
      displayAddress: this.formatAddress(user),
      joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
      lastUpdate: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A',
    };
  }

  // Format role for display
  formatRole(role) {
    const roleMap = {
      donor: 'Donor',
      charity: 'Charity Organization',
      admin: 'Administrator',
      dao_member: 'DAO Member',
    };
    return roleMap[role] || role;
  }

  // Format status for display
  formatStatus(status) {
    const statusMap = {
      active: 'Active',
      inactive: 'Inactive',
      banned: 'Banned',
      pending_dao_approval: 'Pending DAO Approval',
    };
    return statusMap[status] || status;
  }

  // Format address for display
  formatAddress(user) {
    const parts = [];
    if (user.address) parts.push(user.address);
    if (user.ward) parts.push(user.ward);
    if (user.district) parts.push(user.district);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }

  // Get status color class for UI
  getStatusColor(status) {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'banned':
        return 'text-red-600 bg-red-100';
      case 'pending_dao_approval':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Get role color class for UI
  getRoleColor(role) {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-100';
      case 'charity':
        return 'text-blue-600 bg-blue-100';
      case 'donor':
        return 'text-green-600 bg-green-100';
      case 'dao_member':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Check if user needs DAO approval - HELPER FUNCTION
  needsDaoApproval(user) {
    return (
      user.status === 'pending_dao_approval' ||
      (user.role === 'dao_member' && user.status === 'inactive')
    );
  }

  // Check if user can be approved for DAO - NEW HELPER FUNCTION
  canApproveDaoMember(user) {
    return this.needsDaoApproval(user) && user.role === 'dao_member';
  }

  // Check if user can be rejected for DAO - NEW HELPER FUNCTION
  canRejectDaoMember(user) {
    return this.needsDaoApproval(user) && user.role === 'dao_member';
  }

  // Get predefined rejection reasons for DAO - NEW HELPER FUNCTION
  getDaoRejectionReasons() {
    return [
      'Không đủ điều kiện',
      'Thiếu tài liệu xác thực',
      'Không tuân thủ quy định DAO',
      'Thông tin cá nhân không chính xác',
      'Không đáp ứng yêu cầu tối thiểu',
      'Vi phạm chính sách cộng đồng'
    ];
  }

  // Validate filters
  validateFilters(filters) {
    const validRoles = ['donor', 'charity', 'admin', 'dao_member'];
    const validStatuses = ['active', 'inactive', 'banned', 'pending_dao_approval'];

    if (filters.role && !validRoles.includes(filters.role)) {
      console.warn('⚠️ Invalid role filter:', filters.role);
      delete filters.role;
    }

    if (filters.status && !validStatuses.includes(filters.status)) {
      console.warn('⚠️ Invalid status filter:', filters.status);
      delete filters.status;
    }

    if (filters.page && (isNaN(filters.page) || filters.page < 1)) {
      console.warn('⚠️ Invalid page number:', filters.page);
      filters.page = 1;
    }

    if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 100)) {
      console.warn('⚠️ Invalid limit:', filters.limit);
      filters.limit = 10;
    }

    return filters;
  }

  // Handle API errors (inherited from UserService pattern)
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      let message = data.message || 'An error occurred';

      if (status === 401) {
        message = 'Authentication required. Please login again.';
      } else if (status === 403) {
        message = 'Access denied. Admin privileges required.';
      } else if (status === 404) {
        message = 'User not found.';
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
      return {
        status: 0,
        message: 'Network error. Please check your internet connection and try again.',
        errors: [],
      };
    } else {
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        errors: [],
      };
    }
  }
}

export default new AdminService();