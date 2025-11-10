// @ts-expect-error static import
import rmlogo from '@/assets/img/rmlogo.png';
import { useTheme } from '@/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { getDelayClass } from '@/utils';
import type { SocialLink } from '@/types';
import { socialLinks as SocialFallback } from '@/lib/FallbackData/SocialFallback';

export default function Footer() {
  const getYear = () => {
    const date = new Date();
    return date.getFullYear();
  };
  const { theme } = useTheme();
  const socialLinks: SocialLink[] = SocialFallback;
  return (
    <Card
      className='rounded-none border-none py-10 text-left drop-shadow-lg fade-in'
      style={{
        background: `var(--bg-xless-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
      }}
    >
      <CardContent>
        <div
          className='flex flex-col lg:flex-row w-full items-center lg:justify-between
            gap-8'
        >
          {/* Left: Text Section */}
          <div className='w-full sm:w-1/2 flex justify-center lg:justify-start'>
            <CardHeader>
              <CardTitle>&copy; {getYear()} KDT ("KPop Dance Team")</CardTitle>
              <CardDescription className='text-lg'>
                <div className='flex items-center space-x-2 text-sm my-2'>
                  <p>Made with ❤️ by</p>
                  <span>
                    <a href='https://rinm.dev' target='_blank' rel='noreferrer'>
                      <img
                        src={rmlogo}
                        alt='rmlogo'
                        className='mx-1 h-auto w-16 invert-0 not-dark:invert-100'
                      />
                    </a>
                  </span>
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
            {socialLinks.map((link, index) => (
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
                    <img
                      src={link.icon}
                      alt={link.title}
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
