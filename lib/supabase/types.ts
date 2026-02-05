export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      donations: {
        Row: {
          id: string;
          name: string;
          amount: number;
          message: string | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          amount: number;
          message?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          message?: string | null;
          verified?: boolean;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
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
        };
        Insert: {
          id?: string;
          category: string;
          label: string;
          description?: string | null;
          percentage: number;
          spent?: number;
          budget: number;
          color?: string | null;
          chart_color?: string | null;
          month?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          label?: string;
          description?: string | null;
          percentage?: number;
          spent?: number;
          budget?: number;
          color?: string | null;
          chart_color?: string | null;
          month?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier usage
export type Donation = Database['public']['Tables']['donations']['Row'];
export type DonationInsert = Database['public']['Tables']['donations']['Insert'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
