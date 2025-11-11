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
      </body>
    </html>
  );
}
