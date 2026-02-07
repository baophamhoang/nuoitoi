'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Heart, Moon, Sun, Share2, ArrowUp, Gift } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { toast } from 'sonner';
import {
  triggerConfetti,
  triggerMegaCelebration,
  triggerEmojiConfetti,
} from '@/lib/confetti';

import { HeroSection } from '@/components/hero-section';
import { DonateFormSection } from '@/components/donate-form-section';
import { PaymentDialog } from '@/components/payment-dialog';
import { DonationsFeed } from '@/components/donations-feed';
import { ExpenseBreakdown } from '@/components/expense-breakdown';
import { FeaturesGrid } from '@/components/features-grid';
import { CommitmentsSection } from '@/components/commitments-section';
import { ComparisonSection } from '@/components/comparison-section';

interface Donation {
  id: string;
  name: string;
  amount: number;
  message: string;
  time: string;
}

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

export default function NuoiToiPage() {
  const [totalDonations, setTotalDonations] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(10000000);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(
    null,
  );
  const [lastMilestone, setLastMilestone] = useState(0);
  const [isHoveringDonations, setIsHoveringDonations] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [donateAmount, setDonateAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [paymentOrderCode, setPaymentOrderCode] = useState<number | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'pending' | 'paid' | 'error'
  >('idle');
  const donationsListRef = useRef<HTMLDivElement>(null);
  const scrollDirectionRef = useRef<'down' | 'up'>('down');
  const scrollAnimationRef = useRef<number | null>(null);
  const fullText = 'Minh Bạch 100% (Thật Đấy!)';

  // Auto-scroll donations list
  const animateScroll = useCallback(() => {
    if (!donationsListRef.current || isHoveringDonations) {
      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      return;
    }

    const container = donationsListRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const scrollSpeed = 0.5;

    if (scrollDirectionRef.current === 'down') {
      container.scrollTop += scrollSpeed;
      if (container.scrollTop >= maxScroll) {
        scrollDirectionRef.current = 'up';
      }
    } else {
      container.scrollTop -= scrollSpeed;
      if (container.scrollTop <= 0) {
        scrollDirectionRef.current = 'down';
      }
    }

    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
  }, [isHoveringDonations]);

  useEffect(() => {
    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [animateScroll]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [donationsRes, statsRes, expensesRes] = await Promise.all([
          fetch('/api/donations'),
          fetch('/api/donations/stats'),
          fetch('/api/expenses'),
        ]);

        const [donationsData, statsData, expensesData] = await Promise.all([
          donationsRes.json(),
          statsRes.json(),
          expensesRes.json(),
        ]);

        console.log(
          'donationsData, statsData, expensesData :>> ',
          donationsData,
          statsData,
          expensesData,
        );

        if (donationsData.donations) {
          setRecentDonations(donationsData.donations);
        }

        if (statsData) {
          setTotalDonations(statsData.totalAmount || 0);
          setDonationCount(statsData.donationCount || 0);
          setMonthlyGoal(statsData.monthlyGoal || 10000000);
          const percentage =
            ((statsData.totalAmount || 0) /
              (statsData.monthlyGoal || 10000000)) *
            100;
          if (percentage >= 100) setLastMilestone(100);
          else if (percentage >= 75) setLastMilestone(75);
          else if (percentage >= 50) setLastMilestone(50);
          else if (percentage >= 25) setLastMilestone(25);
        }

        if (expensesData.categories) {
          setExpenses(expensesData.categories);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Supabase realtime subscription for donations
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();

    const channel = supabase
      .channel('donations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload) => {
          const newDonation = payload.new as {
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

          setRecentDonations((prev) =>
            [formattedDonation, ...prev].slice(0, 20),
          );

          setTotalDonations((prev) => {
            const newTotal = prev + newDonation.amount;
            checkMilestone(newTotal);
            return newTotal;
          });
          setDonationCount((prev) => prev + 1);

          toast.success(
            `${newDonation.name || 'Ẩn danh'} vừa donate ${newDonation.amount.toLocaleString()}đ!`,
            {
              description: newDonation.message || 'Cảm ơn bạn!',
              duration: 5000,
            },
          );

          triggerConfetti();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    setIsVisible(true);
    const loadTimer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(loadTimer);
  }, []);

  // Typing effect for hero text
  useEffect(() => {
    if (isLoading) return;
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, [isLoading]);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (paymentStatus !== 'pending' || !paymentOrderCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payos/status/${paymentOrderCode}`);
        const data = await res.json();

        if (data.status === 'PAID') {
          setPaymentStatus('paid');
          setShowDialog(false);
          triggerMegaCelebration();

          try {
            await fetch('/api/donations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: Number(donateAmount.replace(/\D/g, '')),
                name: donorName || undefined,
                message: donorMessage || undefined,
              }),
            });
          } catch (error) {
            toast.error(
              'Chưa thể ghi nhận donation vào hệ thống. Chúng tôi sẽ cập nhật sau.',
            );
            console.error('Failed to record donation:', error);
          }

          toast.success('Thanh toán thành công!', {
            description: 'Cảm ơn bạn đã ủng hộ!',
            duration: 8000,
          });
          // Reset form
          setDonateAmount('');
          setDonorName('');
          setDonorMessage('');
          setPaymentQR(null);
          setPaymentOrderCode(null);

          // Re-fetch donations to ensure the list is fresh
          try {
            const donationsRes = await fetch('/api/donations');
            const donationsData = await donationsRes.json();
            if (donationsData.donations) {
              setRecentDonations(donationsData.donations);
            }
            const statsRes = await fetch('/api/donations/stats');
            const statsData = await statsRes.json();
            if (statsData) {
              setTotalDonations(statsData.totalAmount || 0);
              setDonationCount(statsData.donationCount || 0);
            }
          } catch {
            // Silently ignore re-fetch errors — realtime will catch up
          }
        } else if (data.status === 'CANCELLED' || data.status === 'EXPIRED') {
          setPaymentStatus('error');
          toast.error('Thanh toán đã hủy hoặc hết hạn');
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentStatus, paymentOrderCode]);

  // Check for milestone achievements
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
        if (
          percentage >= milestone.threshold &&
          lastMilestone < milestone.threshold
        ) {
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

  const handleDonateClick = async () => {
    const amount = Number(donateAmount.replace(/\D/g, ''));
    if (!amount || amount < 2000) {
      toast.error('Số tiền tối thiểu là 2.000đ');
      return;
    }

    setIsCreatingPayment(true);
    setPaymentStatus('idle');
    setPaymentQR(null);
    setShowDialog(true);

    try {
      const res = await fetch('/api/payos/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          name: donorName || undefined,
          message: donorMessage || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment creation failed');
      }

      setPaymentQR(data.qrCode);
      setPaymentOrderCode(data.orderCode);
      setPaymentStatus('pending');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Không thể tạo mã QR', {
        description: 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  // Format VND input
  const handleAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits) {
      setDonateAmount(Number(digits).toLocaleString('vi-VN'));
    } else {
      setDonateAmount('');
    }
  };

  const scrollToQRCode = () => {
    const qrSection = document.getElementById('donate-section');
    if (qrSection) {
      qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
        toast.success('Cảm ơn bạn đã chia sẻ!', {
          description: 'Lan tỏa yêu thương 💕',
        });
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`,
        );
        toast.success('Link đã được copy!', {
          description: 'Chia sẻ cho bạn bè nhé! 🎉',
        });
      }
    } catch (err) {
      console.log('Share failed:', err);
      toast.error('Không thể chia sẻ', {
        description: 'Vui lòng thử lại sau!',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoClick = (type: 'donate' | 'count') => {
    if (type === 'donate') {
      const newTotal = totalDonations + 50000;
      setTotalDonations(newTotal);
      triggerEmojiConfetti();
      checkMilestone(newTotal);
      toast.success('+50,000đ!', {
        description: 'Cảm ơn bạn đã donate! 💕',
      });
    } else {
      setDonationCount((prev) => prev + 1);
      triggerConfetti();
      toast.success('+1 lượt donate!', {
        description: 'Thêm một người yêu thương! ❤️',
      });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      setPaymentStatus('idle');
      setPaymentQR(null);
      setPaymentOrderCode(null);
    }
  };

  // Default expenses for fallback
  const defaultExpenses: ExpenseCategory[] = [
    {
      id: 'food',
      percentage: 40,
      label: 'Ăn uống',
      description: 'Cơm, mì tôm, trứng, rau. KHÔNG có tôm hùm!',
      color: 'bg-pink-500',
      chartColor: '#ec4899',
      spent: 0,
      budget: 4000000,
    },
    {
      id: 'utilities',
      percentage: 20,
      label: 'Điện nước internet',
      description: 'Để sao kê cho anh chị',
      color: 'bg-purple-500',
      chartColor: '#a855f7',
      spent: 0,
      budget: 2000000,
    },
    {
      id: 'rent',
      percentage: 15,
      label: 'Thuê nhà',
      description: 'Phòng trọ 15m², không phải penthouse',
      color: 'bg-blue-500',
      chartColor: '#3b82f6',
      spent: 0,
      budget: 1500000,
    },
    {
      id: 'health',
      percentage: 10,
      label: 'Y tế',
      description: 'Thuốc cảm, vitamin C, khẩu trang',
      color: 'bg-green-500',
      chartColor: '#22c55e',
      spent: 0,
      budget: 1000000,
    },
    {
      id: 'learning',
      percentage: 10,
      label: 'Học tập nâng cao',
      description: 'Sách, khóa học online để sao kê tốt hơn',
      color: 'bg-yellow-500',
      chartColor: '#eab308',
      spent: 0,
      budget: 1000000,
    },
    {
      id: 'entertainment',
      percentage: 5,
      label: 'Giải trí',
      description: 'Netflix? Không! Chỉ Youtube miễn phí thôi!',
      color: 'bg-orange-500',
      chartColor: '#f97316',
      spent: 0,
      budget: 500000,
    },
  ];

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

      <div className="relative z-10">
        {/* Header */}
        <header
          className={`text-center pt-12 pb-8 px-4 transition-all duration-1000 relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-200 dark:hover:shadow-pink-500/30"
              aria-label="Share this page"
            >
              <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-200 dark:hover:shadow-pink-500/30"
              aria-label={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
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
          isLoading={isLoading}
          isVisible={isVisible}
          onScrollToQR={scrollToQRCode}
          onDemoClick={handleDemoClick}
        />

        <DonationsFeed
          ref={donationsListRef}
          donations={recentDonations}
          isLoading={isLoading}
          isVisible={isVisible}
          darkMode={darkMode}
          onMouseEnter={() => setIsHoveringDonations(true)}
          onMouseLeave={() => setIsHoveringDonations(false)}
        />

        <FeaturesGrid isVisible={isVisible} />

        <CommitmentsSection isVisible={isVisible} />

        <ComparisonSection />

        <DonateFormSection
          donateAmount={donateAmount}
          donorName={donorName}
          donorMessage={donorMessage}
          isCreatingPayment={isCreatingPayment}
          onAmountChange={handleAmountChange}
          onNameChange={setDonorName}
          onMessageChange={setDonorMessage}
          onDonate={handleDonateClick}
        />

        <ExpenseBreakdown
          expenses={expenses}
          defaultExpenses={defaultExpenses}
        />

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
        open={showDialog}
        onOpenChange={handleDialogOpenChange}
        isCreatingPayment={isCreatingPayment}
        paymentStatus={paymentStatus}
        paymentQR={paymentQR}
        donateAmount={donateAmount}
      />

      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 3s linear forwards;
        }
      `}</style>
    </div>
  );
}
