import { NextResponse } from 'next/server';

// Mock expense data
// In a real app, this would come from a database or Google Sheets
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

// GET /api/expenses - Get expense breakdown
export async function GET() {
  // Calculate totals
  const totalSpent = mockExpenses.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = mockExpenses.categories.reduce((sum, cat) => sum + cat.budget, 0);

  return NextResponse.json({
    ...mockExpenses,
    totalSpent,
    totalBudget,
    formattedTotalSpent: totalSpent.toLocaleString('vi-VN') + 'đ',
    formattedTotalBudget: totalBudget.toLocaleString('vi-VN') + 'đ',
    spendingPercentage: Number(((totalSpent / totalBudget) * 100).toFixed(1)),
  });
}
