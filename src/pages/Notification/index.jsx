import React, { useState } from "react";
import { FaBell, FaSlidersH } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import clsx from "clsx";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const notificationsData = [
  { id: 1, title: "Bạn đã được duyệt làm tổ chức từ thiện!", desc: "Bây giờ bạn có thể tạo chiến dịch đầu tiên.", time: "2 giờ trước", read: false, type: "system" },
  { id: 2, title: "Bạn đã ủng hộ thành công cho chiến dịch 'Trái tim cho trẻ em'.", desc: "", time: "5 ngày trước", read: false, type: "fundraising" },
  { id: 3, title: "Bạn đã ủng hộ thành công cho chiến dịch 'Trái tim cho trẻ em'.", desc: "", time: "1 tuần trước", read: false, type: "fundraising" },
  { id: 4, title: "Chào mừng đến với DonaTrust!", desc: "Đừng quên cập nhật thông tin cá nhân.", time: "2 tuần trước", read: true, type: "system" },
  { id: 5, title: "Chiến dịch 'Hy vọng ngày mai' của bạn đã được duyệt!", desc: "", time: "3 tuần trước", read: false, type: "system" },
  { id: 6, title: "Có người mới ủng hộ chiến dịch của bạn.", desc: "", time: "1 tháng trước", read: true, type: "system" },
  { id: 7, title: "Bạn nhận được một khoản ủng hộ mới.", desc: "", time: "1 tháng trước", read: false, type: "fundraising" },
  { id: 8, title: "Báo cáo tháng đã có sẵn.", desc: "", time: "2 tháng trước", read: true, type: "system" },
  { id: 9, title: "Chiến dịch đã đạt mục tiêu gây quỹ!", desc: "", time: "2 tháng trước", read: false, type: "fundraising" },
  { id: 10, title: "Cập nhật cài đặt thành công.", desc: "", time: "3 tháng trước", read: true, type: "system" }
];

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "fundraising", label: "Gây quỹ" }
];

const PAGE_SIZE = 5;

const NotificationPage = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState({
    system: true,
    email: false,
    campaigns: true
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [notifications, setNotifications] = useState(notificationsData);

  const filteredNotifications = notifications.filter(n => {
    if (selectedTab === "unread" && n.read) return false;
    if (selectedTab === "fundraising" && n.type !== "fundraising") return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-global-3">
      <Header />
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
                  onChange={e => {
                    setSearch(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="bg-transparent border-none outline-none w-full text-sm text-global-1"
                />
              </div>
              <div className="flex items-center gap-2 text-button-4 font-medium cursor-pointer">
                <FaSlidersH size={18} />
                <span className="hidden sm:inline">Cài đặt</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={clsx(
                  "px-6 py-2 rounded-full text-sm font-inter font-semibold transition focus:outline-none",
                  selectedTab === tab.key
                    ? "bg-button-4 text-white"
                    : "bg-global-3 text-global-1 hover:bg-global-2"
                )}
                onClick={() => {
                  setSelectedTab(tab.key);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div id="notification-list-section" className="flex-1 flex flex-col gap-4">
              {visibleNotifications.length === 0 && (
                <div className="text-global-5 text-center py-8 text-base">
                  Không có thông báo nào.
                </div>
              )}
              {visibleNotifications.map(n => (
                <div
                  key={n.id}
                  className={clsx(
                    "flex bg-global-3 rounded-[12px] px-5 py-4 gap-4 items-start shadow-sm border transition",
                    !n.read
                      ? "border-button-4 bg-white shadow-lg"
                      : "border-global-6"
                  )}
                >
                  <div className="text-button-4 mt-1">
                    <FaBell size={20} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-global-1 text-[15px]">{n.title}</span>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-button-4 text-sm font-medium ml-3 hover:underline"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    {n.desc && (
                      <div className="text-global-4 text-sm">{n.desc}</div>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-global-5">
                      <span>{n.time}</span>
                      <span className={clsx(n.read ? "text-button-4" : "text-red-500 font-medium")}>
                        {n.read ? "Đã đọc" : "Chưa đọc"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="min-w-[240px] md:w-[260px] bg-global-3 rounded-[12px] p-5 shadow-sm flex flex-col gap-4 border border-global-7">
              <div className="font-semibold text-global-1 mb-1">Cài đặt thông báo</div>
              <div className="flex flex-col gap-3 text-sm text-global-1">
                <label className="flex items-center gap-3 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.system}
                    onChange={e => setSettings({ ...settings, system: e.target.checked })}
                    className="accent-button-4 w-5 h-5"
                  />
                  Nhận thông báo hệ thống
                </label>
                <label className="flex items-center gap-3 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.email}
                    onChange={e => setSettings({ ...settings, email: e.target.checked })}
                    className="accent-button-4 w-5 h-5"
                  />
                  Nhận thông báo qua email
                </label>
                <label className="flex items-center gap-3 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.campaigns}
                    onChange={e => setSettings({ ...settings, campaigns: e.target.checked })}
                    className="accent-button-4 w-5 h-5"
                  />
                  Nhận thông báo chiến dịch theo dõi
                </label>
              </div>
            </div>
          </div>

          {filteredNotifications.length > PAGE_SIZE && (
            <div className="flex justify-center mt-4">
              {visibleCount < filteredNotifications.length ? (
                <button
                  className="bg-button-4 text-white text-sm px-8 py-2 rounded-full font-semibold shadow hover:bg-button-3 transition"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                >
                  Tải thêm
                </button>
              ) : (
                <button
                  className="bg-global-7 text-global-1 text-sm px-8 py-2 rounded-full font-semibold shadow hover:bg-global-6 transition"
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                >
                  Thu gọn
                </button>
              )}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationPage;
