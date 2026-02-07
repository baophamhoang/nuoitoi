'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommitmentsSectionProps {
  isVisible: boolean;
}

const commitments = [
  'Sao kê mỗi ngày: Cập nhật lúc 6h sáng, đều như vắt tranh!',
  'Không giấu giếm: Từ tô phở 50k đến hộp sữa chua 8k đều được ghi chép tỉ mỉ!',
  'Có hóa đơn chứng từ: Chụp hình bill, quét mã vạch, lưu biên lai đầy đủ!',
  'Video unboxing: Mở từng gói mì tôm live trên Facebook cho anh chị xem!',
  'Hotline 24/7: Gọi hỏi tôi ăn gì bất cứ lúc nào, kể cả 3h sáng!',
  'Không block: Hỏi khó đến mấy cũng trả lời, không "đã xem" rồi im lặng!',
];

export function CommitmentsSection({ isVisible }: CommitmentsSectionProps) {
  return (
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
  );
}
