'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCreatingPayment: boolean;
  paymentStatus: 'idle' | 'pending' | 'paid' | 'error';
  paymentQR: string | null;
  donateAmount: string;
}

export function PaymentDialog({
  open,
  onOpenChange,
  isCreatingPayment,
  paymentStatus,
  paymentQR,
  donateAmount,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-br from-pink-100 via-purple-100 to-blue-100 border-4 border-pink-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            {isCreatingPayment
              ? 'Đang tạo mã QR...'
              : paymentStatus === 'error'
                ? 'Có lỗi xảy ra'
                : 'Quét mã để thanh toán'}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center pt-4 space-y-4">
              {isCreatingPayment && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                  <span className="text-lg text-muted-foreground">
                    Đang kết nối PayOS...
                  </span>
                </div>
              )}

              {paymentStatus === 'error' && !isCreatingPayment && (
                <div className="py-8 space-y-4">
                  <div className="text-5xl">😢</div>
                  <p className="text-lg text-muted-foreground">
                    Không thể tạo mã thanh toán. Vui lòng thử lại.
                  </p>
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    Đóng
                  </Button>
                </div>
              )}

              {paymentQR && paymentStatus === 'pending' && (
                <>
                  <div className="bg-white rounded-xl p-4 mx-auto inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paymentQR}
                      alt="Payment QR Code"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="text-2xl font-bold text-pink-600">
                    {Number(donateAmount.replace(/\D/g, '')).toLocaleString('vi-VN')}đ
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mở app ngân hàng và quét mã QR để thanh toán
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chờ thanh toán...</span>
                  </div>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
