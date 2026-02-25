import { NextResponse } from 'next/server';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { getDb } from '@/lib/turso/client';
import { isTursoConfigured } from '@/lib/turso/env';
import { emitNewDonation } from '@/lib/turso/emitter';
import { getPaymentData } from '@/lib/payment-cache';
import type { DonationRow } from '@/lib/turso/types';

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
      const cached = getPaymentData(webhookData.orderCode);
      const name = cached?.name || webhookData.counterAccountName || 'Ẩn danh';
      const message = cached?.message || null;

      if (isTursoConfigured()) {
        const db = getDb();
        const id = crypto.randomUUID();

        await db.execute({
          sql: 'INSERT INTO donations (id, name, amount, message, verified) VALUES (?, ?, ?, ?, 1)',
          args: [id, name, webhookData.amount, message],
        });

        const result = await db.execute({
          sql: 'SELECT * FROM donations WHERE id = ?',
          args: [id],
        });

        const donation = result.rows[0] as unknown as DonationRow;
        emitNewDonation(donation);
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
