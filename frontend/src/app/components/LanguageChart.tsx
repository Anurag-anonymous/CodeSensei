// app/components/LanguageChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LanguageChartProps {
  languages: Record<string, string>;
}

export default function LanguageChart({ languages }: LanguageChartProps) {
  // Convert percentage strings to numeric values
  const data = Object.entries(languages).map(([name, percentage]) => ({
    name,
    value: parseFloat(percentage),
  })).slice(0, 8); // Show top 8 languages

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}