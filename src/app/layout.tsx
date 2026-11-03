import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Sora } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/providers/SessionProvider';

/*======================================================================
  Typography — three faces, three jobs.
  ======================================================================
    Sora            structure. Page titles, section titles and the large
                    operational figures. Geometric, modern, never editorial.

    Inter           the interface. Navigation, labels, body copy, forms,
                    buttons, table content. Optimised for scanning.

    JetBrains Mono  machine values only — patient and equipment codes,
                    timestamps, durations, serial numbers. Never body copy,
                    never a whole label row.
====================================================================== */

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sora',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono-jet',
});

export const metadata: Metadata = {
  title: {
    default: 'MedOrch — Intelligent Hospital Operations',
    template: '%s · MedOrch',
  },
  description:
    'MedOrch is the orchestration layer for the operating theatre: schedules, rooms, clinical teams, equipment and patients in one controlled record.',
  applicationName: 'MedOrch',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-paper text-ink font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
