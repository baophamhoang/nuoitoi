'use server';

import { getDb } from '@/lib/turso/client';
import { isTursoConfigured } from '@/lib/turso/env';
import { emitNewDonation } from '@/lib/turso/emitter';
import { sanitizeInput } from '@/lib/sanitize';
import type { DonationRow } from '@/lib/turso/types';

export async function createDonation(data: {
  amount: number;
  name?: string;
  message?: string;
}) {
  const { amount, name, message } = data;

  if (!amount || amount < 2000) {
    return { error: 'Số tiền tối thiểu là 2.000đ' };
  }

  const sanitizedName = name ? sanitizeInput(name, 100) : 'Ẩn danh';
  const sanitizedMessage = message ? sanitizeInput(message, 500) : null;

  if (!isTursoConfigured()) {
    return {
      success: true,
      donation: {
        id: Date.now().toString(),
        name: sanitizedName,
        amount: Number(amount),
        message: sanitizedMessage || '',
        created_at: new Date().toISOString(),
      },
    };
  }

  try {
    const db = getDb();
    const id = crypto.randomUUID();

    await db.execute({
      sql: 'INSERT INTO donations (id, name, amount, message) VALUES (?, ?, ?, ?)',
      args: [id, sanitizedName, Number(amount), sanitizedMessage],
    });

    const result = await db.execute({
      sql: 'SELECT * FROM donations WHERE id = ?',
      args: [id],
    });

    const donation = result.rows[0] as unknown as DonationRow;
    emitNewDonation(donation);

    return { success: true, donation };
  } catch (error) {
    console.error('Failed to create donation:', error);
    return { error: 'Không thể ghi nhận donation' };
  }
}
