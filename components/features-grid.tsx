'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, Eye, DollarSign, Smartphone } from 'lucide-react';

interface FeaturesGridProps {
  isVisible: boolean;
}

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

export function FeaturesGrid({ isVisible }: FeaturesGridProps) {
  return (
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
  );
}
