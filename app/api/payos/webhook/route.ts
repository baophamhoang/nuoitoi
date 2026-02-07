import { NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    if (!isPayOSConfigured()) {
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const payOS = getPayOS();

    const webhookData = await payOS.webhooks.verify(body);

    // code "00" means successful payment
    if (webhookData.code === '00') {
      // Insert donation into Supabase
      const supabase = createServiceClient();

      const name =
        webhookData.counterAccountName || 'Ẩn danh';

      await supabase.from('donations').insert({
        name,
        amount: webhookData.amount,
        message: webhookData.description || null,
        verified: true,
      } as never);
    }

    // PayOS requires 200 OK response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to avoid PayOS retries for verification failures
    return NextResponse.json({ success: true });
  }
}
