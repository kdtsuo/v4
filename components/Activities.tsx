'use client';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Separator,
} from '@/components/ui';

interface ActivityProps {
  images: string[];
  title: string;
  text: string;
  reverse: boolean;
  isLast?: boolean;
}

function Activity({ images, title, text, reverse, isLast = false }: ActivityProps) {
  return (
    <div className='flex w-full flex-col items-center'>
      <div
        className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}
          w-full items-center justify-center overflow-hidden md:space-x-4`}
      >
        <div className='flex w-full justify-center px-10 py-6 lg:w-1/2'>
          <Carousel className='w-11/12 rounded-xl border lg:w-5/6'>
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className='relative h-64 w-full'>
                    <Image
                      src={img}
                      alt={`${title} image`}
                      fill
                      className='rounded-xl object-cover shadow-lg'
                      sizes='(max-width: 768px) 100vw, 50vw'
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <Card className='t200e w-full max-w-lg shadow-lg hover:-translate-y-3 lg:w-1/2'>
          <CardHeader>
            <CardTitle className='text-2xl capitalize lg:text-3xl'>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className='text-lg leading-relaxed'>{text}</CardDescription>
          </CardContent>
        </Card>
      </div>

      {!isLast && <Separator className='my-10 w-1/2 rounded-full' />}
    </div>
  );
}

export function Activities() {
  const { theme } = useTheme();
  const activities: ActivityProps[] = [
    {
      images: ['/assets/img/stock/dancepractice.png'],
      title: 'Dance Workshops',
      text: 'We provide drop-in dance classes for the general public and extra dance practices for performance groups! Learn from experienced instructors in a fun, supportive environment.',
      reverse: false,
    },
    {
      images: [
        '/assets/img/stock/events.jpeg',
        '/assets/img/stock/events2.jpeg',
        '/assets/img/stock/events3.jpeg',
      ],
      title: 'K-Pop Events',
      text: 'We host K-pop related events including random dance challenges, watch parties, karaokes, and other activities that promote K-pop and Korean culture!',
      reverse: true,
    },
    {
      images: ['/assets/img/stock/showcase.jpeg'],
      title: 'K-Fest Showcase',
      text: 'Annually, we host K-pop dance concerts to showcase our dance skills and creativity! Join us for an unforgettable experience celebrating K-pop performance.',
      reverse: false,
      isLast: true,
    },
  ];

  return (
    <Card
      className='m-5 mt-10'
      style={{
        background: `var(--bg-less-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
      }}
    >
      <CardHeader>
        <CardTitle className='text-center text-6xl'>Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {activities.map((activity, index) => (
            <Activity
              key={index}
              images={activity.images}
              title={activity.title}
              text={activity.text}
              reverse={activity.reverse}
              isLast={activity.isLast}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
