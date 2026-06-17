'use client';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { getDelayClass } from '@/utils';
import { SocialLinks } from '@/lib/data';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export function Footer() {
  const getYear = () => {
    const date = new Date();
    return date.getFullYear();
  };
  const { theme } = useTheme();
  return (
    <Card className='rounded-none py-10 text-left drop-shadow-lg fade-in border'>
      <CardContent>
        <div
          className='flex flex-col lg:flex-row w-full items-center lg:justify-between
            gap-8'
        >
          {/* Left: Text Section */}
          <div className='w-full sm:w-1/2 flex justify-center lg:justify-start'>
            <CardHeader>
              <CardTitle>
                &copy; (&quot;KPop Dance Team&quot;) est. 2023-{getYear()} KDT
              </CardTitle>
              <CardDescription className='text-lg text-center justify-center'>
                <div className='flex items-center gap-2 text-sm my-2 justify-center'>
                  <p>built by</p>
                  <a href='https://web8th.com' target='_blank' rel='noreferrer'>
                    <Image
                      src='/8th_svg.svg'
                      alt='Web8th'
                      width={48}
                      height={48}
                      className='not-dark:invert-100'
                    />
                  </a>
                  <ChevronRight className='text-muted-foreground' />
                  <a href='https://rinm.dev' target='_blank' rel='noreferrer'>
                    <Image
                      src='/assets/img/rmlogo.png'
                      alt='rmlogo'
                      width={48}
                      height={48}
                      className='not-dark:invert-100'
                    />
                  </a>
                </div>
                <div className='text-sm'>
                  All photos are provided by{' '}
                  <a
                    className='underline'
                    href='https://www.tsengphoto.ca/'
                    target='_blank'
                  >
                    Tseng Photography
                  </a>
                  .
                </div>
              </CardDescription>
            </CardHeader>
          </div>

          {/* Right: Social Links Section - Vertical Layout on Desktop */}
          <div
            className='w-full sm:w-1/2 flex justify-center lg:justify-end flex-row
              items-center gap-2 flex-wrap'
          >
            {SocialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className={`fade-in-from-bottom ${getDelayClass(index)} w-full max-w-xs
                flex justify-end h-12 lg:w-56`}
              >
                <Card
                  className='bg-secondary-foreground transition-all duration-200
                    hover:shadow-lg h-full p-2 w-full hover:-translate-y-1'
                >
                  <CardHeader
                    className='flex flex-row items-center justify-between space-x-4
                      h-full'
                  >
                    <Image
                      src={link.icon}
                      alt={link.title}
                      width={24}
                      height={24}
                      className='size-6 not-dark:invert-0 dark:invert-100'
                    />
                    <CardTitle
                      className='text-primary-foreground text-base font-extralight
                        whitespace-nowrap'
                    >
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
