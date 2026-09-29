import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Truvault — Digital Identity & Trust',
  description: 'A secure digital identity, verifiable credentials, consent and provenance platform.',
  openGraph: {
    title: 'Truvault — Digital Identity & Trust',
    description: 'Digital identity, proven. Secure credentials, consent and transparent trust.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Truvault — Digital Identity & Trust',
    description: 'Digital identity, proven. Secure credentials, consent and transparent trust.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
