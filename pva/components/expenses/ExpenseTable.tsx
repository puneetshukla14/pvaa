'use client';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category?: string;
}

interface Filters {
  category: string;
  dateFrom: string;
  dateTo: string;
}

interface Props {
  filters: Filters;
}

const socket = io('http://localhost:4000'); // Replace with your WebSocket URL

export default function ExpenseTable({ filters }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();

    socket.on('new-expense', (newExpense: Expense) => {
      setExpenses((prev) => [...prev, newExpense]);
    });

    return () => {
      socket.off('new-expense');
    };
  }, []);

  const handleCellChange = (rowIndex: number, key: keyof Expense, value: string) => {
    const updated = [...expenses];
    if (key === 'amount') {
      updated[rowIndex][key] = parseFloat(value) || 0;
    } else {
      updated[rowIndex][key] = value;
    }
    setExpenses(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting expense');
    }
  };

  const handleEditToggle = (id: string) => {
    setEditingRow((prev) => (prev === id ? null : id));
  };

  const addEntry = () => {
    const newExpense: Expense = {
      _id: Date.now().toString(),
      title: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      category: '',
    };
    setExpenses((prev) => [...prev, newExpense]);
    setEditingRow(newExpense._id);
  };

  // ✅ Filter logic based on filters
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      !filters.category || expense.category?.toLowerCase().includes(filters.category.toLowerCase());
    const matchesDateFrom = !filters.dateFrom || new Date(expense.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(expense.date) <= new Date(filters.dateTo);
    return matchesCategory && matchesDateFrom && matchesDateTo;
  });

  if (loading) return <p className="text-center py-8 text-gray-500">Loading expenses...</p>;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;

  const columns = ['title', 'amount', 'date', 'category'];

  return (
    <div className="p-6 bg-white dark:bg-[#1e1e1e] shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Expense Tracker</h2>
        <button
          onClick={addEntry}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
        >
          + Add Entry
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300 rounded-lg">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 border border-gray-300 text-left">
                  {col}
                </th>
              ))}
              <th className="px-4 py-3 border border-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense, rowIndex) => (
              <tr key={expense._id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 border border-gray-300">
                    <input
                      type={
                        col === 'amount'
                          ? 'number'
                          : col === 'date'
                          ? 'date'
                          : 'text'
                      }
                      value={
                        col === 'date'
                          ? expense.date?.slice(0, 10)
                          : (expense as any)[col]
                      }
                      onChange={(e) =>
                        handleCellChange(rowIndex, col as keyof Expense, e.target.value)
                      }
                      className={`w-full bg-transparent outline-none ${
                        editingRow !== expense._id ? 'text-gray-500' : ''
                      }`}
                      readOnly={editingRow !== expense._id}
                    />
                  </td>
                ))}
                <td className="px-4 py-2 border border-gray-300 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => handleEditToggle(expense._id)}
                      className={`px-3 py-1 rounded-lg font-medium text-sm transition duration-200 shadow-sm ${
                        editingRow === expense._id
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                      }`}
                    >
                      {editingRow === expense._id ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-medium text-sm transition duration-200 shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredExpenses.length === 0 && (
          <p className="text-center py-4 text-gray-500">No expenses match your filters.</p>
        )}
      </div>
    </div>
  );
}
