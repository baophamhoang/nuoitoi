'use client';

import { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Donation } from '@/lib/types';

interface DonationsFeedProps {
  donations: Donation[];
  isLoading: boolean;
  darkMode: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const DonationsFeed = forwardRef<HTMLDivElement, DonationsFeedProps>(
  function DonationsFeed({ donations, isLoading, darkMode, onMouseEnter, onMouseLeave }, ref) {
    return (
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
          <span className="inline-block animate-pulse">💝</span> Những Người Đã Nuôi Tôi
        </h2>
        <Card
          className="p-4 md:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            ref={ref}
            className="space-y-3 max-h-64 overflow-y-auto overflow-x-hidden pr-2 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-pink-100 dark:border-pink-800"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : (
              donations.map((donation, index) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-pink-100 dark:border-pink-800 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    background: darkMode
                      ? 'linear-gradient(to right, rgba(157, 23, 77, 0.2), rgba(126, 34, 206, 0.2))'
                      : 'linear-gradient(to right, #fdf2f8, #faf5ff)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-12"
                      style={{ background: 'linear-gradient(to bottom right, #f472b6, #a855f7)' }}
                    >
                      {donation.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{donation.name}</div>
                      {donation.message && (
                        <div className="text-sm text-muted-foreground truncate">&quot;{donation.message || "--"}&quot;</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-bold text-pink-600 dark:text-pink-400">
                      +{donation.amount.toLocaleString()}đ
                    </div>
                    <div className="text-xs text-muted-foreground">{donation.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-4 text-sm text-muted-foreground">
            {donations.length} người đã donate tuần này
          </div>
        </Card>
      </section>
    );
  }
);
