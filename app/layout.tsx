import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './App.css';
import { AuthProvider, ToastProvider } from '@/contexts';
import { Navbar } from '@/components/';
import { Footer } from '@/components/';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
const logo = '/assets/img/kdtlogosquare.png';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'kdt ♥ kpop dance team',
  description:
    'all things kpop at ubco! dance classes, events, performances and meetups for all kpop fans ♥',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem={false}>
            <ToastProvider>
              {children}
              <Navbar />
              <Footer />
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <Script id='custom-console-message' strategy='afterInteractive'>
          {`
            console.log(
              "%chey! I'm looking for a future partner to run some business with in the future that has a strong interest with shadcn-ui and react.\\nEmail me at mail@rinm.dev",
              "color: #fff; background: #111; padding: 8px; font-size: 16px; border-radius: 4px;"
            );
          `}
        </Script>
      </body>
    </html>
  );
}
