import { NextResponse } from 'next/server';

// Mock data store (in a real app, this would be a database)
// This data persists only during the server's runtime
let mockDonations = [
  {
    id: '1',
    name: 'Anh T***',
    amount: 100000,
    message: 'Cố lên nhé!',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '2',
    name: 'Chị H***',
    amount: 50000,
    message: 'Ủng hộ minh bạch!',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '3',
    name: 'Ẩn danh',
    amount: 20000,
    message: '',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '4',
    name: 'Bạn N***',
    amount: 200000,
    message: 'Sao kê đi nhé!',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '5',
    name: 'Ẩn danh',
    amount: 50000,
    message: 'Mua mì tôm đi!',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    verified: true,
  },
];

// GET /api/donations - Get recent donations
export async function GET() {
  // Format donations for display
  const formattedDonations = mockDonations.map((d) => {
    const now = new Date();
    const createdAt = new Date(d.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    let timeAgo;
    if (diffMins < 1) {
      timeAgo = 'Vừa xong';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} phút trước`;
    } else if (diffMins < 1440) {
      timeAgo = `${Math.floor(diffMins / 60)} giờ trước`;
    } else {
      timeAgo = `${Math.floor(diffMins / 1440)} ngày trước`;
    }

    return {
      id: d.id,
      name: d.name,
      amount: d.amount,
      message: d.message,
      time: timeAgo,
    };
  });

  return NextResponse.json({
    donations: formattedDonations,
    total: mockDonations.length,
  });
}

// POST /api/donations - Create a new donation (mock)
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

    // Create new donation
    const newDonation = {
      id: Date.now().toString(),
      name: name || 'Ẩn danh',
      amount: Number(amount),
      message: message || '',
      createdAt: new Date().toISOString(),
      verified: false, // Would be verified by payment webhook in real app
    };

    // Add to beginning of array (most recent first)
    mockDonations = [newDonation, ...mockDonations].slice(0, 20); // Keep only last 20

    return NextResponse.json({
      success: true,
      donation: newDonation,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
