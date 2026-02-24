'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { triggerConfetti, triggerMegaCelebration } from '@/lib/confetti';
import type { Donation, DonationStats } from '@/lib/types';

interface UseDonationsOptions {
  initialDonations: Donation[];
  initialStats: DonationStats;
}

export function useDonations({ initialDonations, initialStats }: UseDonationsOptions) {
  const [recentDonations, setRecentDonations] = useState<Donation[]>(initialDonations);
  const [totalDonations, setTotalDonations] = useState(initialStats.totalAmount);
  const [donationCount, setDonationCount] = useState(initialStats.donationCount);
  const [monthlyGoal] = useState(initialStats.monthlyGoal);
  const [lastMilestone, setLastMilestone] = useState(() => {
    const percentage = (initialStats.totalAmount / initialStats.monthlyGoal) * 100;
    if (percentage >= 100) return 100;
    if (percentage >= 75) return 75;
    if (percentage >= 50) return 50;
    if (percentage >= 25) return 25;
    return 0;
  });
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const checkMilestone = useCallback(
    (newTotal: number) => {
      const percentage = (newTotal / monthlyGoal) * 100;
      const milestones = [
        { threshold: 25, message: '🎉 Đạt 25%! Cảm ơn các bạn!' },
        { threshold: 50, message: '🔥 Nửa đường rồi! 50% hoàn thành!' },
        { threshold: 75, message: '🚀 75%! Sắp về đích!' },
        { threshold: 100, message: '🏆 HOÀN THÀNH! Cảm ơn tất cả!' },
      ];

      for (const milestone of milestones) {
        if (percentage >= milestone.threshold && lastMilestone < milestone.threshold) {
          setLastMilestone(milestone.threshold);
          setCelebrationMessage(milestone.message);
          triggerMegaCelebration();
          setTimeout(() => setCelebrationMessage(null), 4000);
          break;
        }
      }
    },
    [lastMilestone, monthlyGoal],
  );

  // SSE real-time subscription replacing Supabase postgres_changes
  useEffect(() => {
    const eventSource = new EventSource('/api/donations/stream');

    eventSource.onmessage = (event) => {
      const newDonation = JSON.parse(event.data) as {
        id: string;
        name: string;
        amount: number;
        message: string | null;
        created_at: string;
      };

      const formattedDonation: Donation = {
        id: newDonation.id,
        name: newDonation.name || 'Ẩn danh',
        amount: newDonation.amount,
        message: newDonation.message || '',
        time: 'Vừa xong',
      };

      setRecentDonations((prev) => [formattedDonation, ...prev].slice(0, 20));
      setTotalDonations((prev) => {
        const newTotal = prev + newDonation.amount;
        checkMilestone(newTotal);
        return newTotal;
      });
      setDonationCount((prev) => prev + 1);

      toast.success(
        `${newDonation.name || 'Ẩn danh'} vừa donate ${newDonation.amount.toLocaleString()}đ!`,
        { description: newDonation.message || 'Cảm ơn bạn!', duration: 5000 },
      );
      triggerConfetti();
    };

    eventSource.onerror = () => {
      // Browser will auto-reconnect on error; no action needed
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchDonations = useCallback(async () => {
    try {
      const [donationsRes, statsRes] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/donations/stats'),
      ]);
      const [donationsData, statsData] = await Promise.all([
        donationsRes.json(),
        statsRes.json(),
      ]);
      if (donationsData.donations) setRecentDonations(donationsData.donations);
      if (statsData) {
        setTotalDonations(statsData.totalAmount || 0);
        setDonationCount(statsData.donationCount || 0);
      }
    } catch {
      // Silently ignore — realtime will catch up
    }
  }, []);

  return {
    recentDonations,
    totalDonations,
    setTotalDonations,
    donationCount,
    setDonationCount,
    monthlyGoal,
    celebrationMessage,
    checkMilestone,
    refetchDonations,
  };
}
