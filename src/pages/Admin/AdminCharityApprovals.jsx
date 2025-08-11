  // src/pages/admin/AdminCharityApprovals.jsx
  import React, { useEffect, useMemo, useState } from 'react';
  import api from '../../services/api';
  import Button from '../../components/ui/Button';

  const PAGE_SIZE = 10;

  const AdminCharityApprovals = () => {
    const [charities, setCharities] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null); // xem chi tiết nhanh
    const [actionLoadingId, setActionLoadingId] = useState(null); // loading theo row
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
        setCharities(res.data.charities || []);
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
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Duyệt tổ chức từ thiện</h1>

        {/* Filters */}
        <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm text-slate-600 mb-1">Tìm kiếm</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên / mô tả / sứ mệnh…"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="w-56">
            <label className="block text-sm text-slate-600 mb-1">Thành phố</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: TP.HCM"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Lọc
          </Button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Tổ chức</th>
                <th className="text-left p-3">Liên hệ</th>
                <th className="text-left p-3">Địa chỉ</th>
                <th className="text-left p-3">Giấy phép</th>
                <th className="text-left p-3">Ngày nộp</th>
                <th className="text-right p-3">Thao tác</th>
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
                  <td className="p-6 text-center text-slate-500" colSpan={6}>
                    Không có hồ sơ chờ duyệt.
                  </td>
                </tr>
              ) : (
                charities.map((c) => (
                  <tr key={c.charity_id} className="border-t hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-slate-500 line-clamp-1">{c.mission}</div>
                      <button
                        type="button"
                        onClick={() => setSelected(c)}
                        className="text-blue-600 text-xs mt-1 hover:underline"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800">{c.email}</div>
                      <div className="text-slate-500">{c.phone}</div>
                      {c.website_url && (
                        <a
                          className="text-xs text-blue-600 hover:underline"
                          href={c.website_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Website
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800">{c.address}</div>
                      <div className="text-slate-500">{[c.ward, c.district, c.city].filter(Boolean).join(', ')}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800">{c.license_number}</div>
                      {c.license_document && (
                        <a
                          className="text-xs text-blue-600 hover:underline"
                          href={c.license_document}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Tài liệu
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : '—'}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => approve(c.charity_id)}
                          disabled={actionLoadingId === c.charity_id}
                        >
                          {actionLoadingId === c.charity_id ? 'Đang duyệt…' : 'Duyệt'}
                        </Button>
                        <div className="flex items-center gap-2">
                          <input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Lý do từ chối"
                            className="border rounded-lg px-2 py-1 w-40 text-xs"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => reject(c.charity_id)}
                            disabled={actionLoadingId === c.charity_id}
                          >
                            {actionLoadingId === c.charity_id ? 'Đang xử lý…' : 'Từ chối'}
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-600">
            Tổng: <b>{total}</b> | Trang {page}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="tertiary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              « Trước
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau »
            </Button>
          </div>
        </div>

        {/* Quick detail drawer / modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">{selected.name}</h3>
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
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Xem tài liệu
                    </a>
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
                {selected.website_url && (
                  <div className="col-span-2">
                    <div className="text-slate-500">Website</div>
                    <a href={selected.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {selected.website_url}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={() => approve(selected.charity_id)} disabled={actionLoadingId}>
                  Duyệt
                </Button>
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Lý do từ chối"
                  className="border rounded-lg px-2 py-1 w-48 text-sm"
                />
                <Button variant="danger" onClick={() => reject(selected.charity_id)} disabled={actionLoadingId}>
                  Từ chối
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default AdminCharityApprovals;
