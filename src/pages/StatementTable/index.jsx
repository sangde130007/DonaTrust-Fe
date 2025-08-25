import React, { useState } from "react";

// Mock data (sẽ thay bằng API sau này)
const mockTransactions = Array.from({ length: 35 }, (_, i) => ({
  id: 195493900000000000 + i,
  sender: "TK TRUNG GIAN HOÀN TIỀN - LOYALTY",
  date: "2025-08-11 23:12:00",
  timeAgo: `${i + 1} phút trước`,
  amount:
    (Math.floor(Math.random() * 5000) + 10) * (Math.random() > 0.5 ? 1 : -1),
  content: `Người A ủng hộ chương trình ${i + 1}`,
  campaign: "Chương trình trồng 1 triệu cây xanh cho Trường Sa",
}));

const StatementTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = mockTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(mockTransactions.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white px-[15%] py-10 font-sans">
      {/* ====== Tiêu đề và Tóm tắt ====== */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Thống kê tài khoản thiện nguyện minh bạch
        </h2>
        <p className="text-gray-700">
          Số tài khoản: <b>5555</b>, Tên tài khoản: <b>Dona Trust</b>
        </p>
        <p className="text-gray-700">
          TỔNG THU:{" "}
          <span className="text-green-600 font-bold">
            +26.613.731.832 VND
          </span>{" "}
          / TỔNG CHI:{" "}
          <span className="text-red-600 font-bold">-1.009.010.141 VND</span>
        </p>
        <p className="text-gray-700">
          Số dư tài khoản:{" "}
          <span className="text-green-700 font-bold">
            +25.604.721.691 VND
          </span>
        </p>
      </div>

      {/* ====== Bảng giao dịch ====== */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-800">
                Mã giao dịch
              </th>
              <th className="px-4 py-3 font-semibold text-gray-800">
                Người chuyển/nhận
              </th>
              <th className="px-4 py-3 font-semibold text-gray-800">
                Ngày chuyển
              </th>
              <th className="px-4 py-3 font-semibold text-gray-800">
                Số tiền (VND)
              </th>
              <th className="px-4 py-3 font-semibold text-gray-800">Nội dung</th>
              <th className="px-4 py-3 font-semibold text-gray-800">
                Chiến dịch
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((tx) => (
              <tr
                key={tx.id}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-4 py-3 text-gray-700">{tx.id}</td>
                <td className="px-4 py-3 text-gray-700">{tx.sender}</td>
                <td className="px-4 py-3 text-gray-700">
                  {tx.timeAgo}
                  <br />
                  <span className="text-gray-500 text-xs">{tx.date}</span>
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    tx.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-700">{tx.content}</td>
                <td className="px-4 py-3 text-gray-700">{tx.campaign}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== Phân trang ====== */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <span className="text-gray-600">
          {indexOfFirst + 1}–{Math.min(indexOfLast, mockTransactions.length)} của{" "}
          {mockTransactions.length}
        </span>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>
          <button
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <span className="px-3 text-gray-700">
            Trang {currentPage}/{totalPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border rounded disabled:opacity-50"
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
          <button
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatementTable;
