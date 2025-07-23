import { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

const Users = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filters and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    status: '',
    search: '',
  });

  const [pagination, setPagination] = useState({});

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRejectDaoModal, setShowRejectDaoModal] = useState(false); // NEW: DAO rejection modal
  const [banReason, setBanReason] = useState('');
  const [rejectReason, setRejectReason] = useState(''); // NEW: DAO rejection reason
  const [confirmAction, setConfirmAction] = useState(null);

  // Load users on component mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [filters.page, filters.limit, filters.role, filters.status]);

  // Load users function
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const validatedFilters = AdminService.validateFilters({ ...filters });
      const response = await AdminService.getAllUsers(validatedFilters);

      setUsers(response.users || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadUsers();
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle user actions
  const handleUserAction = async (action, user, additionalData = {}) => {
    try {
      setLoading(true);
      let result;

      switch (action) {
        case 'updateStatus':
          result = await AdminService.updateUserStatus(user.user_id, additionalData.status);
          break;
        case 'updateRole':
          result = await AdminService.updateUserRole(user.user_id, additionalData.role);
          break;
        case 'approveDaoMember':
          result = await AdminService.approveDaoMember(user.user_id);
          break;
        case 'rejectDaoMember': // NEW: Handle DAO rejection
          result = await AdminService.rejectDaoMember(user.user_id, additionalData.reason);
          break;
        case 'ban':
          result = await AdminService.banUser(user.user_id, additionalData.reason);
          break;
        case 'unban':
          result = await AdminService.unbanUser(user.user_id);
          break;
        case 'delete':
          result = await AdminService.deleteUser(user.user_id);
          break;
        default:
          throw new Error('Invalid action');
      }

      // Reload users after successful action
      await loadUsers();
      setShowConfirmModal(false);
      setShowBanModal(false);
      setShowRejectDaoModal(false); // NEW: Close DAO rejection modal
      setBanReason('');
      setRejectReason(''); // NEW: Reset DAO rejection reason
      setConfirmAction(null);
    } catch (err) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  // Handle ban user
  const handleBanUser = async () => {
    if (!banReason.trim()) {
      setError('Please provide a reason for banning this user');
      return;
    }

    try {
      await handleUserAction('ban', selectedUser, { reason: banReason });
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Failed to ban user');
    }
  };

  // NEW: Handle DAO rejection
  const handleRejectDaoMember = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejecting this DAO member');
      return;
    }

    try {
      await handleUserAction('rejectDaoMember', selectedUser, { reason: rejectReason });
      setShowRejectDaoModal(false);
      setRejectReason('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Failed to reject DAO member');
    }
  };

  // Show ban modal
  const showBanConfirmation = (user) => {
    setSelectedUser(user);
    setBanReason('Vi phạm quy định');
    setShowBanModal(true);
  };

  // NEW: Show DAO rejection modal
  const showRejectDaoConfirmation = (user) => {
    setSelectedUser(user);
    setRejectReason(AdminService.getDaoRejectionReasons()[0]); // Set default reason
    setShowRejectDaoModal(true);
  };

  // Show confirmation modal
  const showConfirmation = (action, user, message) => {
    setConfirmAction({ action, user, message });
    setShowConfirmModal(true);
  };

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/img_avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  // Render action buttons for each user
  const renderActionButtons = (user) => {
    const actions = [];

    // View button (always available)
    actions.push(
      <button
        key="view"
        onClick={() => {
          setSelectedUser(user);
          setShowUserModal(true);
        }}
        className="text-blue-600 hover:text-blue-900"
      >
        View
      </button>
    );

    // DAO Approval and Rejection buttons (NEW: Enhanced logic)
    if (AdminService.needsDaoApproval(user)) {
      actions.push(
        <button
          key="approve-dao"
          onClick={() =>
            showConfirmation(
              'approveDaoMember',
              user,
              'Are you sure you want to approve this DAO member? This will change their status to active.'
            )
          }
          className="font-medium text-green-600 hover:text-green-900"
        >
          Approve DAO
        </button>
      );

      // NEW: Reject DAO button
      actions.push(
        <button
          key="reject-dao"
          onClick={() => showRejectDaoConfirmation(user)}
          className="font-medium text-orange-600 hover:text-orange-900"
        >
          Reject DAO
        </button>
      );
    }

    // Ban/Unban button
    if (user.status === 'banned') {
      actions.push(
        <button
          key="unban"
          onClick={() =>
            showConfirmation('unban', user, 'Are you sure you want to unban this user?')
          }
          className="text-green-600 hover:text-green-900"
        >
          Unban
        </button>
      );
    } else if (!AdminService.needsDaoApproval(user)) { // Don't show ban button for pending DAO users
      actions.push(
        <button
          key="ban"
          onClick={() => showBanConfirmation(user)}
          className="text-red-600 hover:text-red-900"
        >
          Ban
        </button>
      );
    }

    // Delete button
    actions.push(
      <button
        key="delete"
        onClick={() =>
          showConfirmation(
            'delete',
            user,
            'Are you sure you want to delete this user? This action cannot be undone.'
          )
        }
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>
    );

    return <div className="flex flex-wrap gap-1 space-x-2">{actions}</div>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage all users in the system</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 rounded border border-red-400">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="donor">Donor</option>
              <option value="charity">Charity</option>
              <option value="admin">Admin</option>
              <option value="dao_member">DAO Member</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
              <option value="pending_dao_approval">Pending DAO Approval</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Per Page</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 w-full text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const formattedUser = AdminService.formatUserData(user);
                return (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(user.profile_image)}
                          alt={user.full_name || 'User'}
                          className="object-cover w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.target.src = '/images/img_avatar.png';
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formattedUser.displayName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formattedUser.displayEmail}</div>
                      <div className="text-sm text-gray-500">{formattedUser.displayPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role !== 'admin' ? (
                        <select
                          value={user.role}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            if (newRole !== user.role) {
                              setLoading(true);
                              try {
                                await handleUserAction('updateRole', user, { role: newRole });
                              } catch (err) {
                                setError(err.message || 'Failed to update role');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          disabled={loading}
                        >
                          <option value="donor">Donor</option>
                          <option value="charity">Charity</option>
                          <option value="dao_member">DAO Member</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${AdminService.getRoleColor(user.role)}`}
                        >
                          {formattedUser.displayRole}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${AdminService.getStatusColor(user.status)}`}
                      >
                        {formattedUser.displayStatus}
                        {AdminService.needsDaoApproval(user) && (
                          <span className="ml-1 text-xs">⏳</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formattedUser.joinDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      {renderActionButtons(user)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md">
              {filters.page}
            </span>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= (pagination.totalPages || 1)}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-gray-600 bg-opacity-50">
          <div className="relative top-20 p-5 mx-auto w-11/12 bg-white rounded-md border shadow-lg md:w-3/4 lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={getImageUrl(selectedUser.profile_image)}
                  alt={selectedUser.full_name || 'User'}
                  className="object-cover w-20 h-20 rounded-full"
                />
                <div>
                  <h4 className="text-xl font-semibold">{selectedUser.full_name || 'N/A'}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  {AdminService.needsDaoApproval(selectedUser) && (
                    <p className="font-medium text-orange-600">⏳ Pending DAO Approval</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Phone:</strong> {selectedUser.phone || 'N/A'}
                </div>
                <div>
                  <strong>Role:</strong> {AdminService.formatRole(selectedUser.role)}
                </div>
                <div>
                  <strong>Status:</strong> {AdminService.formatStatus(selectedUser.status)}
                </div>
                <div>
                  <strong>Gender:</strong> {selectedUser.gender || 'N/A'}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {selectedUser.date_of_birth || 'N/A'}
                </div>
                <div>
                  <strong>Email Verified:</strong> {selectedUser.email_verified ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Phone Verified:</strong> {selectedUser.phone_verified ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}
                </div>
              </div>
              {selectedUser.bio && (
                <div>
                  <strong>Bio:</strong>
                  <p className="mt-1 text-gray-700">{selectedUser.bio}</p>
                </div>
              )}
              <div>
                <strong>Address:</strong>
                <p className="mt-1 text-gray-700">
                  {AdminService.formatUserData(selectedUser).displayAddress}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              {AdminService.needsDaoApproval(selectedUser) && (
                <>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      showConfirmation(
                        'approveDaoMember',
                        selectedUser,
                        'Are you sure you want to approve this DAO member? This will change their status to active.'
                      );
                    }}
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Approve DAO Member
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      showRejectDaoConfirmation(selectedUser);
                    }}
                    className="px-4 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700"
                  >
                    Reject DAO Member
                  </button>
                </>
              )}
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-gray-600 bg-opacity-50">
          <div className="relative top-20 p-5 mx-auto w-11/12 bg-white rounded-md border shadow-lg md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ban User</h3>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setSelectedUser(null);
                }}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center p-3 space-x-3 bg-gray-50 rounded-lg">
                <img
                  src={getImageUrl(selectedUser.profile_image)}
                  alt={selectedUser.full_name || 'User'}
                  className="object-cover w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedUser.full_name || 'N/A'}</h4>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Ban Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setBanReason('Vi phạm quy định cộng đồng')}
                  className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  Vi phạm quy định cộng đồng
                </button>
                <button
                  type="button"
                  onClick={() => setBanReason('Spam hoặc nội dung không phù hợp')}
                  className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  Spam hoặc nội dung không phù hợp
                </button>
                <button
                  type="button"
                  onClick={() => setBanReason('Hành vi lừa đảo')}
                  className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  Hành vi lừa đảo
                </button>
                <button
                  type="button"
                  onClick={() => setBanReason('Vi phạm chính sách bảo mật')}
                  className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  Vi phạm chính sách bảo mật
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason.trim() || loading}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Reject DAO Member Modal */}
      {showRejectDaoModal && selectedUser && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-gray-600 bg-opacity-50">
          <div className="relative top-20 p-5 mx-auto w-11/12 bg-white rounded-md border shadow-lg md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Reject DAO Member</h3>
              <button
                onClick={() => {
                  setShowRejectDaoModal(false);
                  setRejectReason('');
                  setSelectedUser(null);
                }}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center p-3 space-x-3 bg-gray-50 rounded-lg">
                <img
                  src={getImageUrl(selectedUser.profile_image)}
                  alt={selectedUser.full_name || 'User'}
                  className="object-cover w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedUser.full_name || 'N/A'}</h4>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-orange-600">DAO Member Application</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejecting this DAO member..."
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="4"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {AdminService.getDaoRejectionReasons().map((reason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectDaoModal(false);
                  setRejectReason('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDaoMember}
                disabled={!rejectReason.trim() || loading}
                className="px-4 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Rejecting...' : 'Reject DAO Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-gray-600 bg-opacity-50">
          <div className="relative top-20 p-5 mx-auto w-96 bg-white rounded-md border shadow-lg">
            <div className="mt-3 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full">
                {confirmAction.action === 'approveDaoMember' ? (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                ) : confirmAction.action === 'delete' ? (
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {confirmAction.action === 'approveDaoMember'
                  ? 'Approve DAO Member'
                  : 'Confirm Action'}
              </h3>
              <div className="px-7 py-3 mt-2">
                <p className="text-sm text-gray-500">{confirmAction.message}</p>
              </div>
              <div className="flex justify-center mt-4 space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUserAction(confirmAction.action, confirmAction.user)}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction.action === 'approveDaoMember'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : confirmAction.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    }`}
                >
                  {loading
                    ? 'Processing...'
                    : confirmAction.action === 'approveDaoMember'
                      ? 'Approve'
                      : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;