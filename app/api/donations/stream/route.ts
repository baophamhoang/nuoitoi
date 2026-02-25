export const runtime = 'nodejs';

import { onNewDonation } from '@/lib/turso/emitter';
import type { DonationRow } from '@/lib/turso/types';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send a keep-alive comment immediately so the browser confirms the connection
      controller.enqueue(encoder.encode(': connected\n\n'));

      const unsubscribe = onNewDonation((donation: DonationRow) => {
        const data = JSON.stringify({
          id: donation.id,
          name: donation.name,
          amount: donation.amount,
          message: donation.message,
          verified: Boolean(donation.verified),
          created_at: donation.created_at,
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      // Keep-alive ping every 30 seconds to prevent timeouts
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(keepAlive);
          unsubscribe();
        }
      }, 30000);

      // Clean up when client disconnects
      return () => {
        clearInterval(keepAlive);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
