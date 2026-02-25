import { NextResponse } from 'next/server';
import { getDb } from '@/lib/turso/client';
import { isTursoConfigured } from '@/lib/turso/env';
import type { DonationRow } from '@/lib/turso/types';

const mockStats = {
  totalAmount: 2450000,
  donationCount: 47,
  monthlyGoal: 10000000,
  weeklyDonors: 12,
  averageDonation: 52128,
  lastUpdated: new Date().toISOString(),
};

// GET /api/donations/stats - Get donation statistics
export async function GET() {
  if (!isTursoConfigured()) {
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
    const db = getDb();
    const result = await db.execute('SELECT amount, created_at FROM donations');

    const allDonations = result.rows as unknown as Pick<DonationRow, 'amount' | 'created_at'>[];
    const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = allDonations.length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyDonors = allDonations.filter(
      (d) => new Date(d.created_at) >= oneWeekAgo
    ).length;

    const averageDonation = donationCount > 0 ? Math.round(totalAmount / donationCount) : 0;

    const monthlyGoal = 10000000;
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
