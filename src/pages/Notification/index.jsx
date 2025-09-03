// src/pages/Notification/index.jsx  (hoặc NotificationPage.jsx bạn đang có)
import React, { useEffect, useMemo, useState } from 'react';
import { FaBell, FaSlidersH } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import clsx from 'clsx';
import notificationService from '../../services/notificationService';

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'fundraising', label: 'Gây quỹ' },
];

const PAGE_SIZE = 10;

const NotificationPage = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({
    system: true,
    email: false,
    campaigns: true,
  });

  const [items, setItems] = useState([]); // mảng notifications đã load
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const canLoadMore = page < totalPages;

  const fetchPage = async (reset = false) => {
    try {
      setLoading(true);
      const res = await notificationService.getMine({
        page: reset ? 1 : page,
        limit: PAGE_SIZE,
        search: search.trim(),
        tab: selectedTab,
        order: 'newest',
      });
      const nextItems = reset ? res.items : [...items, ...res.items];
      setItems(nextItems);
      setPage(res.page);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error('Load notifications failed', e);
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu & khi đổi tab/search -> reset
  useEffect(() => {
    (async () => {
      setPage(1);
      setTotalPages(1);
      setItems([]);
      await fetchPage(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  // tìm kiếm có debounce nhẹ
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setTotalPages(1);
      setItems([]);
      fetchPage(true);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleLoadMore = async () => {
    if (loading || !canLoadMore) return;
    const nextPage = page + 1;
    try {
      setLoading(true);
      const res = await notificationService.getMine({
        page: nextPage,
        limit: PAGE_SIZE,
        search: search.trim(),
        tab: selectedTab,
        order: 'newest',
      });
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error('Load more failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setItems((prev) => prev.map((n) => (n.noti_id === id || n.id === id ? { ...n, is_read: true } : n)));
      // cho bell cập nhật
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (e) {
      console.error('Mark read failed', e);
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (e) {
      console.error('Mark all failed', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-global-3">
      <div className="flex justify-center py-10">
        <section className="bg-white rounded-[20px] shadow-lg max-w-[900px] w-full px-[50px] py-[40px] flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <h2 className="text-[28px] font-bold text-global-1 flex-1">Trung tâm thông báo</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center bg-global-3 rounded-[12px] px-4 py-2 border border-global-7 w-full sm:w-[220px]">
                <FiSearch className="text-global-4 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm text-global-1"
                />
              </div>
              <button
                className="flex items-center gap-2 text-button-4 font-medium"
                onClick={handleMarkAll}
                title="Đánh dấu tất cả đã đọc"
              >
                <FaSlidersH size={18} />
                <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={clsx(
                  'px-6 py-2 rounded-full text-sm font-inter font-semibold transition focus:outline-none',
                  selectedTab === tab.key
                    ? 'bg-button-4 text-white'
                    : 'bg-global-3 text-global-1 hover:bg-global-2'
                )}
                onClick={() => setSelectedTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div id="notification-list-section" className="flex-1 flex flex-col gap-4">
              {items.length === 0 && !loading && (
                <div className="text-global-5 text-center py-8 text-base">Không có thông báo nào.</div>
              )}

              {items.map((n) => {
                const id = n.noti_id || n.id;
                return (
                  <div
                    key={id}
                    className={clsx(
                      'flex bg-global-3 rounded-[12px] px-5 py-4 gap-4 items-start shadow-sm border transition',
                      !n.is_read ? 'border-button-4 bg-white shadow-lg' : 'border-global-6'
                    )}
                  >
                    <div className="text-button-4 mt-1">
                      <FaBell size={20} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-global-1 text-[15px]">
                          {n.title || 'Thông báo'}
                        </span>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(id)}
                            className="text-button-4 text-sm font-medium ml-3 hover:underline"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      {n.content && <div className="text-global-4 text-sm">{n.content}</div>}
                      <div className="flex items-center gap-4 mt-1 text-xs text-global-5">
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                        <span className={clsx(n.is_read ? 'text-button-4' : 'text-red-500 font-medium')}>
                          {n.is_read ? 'Đã đọc' : 'Chưa đọc'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="text-center py-4 text-sm text-global-4">Đang tải...</div>
              )}
            </div>

            <div className="min-w-[240px] md:w-[260px] bg-global-3 rounded-[12px] p-5 shadow-sm flex flex-col gap-4 border border-global-7">
              <div className="font-semibold text-global-1 mb-1">Cài đặt thông báo</div>
              <div className="flex flex-col gap-3 text-sm text-global-1">
                <label className="flex items-center gap-3 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.system}
                    onChange={(e) => setSettings({ ...settings, system: e.target.checked })}
                    className="accent-button-4 w-5 h-5"
                  />
                  Nhận thông báo hệ thống
                </label>
                <label className="flex items-center gap-3 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.checked })}
                    className="accent-button-4 w-5 h-5"
                  />
                  Nhận thông báo qua email
                </label>
                <label className="flex items-center gap-3 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.campaigns}
                    onChange={(e) => setSettings({ ...settings, campaigns: e.target.checked })}
                    className="accent-button-4 w-5 h-5"
                  />
                  Nhận thông báo chiến dịch theo dõi
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2">
            {canLoadMore ? (
              <button
                className="bg-button-4 text-white text-sm px-8 py-2 rounded-full font-semibold shadow hover:bg-button-3 transition disabled:opacity-60"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            ) : (
              items.length > 0 && (
                <span className="text-sm text-global-5 py-2">Đã hiển thị tất cả</span>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationPage;
