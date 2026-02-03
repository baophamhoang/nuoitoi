'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';
import Image from 'next/image';

export default function NuoiToiPage() {
  const [totalDonations, setTotalDonations] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; color: string; delay: number }>
  >([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const triggerConfetti = () => {
    const colors = [
      '#ec4899',
      '#8b5cf6',
      '#3b82f6',
      '#06b6d4',
      '#10b981',
      '#f59e0b',
    ];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 200,
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  const handleDonateClick = () => {
    triggerConfetti();
    setShowDialog(true);
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

  const expenses = [
    {
      percentage: 40,
      label: 'Ăn uống',
      description: 'Cơm, mì tôm, trứng, rau. KHÔNG có tôm hùm!',
      color: 'bg-pink-500',
    },
    {
      percentage: 20,
      label: 'Điện nước internet',
      description: 'Để sao kê cho anh chị',
      color: 'bg-purple-500',
    },
    {
      percentage: 15,
      label: 'Thuê nhà',
      description: 'Phòng trọ 15m², không phải penthouse',
      color: 'bg-blue-500',
    },
    {
      percentage: 10,
      label: 'Y tế',
      description: 'Thuốc cảm, vitamin C, khẩu trang',
      color: 'bg-green-500',
    },
    {
      percentage: 10,
      label: 'Học tập nâng cao',
      description: 'Sách, khóa học online để sao kê tốt hơn',
      color: 'bg-yellow-500',
    },
    {
      percentage: 5,
      label: 'Giải trí',
      description: 'Netflix? Không! Chỉ Youtube miễn phí thôi!',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header
          className={`text-center pt-12 pb-8 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
          <div className="inline-block mb-4 animate-bounce cursor-pointer hover:scale-125 transition-transform duration-300">
            <div className="text-6xl">🌱</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-gradient cursor-pointer hover:scale-110 transition-transform duration-300">
            NUÔI TÔI
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 font-medium hover:text-pink-600 transition-colors duration-300 cursor-pointer">
            Minh Bạch 100% (Thật Đấy!)
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
            <p className="text-center text-xl text-muted-foreground mb-8">
              Tôi hứa sao kê đầy đủ! 💯
            </p>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div
                className="bg-linear-to-br from-pink-500 to-rose-500 rounded-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:rotate-1 cursor-pointer active:scale-95 hover:shadow-2xl hover:shadow-pink-300"
                onClick={() => {
                  setTotalDonations((prev) => prev + 50000);
                  triggerConfetti();
                }}
              >
                <div className="text-3xl font-bold">
                  {totalDonations.toLocaleString()}đ
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
                }}
              >
                <div className="text-3xl font-bold">{donationCount}</div>
                <div className="text-sm opacity-90">Lượt Donate</div>
                <div className="text-xs mt-2 opacity-75">(Click để +1 ❤️)</div>
              </div>
              <div className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white transform hover:scale-110 transition-all duration-300 hover:rotate-1 cursor-pointer hover:shadow-2xl hover:shadow-blue-300 active:scale-95">
                <div className="text-3xl font-bold">10,000,000đ</div>
                <div className="text-sm opacity-90">Mục Tiêu Tháng</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient transition-all duration-1000"
                  style={{ width: `${(totalDonations / 10000000) * 100}%` }}
                />
              </div>
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
                className={`p-4 bg-white/80 backdrop-blur-sm border-l-4 border-pink-500 hover:border-purple-500 transition-all duration-300 hover:translate-x-2 hover:shadow-lg ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                style={{ transitionDelay: `${500 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-pink-500 shrink-0 mt-0.5" />
                  <p className="text-foreground">{commitment}</p>
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
        <section className="max-w-4xl mx-auto px-4 mb-16">
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
                <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center relative w-full h-full">
                    <p className="text-gray-600 font-medium w-full">
                      <Image alt="QR-code" src="/momo.jpg" fill={true}></Image>
                    </p>
                  </div>
                </div>
                <p className="text-center text-gray-600 font-medium">
                  Quét mã QR để nuôi tôi nhé!
                </p>
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
          <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              {expenses.map((expense, index) => (
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

      {/* Confetti Effect */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-3 h-3 animate-fall"
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}ms`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
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
            <DialogDescription className="text-center text-lg pt-4">
              <div className="space-y-4">
                <p className="text-2xl font-bold text-foreground animate-pulse">
                  Bạn chờ xíu nha.
                </p>
                <p
                  className="text-2xl font-bold text-foreground animate-pulse"
                  style={{ animationDelay: '150ms' }}
                >
                  Tôi code sắp xong rồi
                </p>
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
                <p className="text-sm text-muted-foreground mt-6">
                  (Thay QR code vào phần phía trên nhé! 😊)
                </p>
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
