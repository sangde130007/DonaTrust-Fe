// src/pages/admin/AdminReportedCampaigns.jsx
import React, { useEffect, useState } from "react";
import {
  fetchReportCampaigns,
  fetchReportCampaignDetail,
  updateReportCampaignStatus,
} from "../../services/reportCampaignService";

const PAGE_SIZES = [10, 20, 50];
const STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const Th = ({ children, onClick, active, order }) => (
  <th
    className="px-4 py-3 text-left font-medium cursor-pointer select-none"
    onClick={onClick}
  >
    <div className="flex items-center gap-1">
      {children}
      {active && (order === "ASC" ? "▲" : "▼")}
    </div>
  </th>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dismissed: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        map[status] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
};

const TextTruncate = ({ text = "", max = 120 }) => {
  if (!text) return null;
  const v = String(text);
  return <span title={v}>{v.length > max ? v.slice(0, max) + "…" : v}</span>;
};

const EvidenceThumbs = ({ files = [] }) => {
  if (!files?.length) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex gap-2 flex-wrap">
      {files.map((f, i) => (
        <a
          key={`${f}-${i}`}
          href={f}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          📎 File {i + 1}
        </a>
      ))}
    </div>
  );
};

const DetailDrawer = ({ open, onClose, reportId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open || !reportId) return;
    let ignore = false;
    setLoading(true);
    fetchReportCampaignDetail(reportId)
      .then((res) => !ignore && setData(res))
      .finally(() => !ignore && setLoading(false));
    return () => (ignore = true);
  }, [open, reportId]);

  return (
    <div
      className={`fixed inset-0 z-40 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chi tiết báo cáo</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
          {loading && <div className="text-slate-500">Đang tải…</div>}
          {!loading && data && (
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase text-slate-500">
                  Chiến dịch
                </div>
                <div className="font-medium">{data.campaign?.title || "—"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Mã báo cáo
                  </div>
                  <div>{data.report_id}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Trạng thái
                  </div>
                  <StatusBadge status={data.status} />
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Người báo cáo
                  </div>
                  <div>
                    {data.reporter?.full_name ||
                      data.reporter?.email ||
                      data.reporter_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Tạo lúc
                  </div>
                  <div>{new Date(data.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">Lý do</div>
                <pre className="bg-slate-50 p-3 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(data.reasons, null, 2)}
                </pre>
              </div>
              {data.other_reason && (
                <div>
                  <div className="text-xs uppercase text-slate-500">
                    Lý do khác
                  </div>
                  <div>{data.other_reason}</div>
                </div>
              )}
              {data.description && (
                <div>
                  <div className="text-xs uppercase text-slate-500">Mô tả</div>
                  <div className="whitespace-pre-wrap">{data.description}</div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase text-slate-500 mb-1">
                  Bằng chứng
                </div>
                <EvidenceThumbs files={data.evidence_files} />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const AdminReportedCampaigns = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchReportCampaigns({
        page,
        pageSize,
        status: status || undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status, sortBy, sortOrder]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(key);
      setSortOrder("DESC");
    }
  };

  const openDetail = (id) => {
    setActiveId(id);
    setDrawerOpen(true);
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    await updateReportCampaignStatus(id, nextStatus);
    load();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Báo cáo chiến dịch</h1>
        <p className="text-slate-500">
          Xem, lọc, sắp xếp và xử lý các báo cáo từ người dùng.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-3 sm:p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề/ người báo cáo/ mã báo cáo…"
          className="col-span-2 border rounded-lg px-3 py-2 focus:outline-none focus:ring w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / trang
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th
                  onClick={() => toggleSort("created_at")}
                  active={sortBy === "created_at"}
                  order={sortOrder}
                >
                  Tạo lúc
                </Th>
                <Th
                  onClick={() => toggleSort("campaign_title")}
                  active={sortBy === "campaign_title"}
                  order={sortOrder}
                >
                  Chiến dịch
                </Th>
                <Th
                  onClick={() => toggleSort("reporter_name")}
                  active={sortBy === "reporter_name"}
                  order={sortOrder}
                >
                  Người báo cáo
                </Th>
                <Th>Lý do</Th>
                <Th>Bằng chứng</Th>
                <Th
                  onClick={() => toggleSort("status")}
                  active={sortBy === "status"}
                  order={sortOrder}
                >
                  Trạng thái
                </Th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-500"
                    colSpan={7}
                  >
                    Đang tải…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-500"
                    colSpan={7}
                  >
                    Không có báo cáo
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((it) => (
                  <tr key={it.report_id} className="border-t">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(it.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {it.campaign?.title || "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {it.campaign_id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {it.reporter?.full_name ||
                          it.reporter?.email ||
                          it.reporter_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[360px]">
                      <TextTruncate
                        text={it.other_reason || JSON.stringify(it.reasons)}
                        max={140}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <EvidenceThumbs files={it.evidence_files} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={it.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {it.status !== "resolved" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(it.report_id, "resolved")
                            }
                            className="px-2 py-1 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Resolve
                          </button>
                        )}
                        {it.status !== "dismissed" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(it.report_id, "dismissed")
                            }
                            className="px-2 py-1 rounded-lg text-xs bg-slate-600 text-white hover:bg-slate-700"
                          >
                            Dismiss
                          </button>
                        )}
                        {it.status !== "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(it.report_id, "pending")
                            }
                            className="px-2 py-1 rounded-lg text-xs bg-amber-600 text-white hover:bg-amber-700"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          onClick={() => openDetail(it.report_id)}
                          className="px-2 py-1 rounded-lg text-xs border hover:bg-slate-50"
                        >
                          Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t">
          <div className="text-sm text-slate-600">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Trước
            </button>
            <button
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Drawer chi tiết */}
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        reportId={activeId}
      />
    </div>
  );
};

export default AdminReportedCampaigns;
