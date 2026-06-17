'use client';
import { getDelayClass } from '@/utils';
import { Text } from '@/components/Text';
import { DiscoverCard } from '@/components/';
import { DiscoverLinks } from '@/lib/data';

export function Discover() {
  return (
    <section className='container mx-auto px-4 mb-4 mt-10'>
      <div className='fade-in-from-bottom mb-6 text-center'>
        <Text
          variant='caption'
          size='xs'
          className='mb-1 font-semibold uppercase tracking-[0.2em]'
        >
          Explore
        </Text>
        <Text variant='hd-xl'>Discover More</Text>
      </div>

      <div
        className='grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2
          sm:auto-rows-[260px] lg:grid-cols-3'
      >
        {DiscoverLinks.map((card, index) => (
          <DiscoverCard
            key={`${card.title}-${index}`}
            title={card.title}
            icon={card.icon}
            description={card.description}
            image={card.image}
            link={card.link}
            isOpen={card.isOpen}
            className={`fade-in-from-bottom ${getDelayClass(index)}${
              index === 0
                ? ' lg:col-span-2 lg:row-span-2'
                : index === 3
                  ? ' lg:col-span-3'
                  : ''
            }`}
          />
        ))}
      </div>
    </section>
  );
}
