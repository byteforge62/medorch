import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

/*======================================================================
  Typography — one clinical interface face.
  ======================================================================
    IBM Plex Sans   the whole product: page titles, headings, navigation,
                    labels, body copy, forms, tables, controls and numeric
                    values. Its humanist, technical character suits clinical
                    software and stays readable at data-dense sizes.

  Machine codes use the operating system's monospace stack, so a code is
  still visibly different from a sentence without adding a second family.
====================================================================== */

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'optional',
  variable: '--font-plex',
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
      className={plex.variable}
      data-scroll-behavior="smooth"
    >
      <body className="bg-paper text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
