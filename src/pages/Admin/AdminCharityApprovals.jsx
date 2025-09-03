// src/pages/admin/AdminCharityApprovals.jsx – Full feature, purple theme, custom buttons
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const PAGE_SIZE = 10;

/* ===== Helpers ===== */
const API_BASE =
  (typeof window !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) ||
  api?.defaults?.baseURL ||
  '';

const toAbsUrl = (u) => {
  if (!u) return '';
  if (u.startsWith('/')) return `${API_BASE.replace(/\/$/, '')}${u}`;
  return u;
};

const isImageUrl = (u = '') => /\.(png|jpe?g|gif|webp|svg)$/i.test(u.split('?')[0]);
const isPdfUrl   = (u = '') => /\.pdf$/i.test(u.split('?')[0]);

const FilePreview = ({ url }) => {
  const abs = toAbsUrl(url);
  if (!abs) return <div className="text-slate-500">—</div>;

  if (isImageUrl(abs)) {
    return (
      <img
        src={abs}
        alt="Tài liệu"
        className="w-full max-h-[420px] object-contain rounded-xl border border-violet-200"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    );
  }
  if (isPdfUrl(abs)) {
    return (
      <iframe
        title="PDF preview"
        src={abs}
        className="w-full h-[480px] rounded-xl border border-violet-200"
      />
    );
  }
  return (
    <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/40 text-slate-700">
      Không thể xem trực tiếp định dạng này. Bạn có thể tải xuống để xem.
      <div className="mt-3">
        <a
          href={abs}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-violet-700 hover:text-violet-900 underline"
          download
        >
          Tải tài liệu
        </a>
      </div>
    </div>
  );
};

/* ===== Beautiful Custom Buttons ===== */
const PrimaryButton = ({ children, onClick, disabled, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
      disabled ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
    } focus:outline-none focus:ring-2 focus:ring-violet-400 ${className}`}
  >
    {children}
  </button>
);

const DangerButton = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
      disabled ? 'bg-fuchsia-300 cursor-not-allowed' : 'bg-fuchsia-600 hover:bg-fuchsia-700'
    } focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${className}`}
  >
    {children}
  </button>
);

const TertiaryButton = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors ${
      disabled
        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
        : 'border-violet-200 text-violet-700 hover:bg-violet-50'
    } focus:outline-none focus:ring-2 focus:ring-violet-200 ${className}`}
  >
    {children}
  </button>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-100 text-violet-700 border border-violet-200">
    {children}
  </span>
);

/* ===== Page ===== */
const AdminCharityApprovals = () => {
  const [charities, setCharities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/charities', {
        params: {
          verification_status: 'pending',
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          city: city || undefined,
          sort: 'created_at',
          order: 'DESC',
        },
      });
      const rows = res.data.charities || [];
      const norm = rows.map((r) => ({
        ...r,
        license_document: toAbsUrl(r.license_document),
        logo_url: toAbsUrl(r.logo_url),
      }));
      setCharities(norm);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setCharities([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const approve = async (charityId) => {
    if (!window.confirm('Duyệt tổ chức này?')) return;
    setActionLoadingId(charityId);
    try {
      await api.put(`/admin/charities/${charityId}/verify`, { status: 'verified' });
      setCharities((rows) => rows.filter((r) => r.charity_id !== charityId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Duyệt thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (charityId) => {
    const reason = rejectReason.trim();
    if (reason.length < 10) return alert('Lý do từ chối phải ≥ 10 ký tự');
    setActionLoadingId(charityId);
    try {
      await api.put(`/admin/charities/${charityId}/verify`, {
        status: 'rejected',
        rejection_reason: reason,
      });
      setRejectReason('');
      setCharities((rows) => rows.filter((r) => r.charity_id !== charityId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Từ chối thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">Duyệt tổ chức từ thiện</h1>
        <p className="mt-1 text-white/80 text-sm">Quản lý các hồ sơ đang chờ phê duyệt. Chủ đạo tím ✨</p>
      </div>

      {/* Filters */}
      <form onSubmit={onSearch} className="mb-5 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="">
            <label className="block mb-1 text-xs font-medium text-slate-600">Tìm kiếm</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên / mô tả / sứ mệnh…"
              className="px-3 py-2 w-full rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="">
            <label className="block mb-1 text-xs font-medium text-slate-600">Thành phố</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: TP.HCM"
              className="px-3 py-2 w-full rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="submit">Lọc</PrimaryButton>
            <TertiaryButton
              onClick={() => { setSearch(''); setCity(''); setPage(1); fetchData(); }}
            >
              Xoá lọc
            </TertiaryButton>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-violet-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-violet-50 text-violet-800">
            <tr className="text-left">
              <th className="p-3">Tổ chức</th>
              <th className="p-3">Liên hệ</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Giấy phép</th>
              <th className="p-3">Ngày nộp</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={6}>
                  Đang tải…
                </td>
              </tr>
            ) : charities.length === 0 ? (
              <tr>
                <td className="p-10" colSpan={6}>
                  <div className="text-center text-slate-600">
                    <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-violet-100 grid place-items-center">
                      <span className="text-2xl">🗂️</span>
                    </div>
                    <div className="font-semibold">Không có hồ sơ chờ duyệt</div>
                    <div className="text-sm text-slate-500">Thử thay đổi bộ lọc ở trên.</div>
                  </div>
                </td>
              </tr>
            ) : (
              charities.map((c) => {
                const docUrl = c.license_document;
                return (
                  <tr key={c.charity_id} className="border-t hover:bg-violet-50/40 transition-colors">
                    <td className="p-3 align-top">
                      <div className="flex items-start gap-3">
                        {c.logo_url ? (
                          <img src={c.logo_url} alt="logo" className="h-10 w-10 rounded-lg object-cover border border-violet-200" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-violet-100 grid place-items-center text-violet-700">🏷️</div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{c.name}</div>
                          <div className="text-slate-500 line-clamp-1">{c.mission}</div>
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => setSelected(c)}
                              className="text-xs text-violet-700 hover:underline"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <div className="text-slate-800">{c.email}</div>
                      <div className="text-slate-500">{c.phone}</div>
                      {c.website_url && (
                        <a
                          className="text-xs text-violet-700 hover:underline"
                          href={c.website_url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          Website
                        </a>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="text-slate-800">{c.address}</div>
                      <div className="text-slate-500">{[c.ward, c.district, c.city].filter(Boolean).join(', ')}</div>
                      {c.city && (
                        <div className="mt-1"><Badge>{c.city}</Badge></div>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="text-slate-800">{c.license_number}</div>
                      {/* Thumbnail nếu là ảnh */}
                      {docUrl && isImageUrl(docUrl) ? (
                        <button
                          type="button"
                          onClick={() => setSelected(c)}
                          className="mt-1 block"
                          title="Xem hình"
                        >
                          <img
                            src={docUrl}
                            alt="Giấy phép"
                            className="mt-1 h-12 w-16 object-cover rounded-lg border border-violet-200"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </button>
                      ) : docUrl ? (
                        <a
                          className="text-xs text-violet-700 hover:underline"
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {isPdfUrl(docUrl) ? 'Mở PDF' : 'Tài liệu'}
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="text-slate-800">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td className="p-3 text-right align-top">
                      <div className="flex gap-2 justify-end items-center">
                        <PrimaryButton
                          onClick={() => approve(c.charity_id)}
                          disabled={actionLoadingId === c.charity_id}
                        >
                          {actionLoadingId === c.charity_id ? 'Đang duyệt…' : 'Duyệt'}
                        </PrimaryButton>
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Lý do từ chối"
                          className="px-2 py-1 w-44 text-xs rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                        <DangerButton
                          onClick={() => reject(c.charity_id)}
                          disabled={actionLoadingId === c.charity_id}
                        >
                          {actionLoadingId === c.charity_id ? 'Đang xử lý…' : 'Từ chối'}
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-slate-600">
          Tổng: <b>{total}</b> | Trang {page}/{totalPages}
        </div>
        <div className="flex gap-2 items-center">
          <TertiaryButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>« Trước</TertiaryButton>
          <TertiaryButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Sau »</TertiaryButton>
        </div>
      </div>

      {/* Quick detail modal with preview */}
      {selected && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50 backdrop-blur-sm">
          <div className="relative p-6 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-violet-200">
            <button
              className="absolute top-3 right-3 h-8 w-8 inline-grid place-items-center rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200"
              onClick={() => setSelected(null)}
              title="Đóng"
            >
              ✕
            </button>
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200">
                <span className="text-lg">🏛️</span>
                <h3 className="text-lg font-semibold">{selected.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Email</div>
                <div className="font-medium">{selected.email}</div>
              </div>
              <div>
                <div className="text-slate-500">Điện thoại</div>
                <div className="font-medium">{selected.phone}</div>
              </div>
              <div className="col-span-2">
                <div className="text-slate-500">Địa chỉ</div>
                <div className="font-medium">
                  {selected.address} — {[selected.ward, selected.district, selected.city].filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-slate-500">Sứ mệnh</div>
                <div className="font-medium whitespace-pre-wrap">{selected.mission}</div>
              </div>
              {selected.description && (
                <div className="col-span-2">
                  <div className="text-slate-500">Mô tả</div>
                  <div className="font-medium whitespace-pre-wrap">{selected.description}</div>
                </div>
              )}
              <div>
                <div className="text-slate-500">Số giấy phép</div>
                <div className="font-medium">{selected.license_number}</div>
              </div>
              <div>
                <div className="text-slate-500">Giấy phép</div>
                {selected.license_document ? (
                  <a
                    href={selected.license_document}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-violet-700 hover:underline"
                  >
                    Mở trong tab mới
                  </a>
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
              {selected.website_url && (
                <div className="col-span-2">
                  <div className="text-slate-500">Website</div>
                  <a
                    href={selected.website_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-violet-700 hover:underline"
                  >
                    {selected.website_url}
                  </a>
                </div>
              )}
            </div>

            {selected.license_document && (
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold text-slate-700">Xem tài liệu đính kèm</h4>
                <FilePreview url={selected.license_document} />
              </div>
            )}

            <div className="flex gap-2 justify-end items-center mt-6">
              <PrimaryButton onClick={() => approve(selected.charity_id)} disabled={actionLoadingId}>
                Duyệt
              </PrimaryButton>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Lý do từ chối"
                className="px-3 py-2 w-56 text-sm rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <DangerButton onClick={() => reject(selected.charity_id)} disabled={actionLoadingId}>
                Từ chối
              </DangerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCharityApprovals;
