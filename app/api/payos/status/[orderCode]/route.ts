import { NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await params;
    const orderCodeNum = Number(orderCode);

    if (!orderCodeNum || isNaN(orderCodeNum)) {
      return NextResponse.json(
        { error: 'Invalid order code' },
        { status: 400 }
      );
    }

    if (!isPayOSConfigured()) {
      return NextResponse.json({
        status: 'PENDING',
        amount: 0,
        isMock: true,
      });
    }

    const payOS = getPayOS();
    const payment = await payOS.paymentRequests.get(orderCodeNum);

    return NextResponse.json({
      status: payment.status,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('Failed to get payment status:', error);
    return NextResponse.json(
      { error: 'Không thể kiểm tra trạng thái thanh toán' },
      { status: 500 }
    );
  }
}
