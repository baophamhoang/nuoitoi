'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { triggerMegaCelebration } from '@/lib/confetti';

export function usePayment() {
  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [paymentOrderCode, setPaymentOrderCode] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'paid' | 'error'>('idle');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Form state
  const [donateAmount, setDonateAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorMessage, setDonorMessage] = useState('');

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

          toast.success('Thanh toán thành công!', {
            description: 'Cảm ơn bạn đã ủng hộ!',
            duration: 8000,
          });
          resetForm();
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

  const createPayment = async () => {
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
      if (!res.ok) throw new Error(data.error || 'Payment creation failed');

      setPaymentQR(data.qrCode);
      setPaymentOrderCode(data.orderCode);
      setPaymentStatus('pending');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('Không thể tạo mã QR', { description: 'Vui lòng thử lại sau.' });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const resetForm = () => {
    setDonateAmount('');
    setDonorName('');
    setDonorMessage('');
    setPaymentQR(null);
    setPaymentOrderCode(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      setPaymentStatus('idle');
      setPaymentQR(null);
      setPaymentOrderCode(null);
    }
  };

  const handleAmountChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '');
    setDonateAmount(digits ? Number(digits).toLocaleString('vi-VN') : '');
  }, []);

  return {
    paymentQR,
    paymentStatus,
    isCreatingPayment,
    showDialog,
    donateAmount,
    donorName,
    donorMessage,
    createPayment,
    handleDialogOpenChange,
    handleAmountChange,
    setDonorName,
    setDonorMessage,
  };
}
