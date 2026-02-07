'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

export function ComparisonSection() {
  return (
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
  );
}
