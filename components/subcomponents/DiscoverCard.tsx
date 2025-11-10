import { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import Link from 'next/link';

interface DiscoverCardProps {
  className?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  image: string;
  link: string;
  isOpen: boolean;
}

export function DiscoverCard({
  className,
  icon: Icon,
  title,
  description,
  image,
  link,
  isOpen,
}: DiscoverCardProps) {
  return (
    <Link
      href={link}
      className={`t200e block ${!isOpen ? 'opacity-50' : 'opacity-100'} ${className}`}
    >
      <Card className='group border-ring t200e relative h-full overflow-hidden shadow-lg'>
        {/* Background image */}
        <div
          className='t200e absolute inset-0 bg-cover bg-center'
          style={{ backgroundImage: `url(${image})` }}
        />

        {/* Dark overlay */}
        <div className='t200e absolute inset-0 bg-black opacity-75 group-hover:opacity-60' />

        {/* Dot pattern overlay - only visible on hover */}
        <div className='t200e absolute inset-0 opacity-25 group-hover:opacity-40' />

        {/* Content */}
        <div
          className='relative z-10 flex h-full flex-col items-center justify-center p-6
            text-center'
        >
          <CardHeader className='pb-2'>
            {Icon && <Icon size={25} strokeWidth={2} className='mx-auto text-white' />}
            <CardTitle className='text-lg font-bold text-white md:text-3xl'>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <CardDescription className='t200e text-sm text-gray-200 md:text-xl'>
              {description}
            </CardDescription>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
