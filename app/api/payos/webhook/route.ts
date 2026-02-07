import { NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { createClient } from '@/lib/supabase/server';

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
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey) {
        const supabase = await createClient();

        const name =
          webhookData.counterAccountName || 'Ẩn danh';

        await supabase.from('donations').insert({
          name,
          amount: webhookData.amount,
          message: webhookData.description || null,
          verified: true,
        } as never);
      }
    }

    // PayOS requires 200 OK response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to avoid PayOS retries for verification failures
    return NextResponse.json({ success: true });
  }
}
