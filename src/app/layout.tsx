import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'MedOrch - OT Orchestration Platform',
  description: 'Operating Theatre Management & Resource Orchestration Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
