import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: "Nature's Loops - Immersive Lo-Fi Music Experience",
    template: "%s | Nature's Loops"
  },
  description: 'Experience the harmony of nature and lo-fi music in a unique retro TV interface. Perfect for studying, working, or relaxing.',
  keywords: ['lofi', 'music', 'nature', 'study', 'relax', 'ambient', 'tv interface', 'retro'],
  authors: [{ name: 'Kevin Knapp' }],
  creator: 'Kevin Knapp',
  publisher: "Nature's Loops",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://naturesloops.com',
    siteName: "Nature's Loops",
    title: "Nature's Loops - Immersive Lo-Fi Music Experience",
    description: 'Experience the harmony of nature and lo-fi music in a unique retro TV interface.',
    images: [
      {
        url: 'https://naturesloops.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Nature's Loops - Immersive Lo-Fi Music Experience",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nature's Loops - Immersive Lo-Fi Music Experience",
    description: 'Experience the harmony of nature and lo-fi music in a unique retro TV interface.',
    images: ['https://naturesloops.com/twitter-image.jpg'],
    creator: '@NaturesLoops',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} ${poppins.variable} overflow-hidden`}>
        <Providers>
          <main className="h-screen w-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
