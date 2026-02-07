'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(to bottom right, #fdf2f8, #f5f3ff, #eff6ff)',
      }}
    >
      <Card className="p-8 md:p-12 max-w-md text-center bg-white/80 backdrop-blur-sm border-2 border-pink-200">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Ối! Có lỗi xảy ra
        </h2>
        <p className="text-muted-foreground mb-6">
          Đừng lo, không phải lỗi của bạn! Thử tải lại trang nhé.
        </p>
        <Button
          onClick={reset}
          className="bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          Thử lại
        </Button>
      </Card>
    </div>
  );
}
