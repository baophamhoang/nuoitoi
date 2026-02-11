'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Heart, Moon, Sun, Share2, ArrowUp, Gift, Snowflake } from 'lucide-react';
import { toast } from 'sonner';
import { triggerConfetti, triggerEmojiConfetti } from '@/lib/confetti';

import { useDonations } from '@/hooks/use-donations';
import { usePayment } from '@/hooks/use-payment';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useScrollProgress } from '@/hooks/use-scroll-progress';
import { useTypingEffect } from '@/hooks/use-typing-effect';

import { HeroSection } from '@/components/hero-section';
import { DonateFormSection } from '@/components/donate-form-section';
import { DonationsFeed } from '@/components/donations-feed';
import { FeaturesGrid } from '@/components/features-grid';
import { CommitmentsSection } from '@/components/commitments-section';
import { ComparisonSection } from '@/components/comparison-section';
import { SnowCanvas } from '@/components/snow-canvas';
import type { Donation, ExpenseCategory, DonationStats } from '@/lib/types';

// Dynamic imports for heavy components (Recharts, Payment Dialog)
const ExpenseBreakdown = dynamic(
  () => import('@/components/expense-breakdown').then((mod) => ({ default: mod.ExpenseBreakdown })),
  {
    ssr: false,
    loading: () => (
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="h-96 bg-white/80 rounded-xl animate-pulse" />
      </section>
    ),
  },
);

const PaymentDialog = dynamic(
  () => import('@/components/payment-dialog').then((mod) => ({ default: mod.PaymentDialog })),
  { ssr: false },
);

interface NuoiToiClientProps {
  initialDonations: Donation[];
  initialStats: DonationStats;
  initialExpenses: ExpenseCategory[];
}

export default function NuoiToiClient({
  initialDonations,
  initialStats,
  initialExpenses,
}: NuoiToiClientProps) {
  // Custom hooks — extracted from the old 780-line page.tsx
  const {
    recentDonations,
    totalDonations,
    setTotalDonations,
    donationCount,
    setDonationCount,
    monthlyGoal,
    celebrationMessage,
    checkMilestone,
  } = useDonations({ initialDonations, initialStats });

  const payment = usePayment();

  const { darkMode, toggleDarkMode } = useDarkMode();
  const autoScroll = useAutoScroll();
  const { scrollProgress, showScrollTop, scrollToTop } = useScrollProgress();
  const typedText = useTypingEffect('Minh Bạch 100% (Thật Đấy!)', 50, false);
  const [snowing, setSnowing] = useState(false);

  const scrollToQRCode = () => {
    document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Nuôi Tôi - Minh Bạch 100%!',
      text: 'Hãy nuôi tôi! Cam kết sao kê đầy đủ, minh bạch từng đồng!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Cảm ơn bạn đã chia sẻ!', { description: 'Lan tỏa yêu thương 💕' });
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast.success('Link đã được copy!', { description: 'Chia sẻ cho bạn bè nhé! 🎉' });
      }
    } catch (err) {
      console.log('Share failed:', err);
      toast.error('Không thể chia sẻ', { description: 'Vui lòng thử lại sau!' });
    }
  };

  const handleDemoClick = (type: 'donate' | 'count') => {
    if (type === 'donate') {
      const newTotal = totalDonations + 50000;
      setTotalDonations(newTotal);
      triggerEmojiConfetti();
      checkMilestone(newTotal);
      toast.success('+50,000đ!', { description: 'Cảm ơn bạn đã donate! 💕' });
    } else {
      setDonationCount((prev) => prev + 1);
      triggerConfetti();
      toast.success('+1 lượt donate!', { description: 'Thêm một người yêu thương! ❤️' });
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-500"
      style={{
        background: darkMode
          ? 'linear-gradient(to bottom right, #111827, #581c87, #111827)'
          : 'linear-gradient(to bottom right, #fdf2f8, #f5f3ff, #eff6ff)',
      }}
    >
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
        <div
          className="h-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Snow overlay */}
      {snowing && <SnowCanvas />}

      <div className="relative z-10">
        {/* Header */}
        <header
          className="text-center pt-12 pb-8 px-4 relative animate-fade-up"
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setSnowing((s) => !s)}
              className={`p-3 rounded-full backdrop-blur-sm border-2 hover:scale-110 transition-all duration-300 shadow-lg ${snowing ? 'bg-blue-100 dark:bg-blue-900/80 border-blue-300 dark:border-blue-400 shadow-blue-200 dark:shadow-blue-500/30' : 'bg-white/80 dark:bg-gray-800/80 border-pink-200 dark:border-pink-500 hover:shadow-pink-200 dark:hover:shadow-pink-500/30'}`}
              aria-label={snowing ? 'Stop snow' : 'Let it snow'}
            >
              <Snowflake className={`w-5 h-5 transition-all duration-300 ${snowing ? 'text-blue-500 animate-spin' : 'text-blue-400 dark:text-blue-300'}`} style={snowing ? { animationDuration: '3s' } : undefined} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-200 dark:hover:shadow-pink-500/30"
              aria-label="Share this page"
            >
              <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-200 dark:hover:shadow-pink-500/30"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
          <div className="inline-block mb-4 animate-bounce cursor-pointer hover:scale-125 transition-transform duration-300">
            <div className="text-6xl">🌱</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-gradient cursor-pointer hover:scale-110 transition-transform duration-300">
            NUÔI TÔI
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 font-medium hover:text-pink-600 transition-colors duration-300 cursor-pointer h-8">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>
        </header>

        <HeroSection
          totalDonations={totalDonations}
          donationCount={donationCount}
          monthlyGoal={monthlyGoal}
          isLoading={false}
          onScrollToQR={scrollToQRCode}
          onDemoClick={handleDemoClick}
        />

        <DonationsFeed
          ref={autoScroll.listRef}
          donations={recentDonations}
          isLoading={false}
          darkMode={darkMode}
          onMouseEnter={autoScroll.onMouseEnter}
          onMouseLeave={autoScroll.onMouseLeave}
        />

        <FeaturesGrid />

        <CommitmentsSection />

        <ComparisonSection />

        <DonateFormSection
          donateAmount={payment.donateAmount}
          donorName={payment.donorName}
          donorMessage={payment.donorMessage}
          isCreatingPayment={payment.isCreatingPayment}
          onAmountChange={payment.handleAmountChange}
          onNameChange={payment.setDonorName}
          onMessageChange={payment.setDonorMessage}
          onDonate={payment.createPayment}
        />

        <ExpenseBreakdown expenses={initialExpenses} />

        {/* Message from heart */}
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-2 border-pink-200 hover:border-pink-400 transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">
              <span className="inline-block animate-bounce">🎤</span> Lời Nhắn
              Từ Trái Tim
            </h2>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Trong thời đại mà{' '}
                <strong className="text-pink-600">&quot;từ thiện&quot;</strong>{' '}
                đã trở thành từ nhạy cảm,
              </p>
              <p className="text-2xl font-bold text-foreground mb-4">
                Tôi xin khẳng định:{' '}
                <span className="text-pink-600">HÃY NUÔI TÔI!</span>
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Tôi nghèo, tôi cần tiền, nhưng tôi KHÔNG MẤT LƯƠNG TÂM! Mỗi đồng
                tiền các bạn gửi, tôi sẽ chi tiêu rõ ràng, minh bạch như bụng
                đói của tôi vậy! 😭
              </p>
              <p className="text-sm text-muted-foreground italic mt-6">
                P/S: Tôi hứa sẽ không mua xe hơi bằng tiền donate. Vì... tôi
                chưa có bằng lái! 🚗❌
              </p>
            </div>
          </Card>
        </section>

        {/* Disclaimer */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <Card className="p-6 bg-yellow-50/80 backdrop-blur-sm border-2 border-yellow-300">
            <div className="flex gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <p className="font-bold text-yellow-800 mb-2">DISCLAIMER:</p>
                <p className="text-yellow-700">
                  Đây là trang web mang tính chất <strong>HÀI HƯỚC</strong>. Mọi
                  nội dung đều mang tính giải trí, không nhằm mục đích xúc phạm
                  hay chỉ trích bất kỳ cá nhân/tổ chức nào.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 px-4 text-muted-foreground">
          <p className="text-sm">
            Made with{' '}
            <Heart className="w-4 h-4 inline text-pink-500 animate-pulse" /> and
            lots of transparency
          </p>
        </footer>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={scrollToTop}
          className={`p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-500 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-purple-300 dark:hover:shadow-purple-500/30 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </button>

        <button
          onClick={scrollToQRCode}
          className="group p-4 rounded-full bg-linear-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-300/50 dark:shadow-pink-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-pink-400/50 animate-bounce"
          style={{ animationDuration: '2s' }}
          aria-label="Donate now"
        >
          <Gift className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
        </button>
      </div>

      {/* Milestone Celebration Message */}
      {celebrationMessage && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-2xl md:text-3xl font-bold text-center">
            {celebrationMessage}
          </div>
        </div>
      )}

      <PaymentDialog
        open={payment.showDialog}
        onOpenChange={payment.handleDialogOpenChange}
        isCreatingPayment={payment.isCreatingPayment}
        paymentStatus={payment.paymentStatus}
        paymentQR={payment.paymentQR}
        donateAmount={payment.donateAmount}
      />
    </div>
  );
}
