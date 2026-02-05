import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Donation, DonationInsert } from '@/lib/supabase/types';

// Helper function to format time ago
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

// Mock data for when Supabase is not configured
const mockDonations = [
  { id: '1', name: 'Anh T***', amount: 100000, message: 'Cố lên nhé!', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: '2', name: 'Chị H***', amount: 50000, message: 'Ủng hộ minh bạch!', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: '3', name: 'Ẩn danh', amount: 20000, message: '', created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: '4', name: 'Bạn N***', amount: 200000, message: 'Sao kê đi nhé!', created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: '5', name: 'Ẩn danh', amount: 50000, message: 'Mua mì tôm đi!', created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
];

// Helper to check if Supabase is configured (supports both old and new key names)
function isSupabaseConfigured(): boolean {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey);
}

// GET /api/donations - Get recent donations
export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    // Return mock data if Supabase is not configured
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
    const supabase = await createClient();

    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const formattedDonations = ((donations || []) as Donation[]).map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      message: d.message,
      time: formatTimeAgo(d.created_at),
    }));

    return NextResponse.json({
      donations: formattedDonations,
      total: donations?.length || 0,
    });
  } catch (error) {
    console.error('Failed to fetch donations:', error);
    // Fallback to mock data on error
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

    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Return mock success if Supabase is not configured
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

    const supabase = await createClient();

    const insertData: DonationInsert = {
      name: name || 'Ẩn danh',
      amount: Number(amount),
      message: message || null,
    };

    const { data: donation, error } = await supabase
      .from('donations')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error('Failed to create donation:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
