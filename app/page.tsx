import { connection } from 'next/server';
import { fetchDonations, fetchDonationStats, fetchExpenses } from '@/lib/data';
import NuoiToiClient from './nuoi-toi-client';

export default async function NuoiToiPage() {
  await connection();

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
