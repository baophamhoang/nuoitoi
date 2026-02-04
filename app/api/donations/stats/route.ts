import { NextResponse } from 'next/server';

// Mock stats data
// In a real app, this would come from a database aggregation
const mockStats = {
  totalAmount: 2450000, // 2.45M VND
  donationCount: 47,
  monthlyGoal: 10000000, // 10M VND
  weeklyDonors: 12,
  averageDonation: 52128,
  lastUpdated: new Date().toISOString(),
};

// GET /api/donations/stats - Get donation statistics
export async function GET() {
  // Calculate progress percentage
  const progressPercentage = Math.min(
    (mockStats.totalAmount / mockStats.monthlyGoal) * 100,
    100
  );

  return NextResponse.json({
    ...mockStats,
    progressPercentage: Number(progressPercentage.toFixed(1)),
    formattedTotal: mockStats.totalAmount.toLocaleString('vi-VN') + 'đ',
    formattedGoal: mockStats.monthlyGoal.toLocaleString('vi-VN') + 'đ',
  });
}
