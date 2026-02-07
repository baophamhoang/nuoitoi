'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getSupabaseServiceRoleKey } from '@/lib/supabase/env';
import { sanitizeInput } from '@/lib/sanitize';
import type { DonationInsert } from '@/lib/supabase/types';

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

  if (!isSupabaseConfigured() || !getSupabaseServiceRoleKey()) {
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
    const supabase = createServiceClient();

    const insertData: DonationInsert = {
      name: sanitizedName,
      amount: Number(amount),
      message: sanitizedMessage,
    };

    const { data: donation, error } = await supabase
      .from('donations')
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw error;

    return { success: true, donation };
  } catch (error) {
    console.error('Failed to create donation:', error);
    return { error: 'Không thể ghi nhận donation' };
  }
}
