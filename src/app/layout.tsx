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
  title: "Nature's Loops",
  description: "A curated collection of lo-fi music channels inspired by nature's beauty",
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
        url: 'https://naturesloops.com/images/og-image.jpg',
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
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
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
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <Providers>
          <main className="h-full w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
