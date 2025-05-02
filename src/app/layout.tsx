import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kilometer Kampen | FPL Penalty Tracker',
  description: 'Track FPL winners and losers with penalty meters',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#1a1d24] min-h-screen`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
} 