import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Expense } from '@/lib/supabase/types';

// Mock expense data for when Supabase is not configured
const mockExpenses = {
  categories: [
    {
      id: 'food',
      percentage: 40,
      label: 'Ăn uống',
      description: 'Cơm, mì tôm, trứng, rau. KHÔNG có tôm hùm!',
      color: 'bg-pink-500',
      chartColor: '#ec4899',
      spent: 980000,
      budget: 4000000,
    },
    {
      id: 'utilities',
      percentage: 20,
      label: 'Điện nước internet',
      description: 'Để sao kê cho anh chị',
      color: 'bg-purple-500',
      chartColor: '#a855f7',
      spent: 450000,
      budget: 2000000,
    },
    {
      id: 'rent',
      percentage: 15,
      label: 'Thuê nhà',
      description: 'Phòng trọ 15m², không phải penthouse',
      color: 'bg-blue-500',
      chartColor: '#3b82f6',
      spent: 1500000,
      budget: 1500000,
    },
    {
      id: 'health',
      percentage: 10,
      label: 'Y tế',
      description: 'Thuốc cảm, vitamin C, khẩu trang',
      color: 'bg-green-500',
      chartColor: '#22c55e',
      spent: 120000,
      budget: 1000000,
    },
    {
      id: 'learning',
      percentage: 10,
      label: 'Học tập nâng cao',
      description: 'Sách, khóa học online để sao kê tốt hơn',
      color: 'bg-yellow-500',
      chartColor: '#eab308',
      spent: 200000,
      budget: 1000000,
    },
    {
      id: 'entertainment',
      percentage: 5,
      label: 'Giải trí',
      description: 'Netflix? Không! Chỉ Youtube miễn phí thôi!',
      color: 'bg-orange-500',
      chartColor: '#f97316',
      spent: 50000,
      budget: 500000,
    },
  ],
  lastUpdated: new Date().toISOString(),
  month: 'Tháng 2/2026',
};

function formatExpenseResponse(categories: typeof mockExpenses.categories, month: string, isMock = false) {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);

  return {
    categories,
    lastUpdated: new Date().toISOString(),
    month,
    totalSpent,
    totalBudget,
    formattedTotalSpent: totalSpent.toLocaleString('vi-VN') + 'đ',
    formattedTotalBudget: totalBudget.toLocaleString('vi-VN') + 'đ',
    spendingPercentage: Number(((totalSpent / totalBudget) * 100).toFixed(1)),
    ...(isMock && { isMock: true }),
  };
}

// GET /api/expenses - Get expense breakdown
export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(formatExpenseResponse(mockExpenses.categories, mockExpenses.month, true));
  }

  try {
    const supabase = await createClient();

    // Get current month in format "Tháng M/YYYY"
    const now = new Date();
    const currentMonth = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('month', currentMonth);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // If no expenses found for current month, return mock data
    if (!expenses || expenses.length === 0) {
      return NextResponse.json(formatExpenseResponse(mockExpenses.categories, currentMonth, true));
    }

    const categories = (expenses as Expense[]).map((e) => ({
      id: e.id,
      percentage: e.percentage,
      label: e.label,
      description: e.description || '',
      color: e.color || 'bg-gray-500',
      chartColor: e.chart_color || '#6b7280',
      spent: e.spent,
      budget: e.budget,
    }));

    return NextResponse.json(formatExpenseResponse(categories, currentMonth));
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json(formatExpenseResponse(mockExpenses.categories, mockExpenses.month, true));
  }
}
