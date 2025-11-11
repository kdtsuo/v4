import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'sponsors ♥ kdt',
  description: 'meet our amazing sponsors who support kdt!',
  openGraph: {
    images: [
      {
        url: '/assets/img/kdtlogosquare.png',
        width: 1200,
        height: 630,
        alt: 'KDT Logo',
      },
    ],
  },
  twitter: {
    images: ['/assets/img/kdtlogosquare.png'],
    card: 'summary_large_image',
  },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
