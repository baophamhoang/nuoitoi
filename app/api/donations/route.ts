import { NextResponse } from 'next/server';
import { getDb } from '@/lib/turso/client';
import { isTursoConfigured } from '@/lib/turso/env';
import { emitNewDonation } from '@/lib/turso/emitter';
import { sanitizeInput } from '@/lib/sanitize';
import type { DonationRow } from '@/lib/turso/types';

function formatTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) {
    return 'Vừa xong';
  } else if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)} giờ trước`;
  } else {
    return `${Math.floor(diffMins / 1440)} ngày trước`;
  }
}

const mockDonations = [
  { id: '1', name: 'Anh T***', amount: 100000, message: 'Cố lên nhé!', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: '2', name: 'Chị H***', amount: 50000, message: 'Ủng hộ minh bạch!', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: '3', name: 'Ẩn danh', amount: 20000, message: '', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: '4', name: 'Bạn N***', amount: 200000, message: 'Sao kê đi nhé!', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: '5', name: 'Ẩn danh', amount: 50000, message: 'Mua mì tôm đi!', created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
];

// GET /api/donations - Get recent donations
export async function GET() {
  if (!isTursoConfigured()) {
    const formattedDonations = mockDonations.map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      message: d.message,
      time: formatTimeAgo(d.created_at),
    }));

    return NextResponse.json({
      donations: formattedDonations,
      total: mockDonations.length,
      isMock: true,
    });
  }

  try {
    const db = getDb();
    const result = await db.execute(
      'SELECT id, name, amount, message, created_at FROM donations ORDER BY created_at DESC LIMIT 20'
    );

    const donations = result.rows as unknown as DonationRow[];
    const formattedDonations = donations.map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      message: d.message,
      time: formatTimeAgo(d.created_at),
    }));

    return NextResponse.json({
      donations: formattedDonations,
      total: formattedDonations.length,
    });
  } catch (error) {
    console.error('Failed to fetch donations:', error);
    const formattedDonations = mockDonations.map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      message: d.message,
      time: formatTimeAgo(d.created_at),
    }));

    return NextResponse.json({
      donations: formattedDonations,
      total: mockDonations.length,
      isMock: true,
    });
  }
}

// POST /api/donations - Create a new donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, amount, message } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    if (!isTursoConfigured()) {
      return NextResponse.json({
        success: true,
        donation: {
          id: Date.now().toString(),
          name: name || 'Ẩn danh',
          amount: Number(amount),
          message: message || '',
          created_at: new Date().toISOString(),
          verified: false,
        },
        isMock: true,
      });
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const sanitizedName = sanitizeInput(name || 'Ẩn danh', 100);
    const sanitizedMessage = message ? sanitizeInput(message, 500) : null;

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

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error('Failed to create donation:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
