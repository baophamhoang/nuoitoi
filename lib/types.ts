// Shared client-side types used across components and hooks

export interface Donation {
  id: string;
  name: string;
  amount: number;
  message: string;
  time: string;
}

export interface ExpenseCategory {
  id: string;
  percentage: number;
  label: string;
  description: string;
  color: string;
  chartColor: string;
  spent: number;
  budget: number;
}

export interface DonationStats {
  totalAmount: number;
  donationCount: number;
  monthlyGoal: number;
}
