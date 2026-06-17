'use client';
import { Activities } from '@/components/';
import Image from 'next/image';
import { Text } from '@/components/Text';

export default function About() {
  return (
    <div id='top' className='animate-fade-in h-auto overflow-x-hidden'>
      <div className='relative h-screen w-screen'>
        <Image
          className='absolute inset-0 h-full w-full object-cover brightness-[0.40]'
          src='/assets/img/stock/teamphoto.jpeg'
          alt='team'
          fill
          priority
        />

        <div
          className='relative flex h-full flex-col items-center justify-center p-4
            text-white'
        >
          <div>
            <Text
              variant='hd-xxl'
              className='text-lightblue-100 fade-in-from-bottom my-5 text-center delay-75'
            >
              What is KDT?
            </Text>
            <Text
              variant='default'
              size='xl'
              className='lg:paragraph fade-in-from-bottom max-w-screen-sm text-center delay-150'
            >
              The KPop Dance Team (KDT), is a team consisting of diverse, unique
              individuals that have common interests in dancing, choreographing, and
              performing to promote korean pop-culture, and have fun!
            </Text>
          </div>
        </div>
      </div>
      <Activities />
    </div>
  );
}
