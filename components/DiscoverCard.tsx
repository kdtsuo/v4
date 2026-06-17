'use client';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
      className={`group block h-full ${!isOpen ? 'pointer-events-none opacity-50' : ''}
        ${className}`}
    >
      <div className='relative h-full overflow-hidden rounded-2xl shadow-lg'>
        <Image
          src={image}
          alt={title}
          fill
          className='object-cover object-center t200e group-hover:scale-105 brightness-50
            group-hover:brightness-100'
          priority
        />
        <div
          className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30
            to-black/10 transition-all duration-300 group-hover:from-black/75'
        />

        {Icon && (
          <div
            className='absolute left-4 top-4 rounded-full bg-white/20 p-2.5
              backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30'
          >
            <Icon size={16} strokeWidth={2} className='text-white' />
          </div>
        )}

        <div className='absolute bottom-0 left-0 right-0 p-5'>
          <div className='flex items-end justify-between'>
            <div className='flex-1'>
              <h3 className='text-xl font-bold text-white md:text-2xl'>{title}</h3>
              <p
                className='mt-1 translate-y-2 text-sm text-gray-300 opacity-0
                  transition-all duration-300 group-hover:translate-y-0
                  group-hover:opacity-100'
              >
                {description}
              </p>
            </div>
            <div
              className='ml-3 flex translate-x-2 items-center gap-1 opacity-0
                transition-all duration-300 group-hover:translate-x-0
                group-hover:opacity-100'
            >
              <span className='text-xs font-semibold text-white'>Explore</span>
              <ArrowRight size={14} className='text-white' />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
