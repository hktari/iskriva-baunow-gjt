import { SessionProvider } from '@/shared/components/providers/session-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EU Project Manager',
  description: 'European Project Analytics and Management Platform',
  keywords: ['EU projects', 'KPI tracking', 'project management', 'analytics'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="0576ecaf-7e8b-4af8-ad53-a7466c62ee15"
        />
      </head>
      <body className={`${inter.className}`}>
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
