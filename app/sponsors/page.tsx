'use client';

import { Sponsors } from '@/components/';
import { useTheme } from 'next-themes';

export default function SponsorsPage() {
  const { theme } = useTheme();

  return (
    <div
      id='sponsors'
      className='animate-fade-in overflow-x-hidden pb-10 pt-34 md:pt-46'
      style={{
        background: `var(--bg-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
      }}
    >
      <Sponsors />
    </div>
  );
}
