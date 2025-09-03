// src/components/common/NotificationBell.jsx
import React, { useEffect, useRef, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const POLL_MS = 30000; // 30s: có thể tăng/giảm hoặc tắt nếu dùng websocket

const NotificationBell = () => {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [latest, setLatest] = useState([]);
  const dropdownRef = useRef(null);

  const loadCountAndLatest = async () => {
    try {
      const countRes = await notificationService.getUnreadCount();
      setUnread(countRes?.count || 0);

      const listRes = await notificationService.getMine({ page: 1, limit: 5, order: 'newest' });
      setLatest(listRes?.items || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Load notifications failed', e);
    }
  };

  useEffect(() => {
    loadCountAndLatest();

    // Polling nhẹ nếu chưa dùng socket
    const t = setInterval(loadCountAndLatest, POLL_MS);
    return () => clearInterval(t);
  }, []);

  // Cập nhật chéo khi trang NotificationPage thao tác (bắn CustomEvent)
  useEffect(() => {
    const handler = () => loadCountAndLatest();
    window.addEventListener('notifications:updated', handler);
    return () => window.removeEventListener('notifications:updated', handler);
  }, []);

  // click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const onBellClick = () => setOpen((v) => !v);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onBellClick}
        className="relative p-2 rounded-full hover:bg-global-3 transition"
        aria-label="Notifications"
      >
        <FaBell className="text-global-1" size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] leading-3 rounded-full px-1 min-w-[16px] text-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] bg-white border border-global-6 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-global-6 flex items-center justify-between">
            <div className="font-semibold text-global-1">Thông báo</div>
            <Link
              to="/notification"
              className="text-button-4 text-sm font-medium hover:underline"
              onClick={() => setOpen(false)}
            >
              Xem tất cả
            </Link>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {latest.length === 0 ? (
              <div className="p-4 text-sm text-global-5">Chưa có thông báo</div>
            ) : (
              latest.map((n) => (
                <Link
                  key={n.noti_id || n.id}
                  to="/notification"
                  className={`block px-4 py-3 hover:bg-global-3 transition ${
                    !n.is_read ? 'bg-global-3/40' : ''
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <div className="text-[13px] font-semibold text-global-1 line-clamp-2">
                    {n.title || 'Thông báo'}
                  </div>
                  {n.content && (
                    <div className="text-[12px] text-global-4 line-clamp-2 mt-0.5">
                      {n.content}
                    </div>
                  )}
                  <div className="text-[11px] text-global-5 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
