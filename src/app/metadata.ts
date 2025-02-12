import type { Metadata } from 'next';

const appName = "Nature's Loops";
const appDescription = 'Stream lofi music for studying, working, and relaxing. Choose from various themed rooms with unique ambiance.';

export const metadata: Metadata = {
  title: {
    default: `${appName} - Lofi Music for Focus and Relaxation`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: ['lofi', 'music', 'study', 'work', 'relax', 'focus', 'ambient'],
  authors: [{ name: "Nature's Loops Team" }],
  creator: "Nature's Loops Team",
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: appName,
    title: appName,
    description: appDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
  },
  icons: {
    icon: '/favicon.ico',
  },
}; 