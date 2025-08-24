import { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

const Users = () => {
  // State quản lý
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Bộ lọc & phân trang
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    status: '',
    search: '',
  });

  const [pagination, setPagination] = useState({});

  // Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRejectDaoModal, setShowRejectDaoModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Load users khi mount hoặc filter đổi
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.role, filters.status]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const validatedFilters = AdminService.validateFilters({ ...filters });
      const response = await AdminService.getAllUsers(validatedFilters);

      setUsers(response.users || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người dùng');
      console.error('Lỗi tải người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadUsers();
  };

  // Thay đổi bộ lọc
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // Phân trang
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Hành động người dùng
  const handleUserAction = async (action, user, additionalData = {}) => {
    try {
      setLoading(true);

      switch (action) {
        case 'updateStatus':
          await AdminService.updateUserStatus(user.user_id, additionalData.status);
          break;
        case 'updateRole':
          await AdminService.updateUserRole(user.user_id, additionalData.role);
          break;
        case 'approveDaoMember':
          await AdminService.approveDaoMember(user.user_id);
          break;
        case 'rejectDaoMember':
          await AdminService.rejectDaoMember(user.user_id, additionalData.reason);
          break;
        case 'ban':
          await AdminService.banUser(user.user_id, additionalData.reason);
          break;
        case 'unban':
          await AdminService.unbanUser(user.user_id);
          break;
        case 'delete':
          await AdminService.deleteUser(user.user_id);
          break;
        default:
          throw new Error('Hành động không hợp lệ');
      }

      // Tải lại danh sách
      await loadUsers();
      setShowConfirmModal(false);
      setShowBanModal(false);
      setShowRejectDaoModal(false);
      setBanReason('');
      setRejectReason('');
      setConfirmAction(null);
    } catch (err) {
      setError(err.message || `Không thể thực hiện hành động`);
    } finally {
      setLoading(false);
    }
  };

  // Cấm người dùng
  const handleBanUser = async () => {
    if (!banReason.trim()) {
      setError('Vui lòng nhập lý do cấm người dùng');
      return;
    }
    try {
      await handleUserAction('ban', selectedUser, { reason: banReason });
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Không thể cấm người dùng');
    }
  };

  // Từ chối DAO
  const handleRejectDaoMember = async () => {
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối DAO');
      return;
    }
    try {
      await handleUserAction('rejectDaoMember', selectedUser, { reason: rejectReason });
      setShowRejectDaoModal(false);
      setRejectReason('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || 'Không thể từ chối DAO');
    }
  };

  // Hiển thị xác nhận
  const showConfirmation = (action, user, message) => {
    setConfirmAction({ action, user, message });
    setShowConfirmModal(true);
  };

  // Ảnh đại diện
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/img_avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  // Nút hành động
  const renderActionButtons = (user) => {
    const actions = [];

    actions.push(
      <button
        key="view"
        onClick={() => {
          setSelectedUser(user);
          setShowUserModal(true);
        }}
        className="text-purple-600 hover:text-purple-800"
      >
        Xem
      </button>
    );

    if (AdminService.needsDaoApproval(user)) {
      actions.push(
        <button
          key="approve-dao"
          onClick={() =>
            showConfirmation(
              'approveDaoMember',
              user,
              'Bạn có chắc muốn phê duyệt thành viên DAO này?'
            )
          }
          className="font-medium text-green-600 hover:text-green-800"
        >
          Phê duyệt DAO
        </button>
      );

      actions.push(
        <button
          key="reject-dao"
          onClick={() => {
            setSelectedUser(user);
            setRejectReason(AdminService.getDaoRejectionReasons()?.[0] || '');
            setShowRejectDaoModal(true);
          }}
          className="font-medium text-orange-600 hover:text-orange-800"
        >
          Từ chối DAO
        </button>
      );
    }

    if (user.status === 'banned') {
      actions.push(
        <button
          key="unban"
          onClick={() => showConfirmation('unban', user, 'Gỡ cấm người dùng này?')}
          className="text-green-600 hover:text-green-800"
        >
          Gỡ cấm
        </button>
      );
    } else if (!AdminService.needsDaoApproval(user)) {
      actions.push(
        <button
          key="ban"
          onClick={() => {
            setSelectedUser(user);
            setBanReason('Vi phạm quy định cộng đồng');
            setShowBanModal(true);
          }}
          className="text-red-600 hover:text-red-800"
        >
          Cấm
        </button>
      );
    }



    return <div className="flex flex-wrap gap-2">{actions}</div>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-b-2 border-purple-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600">Quản trị tất cả tài khoản trong hệ thống</p>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="px-4 py-3 mb-6 text-purple-800 bg-purple-100 rounded border border-purple-300">
          <strong>Lỗi:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-purple-700 hover:text-purple-900"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      )}

      {/* Bộ lọc & tìm kiếm */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên hoặc email..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Vai trò</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Tất cả</option>
              <option value="donor">Người ủng hộ</option>
              <option value="charity">Tổ chức từ thiện</option>
              <option value="admin">Quản trị</option>
              <option value="dao_member">Thành viên DAO</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="banned">Đã cấm</option>
              <option value="pending_dao_approval">Chờ duyệt DAO</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Mỗi trang</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value, 10))}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="px-4 py-2 w-full text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </form>
      </div>

      {/* Bảng người dùng */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Thao tác
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
                            e.currentTarget.src = '/images/img_avatar.png';
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
                                setError(err.message || 'Không thể cập nhật vai trò');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                          disabled={loading}
                        >
                          <option value="donor">Người ủng hộ</option>
                          <option value="charity">Tổ chức từ thiện</option>
                          <option value="dao_member">Thành viên DAO</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${AdminService.getRoleColor(user.role)}`}>
                          {formattedUser.displayRole}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${AdminService.getStatusColor(user.status)}`}>
                        {formattedUser.displayStatus}
                        {AdminService.needsDaoApproval(user) && <span className="ml-1 text-xs">⏳</span>}
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
            <p className="text-gray-500">Không có người dùng phù hợp với tiêu chí.</p>
          </div>
        )}
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1} đến{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} trong{' '}
            {pagination.totalItems} người dùng
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-3 py-2 text-sm text-white bg-purple-600 rounded-md">
              {filters.page}
            </span>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= (pagination.totalPages || 1)}
              className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal chi tiết người dùng */}
      {showUserModal && selectedUser && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-black/40">
          <div className="relative top-20 p-5 mx-auto w-11/12 bg-white rounded-md border shadow-lg md:w-3/4 lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chi tiết người dùng</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
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
                    <p className="font-medium text-orange-600">⏳ Đang chờ duyệt thành viên DAO</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Điện thoại:</strong> {selectedUser.phone || 'N/A'}</div>
                <div><strong>Vai trò:</strong> {AdminService.formatRole(selectedUser.role)}</div>
                <div><strong>Trạng thái:</strong> {AdminService.formatStatus(selectedUser.status)}</div>
                <div><strong>Giới tính:</strong> {selectedUser.gender || 'N/A'}</div>
                <div><strong>Ngày sinh:</strong> {selectedUser.date_of_birth || 'N/A'}</div>
                <div><strong>Xác thực email:</strong> {selectedUser.email_verified ? 'Có' : 'Không'}</div>
                <div><strong>Xác thực SĐT:</strong> {selectedUser.phone_verified ? 'Có' : 'Không'}</div>
                <div><strong>Tham gia:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</div>
              </div>

              {selectedUser.bio && (
                <div>
                  <strong>Giới thiệu:</strong>
                  <p className="mt-1 text-gray-700">{selectedUser.bio}</p>
                </div>
              )}
              <div>
                <strong>Địa chỉ:</strong>
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
                        'Phê duyệt thành viên DAO này?'
                      );
                    }}
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Phê duyệt DAO
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setRejectReason(AdminService.getDaoRejectionReasons()?.[0] || '');
                      setShowRejectDaoModal(true);
                    }}
                    className="px-4 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700"
                  >
                    Từ chối DAO
                  </button>
                </>
              )}
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cấm người dùng */}
      {showBanModal && selectedUser && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-black/40">
          <div className="relative top-20 p-5 mx-auto w-11/12 bg-white rounded-md border shadow-lg md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cấm người dùng</h3>
              <button
                onClick={() => { setShowBanModal(false); setBanReason(''); setSelectedUser(null); }}
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
                Lý do cấm <span className="text-red-500">*</span>
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do cấm người dùng này..."
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button type="button" onClick={() => setBanReason('Vi phạm quy định cộng đồng')} className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200">Vi phạm quy định cộng đồng</button>
                <button type="button" onClick={() => setBanReason('Spam hoặc nội dung không phù hợp')} className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200">Spam hoặc nội dung không phù hợp</button>
                <button type="button" onClick={() => setBanReason('Hành vi lừa đảo')} className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200">Hành vi lừa đảo</button>
                <button type="button" onClick={() => setBanReason('Vi phạm chính sách bảo mật')} className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200">Vi phạm chính sách bảo mật</button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowBanModal(false); setBanReason(''); setSelectedUser(null); }}
                className="px-4 py-2 text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                disabled={loading}
              >
                Huỷ
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason.trim() || loading}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Cấm người dùng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối DAO */}
      {showRejectDaoModal && selectedUser && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-black/40">
          <div className="relative top-20 p-5 mx-auto w-11/12 bg-white rounded-md border shadow-lg md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Từ chối thành viên DAO</h3>
              <button
                onClick={() => { setShowRejectDaoModal(false); setRejectReason(''); setSelectedUser(null); }}
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
                  <p className="text-sm text-orange-600">Hồ sơ ứng tuyển DAO</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối thành viên DAO này..."
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {(AdminService.getDaoRejectionReasons() || []).map((reason, idx) => (
                  <button
                    key={idx}
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
                onClick={() => { setShowRejectDaoModal(false); setRejectReason(''); setSelectedUser(null); }}
                className="px-4 py-2 text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                disabled={loading}
              >
                Huỷ
              </button>
              <button
                onClick={handleRejectDaoMember}
                disabled={!rejectReason.trim() || loading}
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Từ chối DAO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận */}
      {showConfirmModal && confirmAction && (
        <div className="overflow-y-auto fixed inset-0 z-50 w-full h-full bg-black/40">
          <div className="relative top-20 p-5 mx-auto w-96 bg-white rounded-md border shadow-lg">
            <div className="mt-3 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-full">
                {/* Icon đơn giản */}
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4 7h16l-1.5 12a2 2 0 01-2 2H7.5a2 2 0 01-2-2L4 7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {confirmAction.action === 'approveDaoMember' ? 'Phê duyệt DAO' :
                 confirmAction.action === 'delete' ? 'Xoá người dùng' :
                 'Xác nhận'}
              </h3>
              <div className="px-7 py-3 mt-2">
                <p className="text-sm text-gray-600">{confirmAction.message}</p>
              </div>
              <div className="flex justify-center mt-4 space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                  disabled={loading}
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleUserAction(confirmAction.action, confirmAction.user)}
                  disabled={loading}
                  className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading
                    ? 'Đang xử lý...'
                    : confirmAction.action === 'approveDaoMember'
                    ? 'Phê duyệt'
                    : confirmAction.action === 'delete'
                    ? 'Xoá'
                    : 'Xác nhận'}
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
