'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface HeroSectionProps {
  totalDonations: number;
  donationCount: number;
  monthlyGoal: number;
  isLoading: boolean;
  isVisible: boolean;
  onScrollToQR: () => void;
  onDemoClick: (type: 'donate' | 'count') => void;
}

export function HeroSection({
  totalDonations,
  donationCount,
  monthlyGoal,
  isLoading,
  isVisible,
  onScrollToQR,
  onDemoClick,
}: HeroSectionProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 mb-16">
      <Card
        className={`p-8 md:p-12 bg-white/80 backdrop-blur-sm border-2 shadow-2xl transition-all duration-1000 delay-200 hover:scale-105 hover:shadow-pink-200/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          HÃY NUÔI TÔI
        </h2>
        <p className="text-center text-xl text-muted-foreground mb-4">
          Tôi hứa sao kê đầy đủ! 💯
        </p>
        <div className="text-center mb-8">
          <Button
            onClick={onScrollToQR}
            className="bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transform hover:scale-105 transition-all duration-300"
          >
            <Heart className="w-4 h-4 mr-2" />
            Donate Ngay
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div
            className="bg-linear-to-br from-pink-500 to-rose-500 rounded-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:rotate-1 cursor-pointer active:scale-95 hover:shadow-2xl hover:shadow-pink-300"
            onClick={() => onDemoClick('donate')}
          >
            <div className="text-3xl font-bold">
              {isLoading ? '...' : `${totalDonations.toLocaleString()}đ`}
            </div>
            <div className="text-sm opacity-90">Tổng Đã Nhận</div>
            <div className="text-xs mt-2 opacity-75">
              (Click để &quot;thử&quot; donate 50k 😉)
            </div>
          </div>
          <div
            className="bg-linear-to-br from-purple-500 to-indigo-500 rounded-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:-rotate-1 cursor-pointer active:scale-95 hover:shadow-2xl hover:shadow-purple-300"
            onClick={() => onDemoClick('count')}
          >
            <div className="text-3xl font-bold">{isLoading ? '...' : donationCount}</div>
            <div className="text-sm opacity-90">Lượt Donate</div>
            <div className="text-xs mt-2 opacity-75">(Click để &quot;thử&quot; +1 ❤️)</div>
          </div>
          <div className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:rotate-1 cursor-pointer hover:shadow-2xl hover:shadow-blue-300 active:scale-95">
            <div className="text-3xl font-bold">{monthlyGoal.toLocaleString()}đ</div>
            <div className="text-sm opacity-90">Mục Tiêu Tháng</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{((totalDonations / monthlyGoal) * 100).toFixed(1)}% hoàn thành</span>
            <span>{totalDonations.toLocaleString()}đ / {monthlyGoal.toLocaleString()}đ</span>
          </div>
          <div className="h-6 bg-muted rounded-full overflow-hidden relative">
            <div
              className="h-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient transition-all duration-1000"
              style={{ width: `${Math.min((totalDonations / monthlyGoal) * 100, 100)}%` }}
            />
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute h-full w-0.5 bg-white/30"
                  style={{ left: `${milestone}%` }}
                />
              ))}
            </div>
          </div>
          {/* Milestone labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>
    </section>
  );
}
