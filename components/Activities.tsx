'use client';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui';
import { getDelayClass } from '@/utils';
import { Text } from '@/components/Text';

interface ActivityProps {
  images: string[];
  title: string;
  text: string;
  index: number;
}

function Activity({ images, title, text, index }: ActivityProps) {
  const isReverse = index % 2 !== 0;

  return (
    <div
      className={`fade-in-from-bottom ${getDelayClass(index)} flex flex-col
        overflow-hidden border rounded-2xl shadow-lg lg:h-[420px] lg:flex-row
        ${isReverse ? 'lg:flex-row-reverse' : ''}`}
    >
      <div className='relative w-full lg:w-3/5'>
        <Carousel className='h-full w-full'>
          <CarouselContent>
            {images.map((img, i) => (
              <CarouselItem key={i}>
                <div className='relative h-72 w-full lg:h-[420px]'>
                  <Image
                    src={img}
                    alt={`${title} image ${i + 1}`}
                    fill
                    className='object-cover'
                    sizes='(max-width: 1024px) 100vw, 60vw'
                    priority={i === 0 && index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious
                className='left-4 border-white/30 bg-black/30 text-white backdrop-blur-sm
                  hover:bg-black/50 hover:text-white'
              />
              <CarouselNext
                className='right-4 border-white/30 bg-black/30 text-white backdrop-blur-sm
                  hover:bg-black/50 hover:text-white'
              />
            </>
          )}
        </Carousel>
      </div>

      <div className='flex w-full flex-col justify-center gap-4 bg-card p-8 lg:w-2/5'>
        <Text
          variant='caption'
          size='xs'
          className='font-semibold uppercase tracking-[0.2em]'
        >
          Activity 0{index + 1}
        </Text>
        <Text variant='hd-lg'>{title}</Text>
        <Text variant='muted' className='leading-relaxed'>
          {text}
        </Text>
      </div>
    </div>
  );
}

export function Activities() {
  const { theme } = useTheme();

  const activities = [
    {
      images: ['/assets/img/stock/dancepractice.png'],
      title: 'Dance Workshops',
      text: 'We provide drop-in dance classes for the general public and extra dance practices for performance groups! Learn from experienced instructors in a fun, supportive environment.',
    },
    {
      images: [
        '/assets/img/stock/events.jpeg',
        '/assets/img/stock/events2.jpeg',
        '/assets/img/stock/events3.jpeg',
      ],
      title: 'K-Pop Events',
      text: 'We host K-pop related events including random dance challenges, watch parties, karaokes, and other activities that promote K-pop and Korean culture!',
    },
    {
      images: ['/assets/img/stock/showcase.jpeg'],
      title: 'K-Fest Showcase',
      text: 'Annually, we host K-pop dance concerts to showcase our dance skills and creativity! Join us for an unforgettable experience celebrating K-pop performance.',
    },
  ];

  return (
    <section
      style={{
        background: `var(--bg-less-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
      }}
    >
      <div className='container mx-auto py-10 px-4'>
        <div className='fade-in-from-bottom mb-10 text-center'>
          <Text
            variant='caption'
            size='xs'
            className='mb-1 font-semibold uppercase tracking-[0.2em]'
          >
            What We Do
          </Text>
          <Text variant='hd-xl'>Activities</Text>
        </div>

        <div className='flex flex-col gap-6'>
          {activities.map((activity, index) => (
            <Activity
              key={index}
              images={activity.images}
              title={activity.title}
              text={activity.text}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
