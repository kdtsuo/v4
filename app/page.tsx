'use client';
import { Discover, LinkTrees, Events } from '@/components/';
import { useTheme } from 'next-themes';

export default function Home() {
  const { theme } = useTheme();
  return (
    <>
      <div
        id='top'
        className='animate-fade-in overflow-x-none mx-auto h-auto pt-34 pb-10 md:pt-46'
        style={{
          background: `var(--bg-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
        }}
      >
        <div className='text-center text-xl md:text-4xl'>
          <h1>all things kpop at ubco!</h1>
          <h1>dance classes, events, performances</h1>
          <h1>and meetups for all kpop fans ♥</h1>
        </div>
        <div className='flex w-full justify-center'>
          <LinkTrees />
        </div>
        <Events />
        <Discover />
      </div>
    </>
  );
}
