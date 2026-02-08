import React from 'react';
import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const _geist = Noto_Sans({ subsets: ['latin', 'vietnamese'] });
const _geistMono = Noto_Sans_Mono({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000',
  ),
  title: '🎉 Hãy nuôi tôi! 🎉',
  description: 'Nuôi tôi đi pls! Pham Bao - minh bạch 100% từng đồng.',
  keywords: ['Pham Bao dev', 'Pham Bao nuoi toi', 'nuôi tôi', 'donate', 'minh bạch'],
  openGraph: {
    title: '🎉 Hãy nuôi tôi! 🎉',
    description: 'Nuôi tôi đi pls! Pham Bao - minh bạch 100% từng đồng.',
    images: [{ url: '/momo.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎉 Hãy nuôi tôi! 🎉',
    description: 'Nuôi tôi đi pls! Pham Bao - minh bạch 100% từng đồng.',
    images: ['/momo.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} ${_geistMono.className} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
