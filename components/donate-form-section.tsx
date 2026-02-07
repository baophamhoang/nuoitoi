'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Loader2 } from 'lucide-react';

interface DonateFormSectionProps {
  donateAmount: string;
  donorName: string;
  donorMessage: string;
  isCreatingPayment: boolean;
  onAmountChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onDonate: () => void;
}

export function DonateFormSection({
  donateAmount,
  donorName,
  donorMessage,
  isCreatingPayment,
  onAmountChange,
  onNameChange,
  onMessageChange,
  onDonate,
}: DonateFormSectionProps) {
  return (
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

          {/* Donation form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md mx-auto mb-8 transform hover:scale-105 transition-all duration-300">
            <div className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền (VNĐ) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={donateAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="50.000"
                    className="w-full px-4 py-3 text-lg font-bold text-pink-600 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors bg-pink-50/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">đ</span>
                </div>
                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-2">
                  {[10000, 50000, 100000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => onAmountChange(String(amt))}
                      className="flex-1 py-1.5 text-xs font-medium text-pink-600 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      {amt.toLocaleString('vi-VN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên (tùy chọn)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Ẩn danh"
                  className="w-full px-4 py-2 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Message input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lời nhắn (tùy chọn)
                </label>
                <input
                  type="text"
                  value={donorMessage}
                  onChange={(e) => onMessageChange(e.target.value)}
                  placeholder="Cố lên nhé!"
                  className="w-full px-4 py-2 text-gray-700 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onDonate}
              disabled={isCreatingPayment}
              className="bg-white text-pink-600 hover:bg-gray-100 font-bold text-lg transform hover:scale-110 transition-all duration-300 hover:shadow-2xl disabled:opacity-70 disabled:hover:scale-100"
            >
              {isCreatingPayment ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Heart className="w-5 h-5 mr-2 animate-bounce" />
              )}
              {isCreatingPayment ? 'ĐANG TẠO MÃ QR...' : 'TÔI MUỐN NUÔI BẠN!'}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
