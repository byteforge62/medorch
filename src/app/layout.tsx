import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

/*======================================================================
  Typography — two faces, one clinical register.
  ======================================================================
    Plus Jakarta Sans  display voice: page titles, module headings, the
                       landing hero. Tight tracking, confident weight.
    Inter              the working face: body copy, labels, forms, tables,
                       controls, and every tabular figure.

  Machine codes use the operating system's monospace stack, so a code is
  still visibly different from a sentence without adding a third family.
====================================================================== */

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'MedOrch — Intelligent Hospital Operations',
    template: '%s · MedOrch',
  },
  description:
    'MedOrch is the orchestration layer for the operating theatre: schedules, rooms, clinical teams, equipment and patients in one controlled record.',
  applicationName: 'MedOrch',
  icons: {
    icon: [{ url: '/brand/medorch-favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/brand/medorch-favicon.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-paper text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
