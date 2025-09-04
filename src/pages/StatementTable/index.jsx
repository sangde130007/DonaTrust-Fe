import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import campaignService from '../../services/campaignService';

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StatementTable = () => {
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [campaign, setCampaign] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
      } catch (err) {
        console.error('Lỗi lấy chi tiết chiến dịch:', err);
      }
    };
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchStatementData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [donationsRes, activitiesRes] = await Promise.all([
        axios.get(`${API_ORIGIN}/donations/history`, { params: { campaign_id: id } }),
        axios.get(`${API_ORIGIN}/campaigns/${id}/updates`),
      ]);

      const incomeTransactions = (donationsRes.data.data || []).map(tx => ({
        ...tx,
        type: 'income',
        amount: tx.amount,
        date: tx.date || new Date().toISOString(),
        content: `Ủng hộ ${tx.amount.toLocaleString()} VND từ ${tx.sender || 'Ẩn danh'}`,
      }));

      const expenseTransactions = (activitiesRes.data.updates || []).map(tx => ({
        ...tx,
        type: 'expense',
        amount: -(tx.spent_amount || 0),
        date: tx.date || new Date().toISOString(),
        content: `Chi cho hoạt động: ${tx.content}`,
      }));

      const combinedTransactions = [...incomeTransactions, ...expenseTransactions];

      combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(combinedTransactions);

    } catch (err) {
      console.error("Failed to fetch statement data:", err);
      setError("Không thể tải dữ liệu sao kê. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStatementData();
    }
  }, [id]);

  const getFilteredTransactions = () => {
    let filteredByTab = transactions;
    switch (filter) {
      case "income":
        filteredByTab = transactions.filter((tx) => tx.type === "income");
        break;
      case "expense":
        filteredByTab = transactions.filter((tx) => tx.type === "expense");
        break;
      default:
        break;
    }

    if (searchTerm.trim() === "") {
      return filteredByTab;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return filteredByTab.filter(tx =>
      (tx.content && tx.content.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (tx.id && String(tx.id).toLowerCase().includes(lowerCaseSearchTerm))
    );
  };

  const filteredTransactions = getFilteredTransactions();
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const calculateTotals = () => {
    const income = transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { income, expense };
  };

  const { income: filteredIncome, expense: filteredExpense } = calculateTotals();

  if (loading) {
    return <p className="text-center mt-8">Đang tải dữ liệu sao kê...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-red-600">
          Sao kê chiến dịch: {campaign ? campaign.title : id}
        </h2>
        <p>
          TỔNG THU:{" "}
          <span className="text-green-600 font-bold">
            +{filteredIncome.toLocaleString()} VND
          </span>{" "}
          / TỔNG CHI:{" "}
          <span className="text-red-600 font-bold">-{filteredExpense.toLocaleString()} VND</span>
        </p>
        <p>
          Số dư:{" "}
          <span className={`font-bold ${filteredIncome - filteredExpense >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {filteredIncome - filteredExpense >= 0 ? "+" : ""}{(filteredIncome - filteredExpense).toLocaleString()} VND
          </span>
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setFilter('income');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Tiền thu
          </button>
          <button
            onClick={() => {
              setFilter('expense');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Tiền chi
          </button>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Tìm kiếm giao dịch..."
          className="px-4 py-2 border rounded-lg w-1/3"
        />
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2">Mã giao dịch</th>
              <th className="px-4 py-2">Người chuyển/nhận</th>
              <th className="px-4 py-2">Ngày chuyển</th>
              <th className="px-4 py-2">Số tiền (VND)</th>
              <th className="px-4 py-2">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{tx.id}</td>
                <td className="px-4 py-2">{tx.created_by || 'Không rõ'}</td>
                <td className="px-4 py-2">
                  {new Date(tx.date).toLocaleString('vi-VN')}
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    tx.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                </td>
                <td className="px-4 py-2">{tx.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          {indexOfFirst + 1}–{Math.min(indexOfLast, filteredTransactions.length)}{" "}
          của {filteredTransactions.length}
        </span>
        <div className="space-x-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <span>
            Trang {currentPage}/{totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => handlePageChange(totalPages)}
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