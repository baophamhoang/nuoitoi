// Flat TypeScript interfaces for Turso/SQLite rows

export interface DonationRow {
  id: string;
  name: string;
  amount: number;
  message: string | null;
  verified: number; // SQLite stores booleans as 0/1
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  category: string;
  label: string;
  description: string | null;
  percentage: number;
  spent: number;
  budget: number;
  color: string | null;
  chart_color: string | null;
  month: string | null;
  updated_at: string;
}
