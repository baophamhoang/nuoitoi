import { NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { sanitizeInput } from '@/lib/sanitize';
import { setPaymentData } from '@/lib/payment-cache';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, name, message } = body;

    if (!amount || amount < 2000) {
      return NextResponse.json(
        { error: 'Số tiền tối thiểu là 2.000đ' },
        { status: 400 }
      );
    }

    const orderCode = Date.now();
    const sanitizedName = name ? sanitizeInput(name, 100) : 'Anon';
    const description = `NUOITOI ${sanitizedName}`.slice(0, 25);

    if (!isPayOSConfigured()) {
      // Mock response for local development
      return NextResponse.json({
        qrCode: '',
        orderCode,
        paymentLinkId: `mock_${orderCode}`,
        checkoutUrl: '',
        isMock: true,
      });
    }

    const payOS = getPayOS();

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';

    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount: Number(amount),
      description,
      cancelUrl: `${baseUrl}?payment=cancelled`,
      returnUrl: `${baseUrl}?payment=success`,
      buyerName: name || undefined,
    });

    setPaymentData(orderCode, {
      name: name || '',
      message: message || '',
    });

    // PayOS returns an EMVCo string, convert to data URI image
    const qrDataUri = await QRCode.toDataURL(paymentLink.qrCode, {
      width: 300,
      margin: 2,
    });

    return NextResponse.json({
      qrCode: qrDataUri,
      orderCode: paymentLink.orderCode,
      paymentLinkId: paymentLink.paymentLinkId,
      checkoutUrl: paymentLink.checkoutUrl,
    });
  } catch (error) {
    console.error('Failed to create payment:', error);
    return NextResponse.json(
      { error: 'Không thể tạo thanh toán. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
