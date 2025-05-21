'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Expense = {
  category: string;
  amount: number;
  date: string; // Should be ISO format
};

export default function SpendingTrendChart() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [chartData, setChartData] = useState<any>(null);

  // Fetch and parse expense data
  useEffect(() => {
    const fetchExpenses = async () => {
      const res = await fetch('/api/expenses');
      const raw = await res.json();

      const parsed: Expense[] = raw
        .filter((exp: any) => !isNaN(parseFloat(exp.amount)))
        .map((exp: any) => ({
          ...exp,
          amount: parseFloat(exp.amount),
        }));

      setExpenses(parsed);
    };

    fetchExpenses();
  }, []);

  // Update chart data when expenses or filter changes
  useEffect(() => {
    const grouped = groupExpensesByFilter(expenses, filter);
    const labels = Object.keys(grouped).sort();
    const data = labels.map((label) => grouped[label]);

    setChartData({
      labels,
      datasets: [
        {
          label: `${capitalize(filter)} Spending`,
          data,
          borderColor: '#0288D1',
          backgroundColor: '#B3E5FC',
          fill: true,
        },
      ],
    });
  }, [expenses, filter]);

  // Group expenses by selected filter
  const groupExpensesByFilter = (
    expenses: Expense[],
    filter: 'daily' | 'weekly' | 'monthly'
  ): Record<string, number> => {
    const grouped: Record<string, number> = {};

    expenses.forEach((exp) => {
      const date = dayjs(exp.date);
      let key = '';

      if (filter === 'daily') {
        key = date.format('YYYY-MM-DD');
      } else if (filter === 'weekly') {
        key = `${date.year()}-W${date.isoWeek()}`;
      } else if (filter === 'monthly') {
        key = date.format('YYYY-MM');
      }

      grouped[key] = (grouped[key] || 0) + exp.amount;
    });

    return grouped;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="w-full bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex gap-4">
        {(['daily', 'weekly', 'monthly'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {capitalize(type)}
          </button>
        ))}
      </div>

      {chartData ? (
        <Line data={chartData} options={{ responsive: true }} />
      ) : (
        <p className="text-gray-500 text-sm">Loading chart...</p>
      )}
    </div>
  );
}
