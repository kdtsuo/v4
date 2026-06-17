'use client';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { getDelayClass } from '@/utils';
import { SocialLinks } from '@/lib/data';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export function Footer() {
  return (
    <Card className='rounded-none py-10 text-left drop-shadow-lg fade-in border'>
      <CardContent>
        <div className='flex justify-center items-center flex-col gap-4'>
          {/* Right: social links */}
          <div className='flex flex-row gap-3 flex-1 items-end'>
            {SocialLinks.map((link, index) => (
              <Button
                key={index}
                variant='link'
                size='sm'
                asChild
                className={`fade-in-from-bottom ${getDelayClass(index)} px-0 justify-end`}
              >
                <a
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1.5'
                >
                  <Image
                    src={link.icon}
                    alt={link.title}
                    width={16}
                    height={16}
                    className='size-4 not-dark:invert-100 dark:invert-0'
                  />
                  {link.title}
                </a>
              </Button>
            ))}
          </div>
          {/* Left: copyright, built by, photo credit */}
          <div className='flex flex-col gap-3 flex-1'>
            <p className='text-sm text-muted-foreground'>
              &copy; est. 2023-{new Date().getFullYear()} KDT (&quot;KPop Dance
              Team&quot;)
            </p>
            <div
              className='flex items-center justify-center gap-2 text-sm
                text-muted-foreground'
            >
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
              <ChevronRight className='text-muted-foreground size-4' />
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
            <p className='text-sm text-muted-foreground'>
              All photos provided by{' '}
              <a
                className='underline hover:opacity-70 transition-opacity'
                href='https://www.tsengphoto.ca/'
                target='_blank'
                rel='noreferrer'
              >
                Tseng Photography
              </a>
              .
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
