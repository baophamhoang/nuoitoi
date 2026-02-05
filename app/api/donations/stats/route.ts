import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Donation } from '@/lib/supabase/types';

// Mock stats data for when Supabase is not configured
const mockStats = {
  totalAmount: 2450000, // 2.45M VND
  donationCount: 47,
  monthlyGoal: 10000000, // 10M VND
  weeklyDonors: 12,
  averageDonation: 52128,
  lastUpdated: new Date().toISOString(),
};

// Helper to check if Supabase is configured (supports both old and new key names)
function isSupabaseConfigured(): boolean {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey);
}

// GET /api/donations/stats - Get donation statistics
export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    // Return mock data if Supabase is not configured
    const progressPercentage = Math.min(
      (mockStats.totalAmount / mockStats.monthlyGoal) * 100,
      100
    );

    return NextResponse.json({
      ...mockStats,
      progressPercentage: Number(progressPercentage.toFixed(1)),
      formattedTotal: mockStats.totalAmount.toLocaleString('vi-VN') + 'đ',
      formattedGoal: mockStats.monthlyGoal.toLocaleString('vi-VN') + 'đ',
      isMock: true,
    });
  }

  try {
    const supabase = await createClient();

    // Get total amount and count
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount, created_at');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const allDonations = (donations || []) as Pick<Donation, 'amount' | 'created_at'>[];
    const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = allDonations.length;

    // Calculate weekly donors (donations in the last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyDonors = allDonations.filter(
      (d) => new Date(d.created_at) >= oneWeekAgo
    ).length;

    // Calculate average donation
    const averageDonation = donationCount > 0 ? Math.round(totalAmount / donationCount) : 0;

    const monthlyGoal = 10000000; // 10M VND goal
    const progressPercentage = Math.min((totalAmount / monthlyGoal) * 100, 100);

    return NextResponse.json({
      totalAmount,
      donationCount,
      monthlyGoal,
      weeklyDonors,
      averageDonation,
      lastUpdated: new Date().toISOString(),
      progressPercentage: Number(progressPercentage.toFixed(1)),
      formattedTotal: totalAmount.toLocaleString('vi-VN') + 'đ',
      formattedGoal: monthlyGoal.toLocaleString('vi-VN') + 'đ',
    });
  } catch (error) {
    console.error('Failed to fetch donation stats:', error);
    // Fallback to mock data on error
    const progressPercentage = Math.min(
      (mockStats.totalAmount / mockStats.monthlyGoal) * 100,
      100
    );

    return NextResponse.json({
      ...mockStats,
      progressPercentage: Number(progressPercentage.toFixed(1)),
      formattedTotal: mockStats.totalAmount.toLocaleString('vi-VN') + 'đ',
      formattedGoal: mockStats.monthlyGoal.toLocaleString('vi-VN') + 'đ',
      isMock: true,
    });
  }
}
