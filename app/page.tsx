import { fetchDonations, fetchDonationStats, fetchExpenses } from '@/lib/data';
import NuoiToiClient from './nuoi-toi-client';

export default async function NuoiToiPage() {
  const [donations, stats, expenses] = await Promise.all([
    fetchDonations(),
    fetchDonationStats(),
    fetchExpenses(),
  ]);

  return (
    <NuoiToiClient
      initialDonations={donations}
      initialStats={stats}
      initialExpenses={expenses}
    />
  );
}
