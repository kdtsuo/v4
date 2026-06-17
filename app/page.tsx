'use client';
import { Discover, LinkTrees } from '@/components/';
import { useTheme } from 'next-themes';
import { Text } from '@/components/Text';

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
          <Text variant='hd-lg'>all things kpop at ubco!</Text>
          <Text variant='hd-lg'>dance classes, events, performances</Text>
          <Text variant='hd-lg'>and meetups for all kpop fans ♥</Text>
        </div>
        <div className='flex w-full justify-center'>
          <LinkTrees />
        </div>
        <Discover />
      </div>
    </>
  );
}
