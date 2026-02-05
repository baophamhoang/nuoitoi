'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  TrendingUp,
  Eye,
  Smartphone,
  CheckCircle2,
  XCircle,
  Heart,
  DollarSign,
  Moon,
  Sun,
  Share2,
  ArrowUp,
  Gift,
} from 'lucide-react';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  triggerConfetti,
  triggerConfettiCannon,
  triggerMegaCelebration,
  triggerEmojiConfetti,
} from '@/lib/confetti';

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
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [lastMilestone, setLastMilestone] = useState(0);
  const [isHoveringDonations, setIsHoveringDonations] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [typedText, setTypedText] = useState('');
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
    const scrollSpeed = 0.5; // pixels per frame

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
        // Fetch donations, stats, and expenses in parallel
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

        // Set donations
        if (donationsData.donations) {
          setRecentDonations(donationsData.donations);
        }

        // Set stats
        if (statsData) {
          setTotalDonations(statsData.totalAmount || 0);
          setDonationCount(statsData.donationCount || 0);
          setMonthlyGoal(statsData.monthlyGoal || 10000000);
          // Set initial milestone based on current progress
          const percentage = ((statsData.totalAmount || 0) / (statsData.monthlyGoal || 10000000)) * 100;
          if (percentage >= 100) setLastMilestone(100);
          else if (percentage >= 75) setLastMilestone(75);
          else if (percentage >= 50) setLastMilestone(50);
          else if (percentage >= 25) setLastMilestone(25);
        }

        // Set expenses
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
    // Only set up realtime if Supabase is configured
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
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

          // Update donations list
          const formattedDonation: Donation = {
            id: newDonation.id,
            name: newDonation.name || 'Ẩn danh',
            amount: newDonation.amount,
            message: newDonation.message || '',
            time: 'Vừa xong',
          };

          setRecentDonations((prev) => [formattedDonation, ...prev].slice(0, 20));

          // Update totals
          setTotalDonations((prev) => {
            const newTotal = prev + newDonation.amount;
            checkMilestone(newTotal);
            return newTotal;
          });
          setDonationCount((prev) => prev + 1);

          // Show toast notification
          toast.success(
            `${newDonation.name || 'Ẩn danh'} vừa donate ${newDonation.amount.toLocaleString()}đ!`,
            {
              description: newDonation.message || 'Cảm ơn bạn!',
              duration: 5000,
            }
          );

          // Trigger confetti
          triggerConfetti();
        }
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
    // Simulate loading
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
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for milestone achievements
  const checkMilestone = useCallback((newTotal: number) => {
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
        triggerMegaCelebration(); // MEGA confetti for milestones!
        setTimeout(() => setCelebrationMessage(null), 4000);
        break;
      }
    }
  }, [lastMilestone, monthlyGoal]);

  const handleDonateClick = () => {
    triggerConfettiCannon();
    setShowDialog(true);
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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
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

  const features = [
    {
      icon: TrendingUp,
      title: 'Sao Kê Realtime',
      description:
        'Cập nhật từng giây! Còn nhanh hơn cả tốc độ bạn chuyển tiền!',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Eye,
      title: 'Minh Bạch 300%',
      description: 'Hơn cả 100%! Tôi còn báo cáo cả việc mua ly trà sữa!',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: DollarSign,
      title: 'Chi Tiêu Hợp Lý',
      description: 'Không mua xe hơi, nhà cửa. Chỉ ăn cơm với mì tôm thôi!',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Smartphone,
      title: 'App Tracking',
      description:
        'Theo dõi 24/7 tôi ăn gì, uống gì, đi đâu. Như "Big Brother" vậy!',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const commitments = [
    'Sao kê mỗi ngày: Cập nhật lúc 6h sáng, đều như vắt tranh!',
    'Không giấu giếm: Từ tô phở 50k đến hộp sữa chua 8k đều được ghi chép tỉ mỉ!',
    'Có hóa đơn chứng từ: Chụp hình bill, quét mã vạch, lưu biên lai đầy đủ!',
    'Video unboxing: Mở từng gói mì tôm live trên Facebook cho anh chị xem!',
    'Hotline 24/7: Gọi hỏi tôi ăn gì bất cứ lúc nào, kể cả 3h sáng!',
    'Không block: Hỏi khó đến mấy cũng trả lời, không "đã xem" rồi im lặng!',
  ];

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

  // Use fetched expenses or fallback to defaults
  const displayExpenses = expenses.length > 0 ? expenses : defaultExpenses;

  // Data for pie chart
  const pieChartData = displayExpenses.map((expense) => ({
    name: expense.label,
    value: expense.percentage,
    color: expense.chartColor,
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-500"
      style={{
        background: darkMode
          ? 'linear-gradient(to bottom right, #111827, #581c87, #111827)'
          : 'linear-gradient(to bottom right, #fdf2f8, #f5f3ff, #eff6ff)'
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
          {/* Header buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-500 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-200 dark:hover:shadow-pink-500/30"
              aria-label="Share this page"
            >
              <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
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

        {/* Hero Section */}
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
                onClick={scrollToQRCode}
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
                onClick={() => {
                  const newTotal = totalDonations + 50000;
                  setTotalDonations(newTotal);
                  triggerEmojiConfetti();
                  checkMilestone(newTotal);
                  toast.success('+50,000đ!', {
                    description: 'Cảm ơn bạn đã donate! 💕',
                  });
                }}
              >
                <div className="text-3xl font-bold">
                  {isLoading ? '...' : `${totalDonations.toLocaleString()}đ`}
                </div>
                <div className="text-sm opacity-90">Tổng Đã Nhận</div>
                <div className="text-xs mt-2 opacity-75">
                  (Click để donate 50k 😉)
                </div>
              </div>
              <div
                className="bg-linear-to-br from-purple-500 to-indigo-500 rounded-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:-rotate-1 cursor-pointer active:scale-95 hover:shadow-2xl hover:shadow-purple-300"
                onClick={() => {
                  setDonationCount((prev) => prev + 1);
                  triggerConfetti();
                  toast.success('+1 lượt donate!', {
                    description: 'Thêm một người yêu thương! ❤️',
                  });
                }}
              >
                <div className="text-3xl font-bold">{isLoading ? '...' : donationCount}</div>
                <div className="text-sm opacity-90">Lượt Donate</div>
                <div className="text-xs mt-2 opacity-75">(Click để +1 ❤️)</div>
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

        {/* Recent Donations Feed */}
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            <span className="inline-block animate-pulse">💝</span> Những Người Đã Nuôi Tôi
          </h2>
          <Card
            className="p-4 md:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden"
            onMouseEnter={() => setIsHoveringDonations(true)}
            onMouseLeave={() => setIsHoveringDonations(false)}
          >
            <div
              ref={donationsListRef}
              className="space-y-3 max-h-64 overflow-y-auto overflow-x-hidden pr-2 scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-pink-100 dark:border-pink-800"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : (
                recentDonations.map((donation, index) => (
                  <div
                    key={donation.id}
                    className={`flex items-center justify-between p-3 rounded-lg border border-pink-100 dark:border-pink-800 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                      background: darkMode
                        ? 'linear-gradient(to right, rgba(157, 23, 77, 0.2), rgba(126, 34, 206, 0.2))'
                        : 'linear-gradient(to right, #fdf2f8, #faf5ff)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-12"
                        style={{ background: 'linear-gradient(to bottom right, #f472b6, #a855f7)' }}
                      >
                        {donation.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{donation.name}</div>
                        {donation.message && (
                          <div className="text-sm text-muted-foreground truncate">&quot;{donation.message}&quot;</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-bold text-pink-600 dark:text-pink-400">
                        +{donation.amount.toLocaleString()}đ
                      </div>
                      <div className="text-xs text-muted-foreground">{donation.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              {recentDonations.length} người đã donate tuần này
            </div>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            <span className="inline-block animate-bounce">🎯</span> Tại Sao Nên
            Nuôi Tôi?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 bg-white/80 backdrop-blur-sm border-2 hover:border-pink-300 transition-all duration-500 hover:scale-105 hover:shadow-2xl group cursor-pointer ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Commitments */}
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            <span className="inline-block animate-bounce">🎪</span> Cam Kết Vàng
            Của Tôi:
          </h2>
          <div className="space-y-4">
            {commitments.map((commitment, index) => (
              <Card
                key={index}
                className={`group p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l-4 border-pink-500 hover:border-purple-500 transition-all duration-300 hover:translate-x-2 hover:shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-purple-500/20 hover:bg-white dark:hover:bg-gray-800 cursor-pointer ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                style={{ transitionDelay: `${500 + index * 100}ms` }}
                onClick={() => {
                  toast.success('Cam kết vàng!', {
                    description: commitment.slice(0, 50) + '...',
                  });
                }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-pink-500 shrink-0 mt-0.5 transition-all duration-300 group-hover:text-purple-500 group-hover:scale-125 group-hover:rotate-12" />
                  <p className="text-foreground transition-colors duration-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">{commitment}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            So Sánh Với &quot;Người Khác&quot;
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nguoi Khac */}
            <Card className="p-6 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
                <h3 className="text-2xl font-bold text-red-600">Người Khác</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span className="text-red-700">
                    Sao kê sau 3 năm (hoặc không bao giờ)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span className="text-red-700">
                    File Excel blur mờ như ảnh ma
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span className="text-red-700">
                    Số liệu &quot;làm tròn&quot; theo kiểu 1 + 1 = 3
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span className="text-red-700">
                    Block người hỏi nhanh như chớp
                  </span>
                </li>
              </ul>
            </Card>

            {/* Nuoi Toi */}
            <Card className="p-6 bg-green-50/80 backdrop-blur-sm border-2 border-green-200 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <h3 className="text-2xl font-bold text-green-600">Nuôi Tôi</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span className="text-green-700">
                    Sao kê trước khi tiêu (để anh chị duyệt)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span className="text-green-700">
                    File Excel 4K Ultra HD, có chữ ký điện tử
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span className="text-green-700">
                    Số liệu chính xác đến từng đồng
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span className="text-green-700">
                    Trả lời inbox nhanh hơn cả chatbot
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Donation CTA */}
        <section id="donate-section" className="max-w-4xl mx-auto px-4 mb-16">
          <Card className="p-8 md:p-12 bg-linear-to-br from-pink-500 via-purple-500 to-blue-500 text-white border-0 shadow-2xl animate-gradient overflow-hidden relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 animate-pulse">
                DONATE NGAY ĐI!
              </h2>
              <p className="text-center text-xl mb-8">
                Cao nhân làm ơn giúp đỡ !!!
              </p>

              {/* QR Code placeholder */}
              <div className="bg-white rounded-2xl p-8 max-w-md mx-auto mb-8 transform hover:scale-105 transition-all duration-300 hover:rotate-2">
                <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 relative">
                  <Image alt="QR-code" src="/momo.jpg" fill={true} className="rounded-xl object-cover" />
                </div>
                <div className="text-center text-gray-600 font-medium">
                  Quét mã QR để nuôi tôi nhé!
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleDonateClick}
                  className="bg-white text-pink-600 hover:bg-gray-100 font-bold text-lg transform hover:scale-110 transition-all duration-300 hover:shadow-2xl animate-pulse"
                >
                  <Heart className="w-5 h-5 mr-2 animate-bounce" />
                  TÔI MUỐN NUÔI BẠN!
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDonateClick}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-600 font-bold text-lg transform hover:scale-110 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  SAO KÊ NGAY
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Expense Breakdown */}
        <section className="max-w-4xl mx-auto px-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            <span className="inline-block animate-bounce">📈</span> Tôi Sẽ Dùng
            Tiền Vào Đâu?
          </h2>
          <Card className="p-6 md:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            {/* Pie Chart */}
            <div className="mb-8">
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {displayExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${expense.color}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {expense.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-6">
              {displayExpenses.map((expense, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground">
                        {expense.percentage}%
                      </span>
                      <div>
                        <div className="font-bold text-foreground">
                          {expense.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {expense.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${expense.color} transition-all duration-1000 group-hover:animate-pulse`}
                      style={{
                        width: `${expense.percentage}%`,
                        transitionDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

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
                <strong className="text-pink-600">&quot;từ thiện&quot;</strong> đã trở
                thành từ nhạy cảm,
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
        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-500 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-purple-300 dark:hover:shadow-purple-500/30 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </button>

        {/* Floating Donate Button */}
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

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-linear-to-br from-pink-100 via-purple-100 to-blue-100 border-4 border-pink-300">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              <span className="inline-block animate-bounce text-4xl mb-2">
                🚧
              </span>
              <br />
              Chờ xíu nhé!
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-center text-lg pt-4 space-y-4">
                <span className="block text-2xl font-bold text-foreground animate-pulse">
                  Bạn chờ xíu nha.
                </span>
                <span
                  className="block text-2xl font-bold text-foreground animate-pulse"
                  style={{ animationDelay: '150ms' }}
                >
                  Tôi code sắp xong rồi
                </span>
                <div className="flex justify-center gap-1 mt-6">
                  <div
                    className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="block text-sm text-muted-foreground mt-6">
                  (Quét đỡ QR code phía trên nhé! 😊)
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

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
