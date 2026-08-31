import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'committee ♥ kdt',
  description: 'meet the kpop dance team members at ubco!',
  openGraph: {
    images: [
      {
        url: '/assets/img/kdtlogobanner-committee.webp',
        width: 1200,
        height: 630,
        alt: 'KDT Committee',
      },
    ],
  },
  twitter: {
    images: ['/assets/img/kdtlogobanner-committee.webp'],
    card: 'summary_large_image',
  },
};

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
