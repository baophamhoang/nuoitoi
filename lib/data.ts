import { createServiceClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getSupabaseServiceRoleKey } from '@/lib/supabase/env';
import type { Donation as DbDonation, Expense } from '@/lib/supabase/types';
import type { Donation, ExpenseCategory, DonationStats } from '@/lib/types';

function formatTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
  return `${Math.floor(diffMins / 1440)} ngày trước`;
}

function isServiceClientAvailable(): boolean {
  return isSupabaseConfigured() && !!getSupabaseServiceRoleKey();
}

const mockDonations = [
  { id: '1', name: 'Anh T***', amount: 100000, message: 'Cố lên nhé!', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: '2', name: 'Chị H***', amount: 50000, message: 'Ủng hộ minh bạch!', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: '3', name: 'Ẩn danh', amount: 20000, message: '', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: '4', name: 'Bạn N***', amount: 200000, message: 'Sao kê đi nhé!', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: '5', name: 'Ẩn danh', amount: 50000, message: 'Mua mì tôm đi!', created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
];

function formatMockDonations(): Donation[] {
  return mockDonations.map((d) => ({
    id: d.id,
    name: d.name,
    amount: d.amount,
    message: d.message,
    time: formatTimeAgo(d.created_at),
  }));
}

export async function fetchDonations(): Promise<Donation[]> {
  if (!isServiceClientAvailable()) return formatMockDonations();

  try {
    const supabase = createServiceClient();
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return ((donations || []) as DbDonation[]).map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      message: d.message || '',
      time: formatTimeAgo(d.created_at),
    }));
  } catch (error) {
    console.error('Failed to fetch donations:', error);
    return formatMockDonations();
  }
}

export async function fetchDonationStats(): Promise<DonationStats> {
  const mockStats: DonationStats = { totalAmount: 2450000, donationCount: 47, monthlyGoal: 10000000 };

  if (!isServiceClientAvailable()) return mockStats;

  try {
    const supabase = createServiceClient();
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount');

    if (error) throw error;

    const allDonations = (donations || []) as Pick<DbDonation, 'amount'>[];
    const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalAmount,
      donationCount: allDonations.length,
      monthlyGoal: 10000000,
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return mockStats;
  }
}

const defaultExpenses: ExpenseCategory[] = [
  { id: 'food', percentage: 40, label: 'Ăn uống', description: 'Cơm, mì tôm, trứng, rau. KHÔNG có tôm hùm!', color: 'bg-pink-500', chartColor: '#ec4899', spent: 0, budget: 4000000 },
  { id: 'utilities', percentage: 20, label: 'Điện nước internet', description: 'Để sao kê cho anh chị', color: 'bg-purple-500', chartColor: '#a855f7', spent: 0, budget: 2000000 },
  { id: 'rent', percentage: 15, label: 'Thuê nhà', description: 'Phòng trọ 15m², không phải penthouse', color: 'bg-blue-500', chartColor: '#3b82f6', spent: 0, budget: 1500000 },
  { id: 'health', percentage: 10, label: 'Y tế', description: 'Thuốc cảm, vitamin C, khẩu trang', color: 'bg-green-500', chartColor: '#22c55e', spent: 0, budget: 1000000 },
  { id: 'learning', percentage: 10, label: 'Học tập nâng cao', description: 'Sách, khóa học online để sao kê tốt hơn', color: 'bg-yellow-500', chartColor: '#eab308', spent: 0, budget: 1000000 },
  { id: 'entertainment', percentage: 5, label: 'Giải trí', description: 'Netflix? Không! Chỉ Youtube miễn phí thôi!', color: 'bg-orange-500', chartColor: '#f97316', spent: 0, budget: 500000 },
];

export async function fetchExpenses(): Promise<ExpenseCategory[]> {
  if (!isServiceClientAvailable()) return defaultExpenses;

  try {
    const supabase = createServiceClient();
    const now = new Date();
    const currentMonth = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('month', currentMonth);

    if (error) throw error;
    if (!expenses || expenses.length === 0) return defaultExpenses;

    return (expenses as Expense[]).map((e) => ({
      id: e.id,
      percentage: e.percentage,
      label: e.label,
      description: e.description || '',
      color: e.color || 'bg-gray-500',
      chartColor: e.chart_color || '#6b7280',
      spent: e.spent,
      budget: e.budget,
    }));
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return defaultExpenses;
  }
}
