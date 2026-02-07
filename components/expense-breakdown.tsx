'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpenseCategory {
  id: string;
  percentage: number;
  label: string;
  description: string;
  color: string;
  chartColor: string;
  spent: number;
  budget: number;
}

interface ExpenseBreakdownProps {
  expenses: ExpenseCategory[];
  defaultExpenses: ExpenseCategory[];
}

export function ExpenseBreakdown({ expenses, defaultExpenses }: ExpenseBreakdownProps) {
  const displayExpenses = expenses.length > 0 ? expenses : defaultExpenses;

  const pieChartData = displayExpenses.map((expense) => ({
    name: expense.label,
    value: expense.percentage,
    color: expense.chartColor,
  }));

  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
        <span className="inline-block animate-bounce">📈</span> Tôi Sẽ Dùng
        Tiền Vào Đâu?
      </h2>
      <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        {/* Pie Chart */}
        <div className="mb-8">
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {displayExpenses.map((expense, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${expense.color}`}
                />
                <span className="text-sm text-muted-foreground">
                  {expense.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="space-y-6">
          {displayExpenses.map((expense, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-foreground">
                    {expense.percentage}%
                  </span>
                  <div>
                    <div className="font-bold text-foreground">
                      {expense.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {expense.description}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${expense.color} transition-all duration-1000 group-hover:animate-pulse`}
                  style={{
                    width: `${expense.percentage}%`,
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
