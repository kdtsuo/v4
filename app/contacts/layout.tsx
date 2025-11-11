import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'contacts ♥ kdt',
  description: 'meet the kpop dance team members at ubco!',
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

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
