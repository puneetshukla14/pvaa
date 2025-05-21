'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Legend,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
const SALARY = 50000;

type Expense = {
  category: string;
  amount: number;
};

export default function SpendingOverviewChart() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch('/api/expenses');
        const data = await res.json();

        const parsed = data
          .filter((exp: any) => !isNaN(parseFloat(exp.amount)))
          .map((exp: any) => ({
            category: exp.category,
            amount: parseFloat(exp.amount),
          })) as Expense[];

        setExpenses(parsed);

        const total = parsed.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalSpent(total);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const remaining = Math.max(SALARY - totalSpent, 0);

  const groupedByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieData = Object.entries(groupedByCategory).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
  }));

  const barData = [
    { name: 'Salary', value: SALARY },
    { name: 'Spent', value: totalSpent },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* Pie Chart */}
      <div className="h-72 w-full bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Spending Breakdown</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="h-72 w-full bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Overall Budget Summary</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
