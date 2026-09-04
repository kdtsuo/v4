'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Text } from '@/components/Text';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDelayClass } from '@/utils';
import type { ClubData, MerchItem } from '@/types';
import { ExpandableGridSection } from './ExpandableGridSection';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

function MerchDetailsDialog({ item }: { item: MerchItem }) {
  const isFree = item.price.toLowerCase().includes('free');

  return (
    <DialogContent className='overflow-hidden p-0 sm:max-w-lg flex flex-col max-h-[70vh] sm:max-h-[85vh] '>
      {/* Visually hidden title for accessibility — Radix requires a DialogTitle */}
      <DialogTitle className='sr-only'>{item.title}</DialogTitle>

      <Card className='border-0 gap-0 py-0 flex flex-col min-h-0 flex-1'>
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='relative w-full'>
            <Image
              src={item.image}
              alt={item.title}
              width={800}
              height={600}
              className='w-full h-auto object-contain'
              sizes='(max-width: 640px) 100vw, 32rem'
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent' />
            <Badge
              className={`border border-white absolute left-4 top-4 rounded-full px-3 py-1 backdrop-blur-sm
                ${isFree ? 'bg-emerald-500/80' : 'bg-white/20'}`}
            >
              <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                {item.price}
              </Text>
            </Badge>
            {item.preOrder && (
              <Badge
                className='border border-white absolute right-4 top-4 rounded-full bg-amber-500/80 px-3 py-1
                  backdrop-blur-sm'
              >
                <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                  Pre-order
                </Text>
              </Badge>
            )}
          </div>

          <CardHeader className='py-2 border-b'>
            <Text variant='hd-md'>{item.title}</Text>
          </CardHeader>

          <CardContent className='flex flex-col gap-2 pt-2'>
            <div className='border-t py-3'>
              {item.description ? (
                <div
                  className='rubric-description'
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              ) : (
                <Text variant='default' size='sm' className='text-muted-foreground'>
                  No description available.
                </Text>
              )}
            </div>
          </CardContent>
        </div>

        <CardFooter className='flex flex-col-reverse  sm:flex-row flex-wrap justify-end gap-2 border-t p-4 shrink-0'>
          <DialogClose asChild>
            <Button variant='outline' className='w-full sm:w-auto'>Close</Button>
          </DialogClose>
          <Button asChild className='w-full sm:w-auto'>
            <Link href={item.link} target='_blank' rel='noopener noreferrer'>
              {item.price === 'Free'?'Free on Rubric': item.price + " on Rubric"}
              <ExternalLink size={14} />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </DialogContent>
  );
}

function MerchCard({ item, index }: { item: MerchItem; index: number }) {
  const isFree = item.price.toLowerCase().includes('free');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type='button'
          className={`group block h-full w-full text-left fade-in-from-bottom ${getDelayClass(index)}`}
        >
          <div className='relative h-full min-h-70 overflow-hidden rounded-2xl shadow-lg'>
            <Image
              src={item.image}
              alt={item.title}
              fill
              className='object-cover object-center t200e group-hover:scale-105 brightness-50
                group-hover:brightness-100'
              sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
            />
            <div
              className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30
                to-black/10 transition-all duration-300 group-hover:from-black/75'
            />

            {item.preOrder && (
              <Badge
                className='absolute left-4 top-4 rounded-full bg-amber-500/80 px-3 py-1 backdrop-blur-sm
                  transition-all duration-300 group-hover:bg-amber-500/90'
              >
                <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                  Pre-order
                </Text>
              </Badge>
            )}

            <Badge
              className={`absolute right-4 top-4 rounded-full px-3 py-1 backdrop-blur-sm
                ${isFree ? 'bg-emerald-500/80' : 'bg-white/20'}`}
            >
              <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                {item.price}
              </Text>
            </Badge>

            <div className='absolute bottom-0 left-0 right-0 p-5'>
              <div className='transition-transform duration-300 translate-y-full group-hover:translate-y-0'>
                <Text variant='hd-md' className='text-white line-clamp-2'>
                  {item.title}
                </Text>
              </div>

              <div
                className='mt-3 flex translate-x-2 items-center gap-1 opacity-0 transition-all
                  duration-300 group-hover:translate-x-0 group-hover:opacity-100'
              >
                <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                  View Item
                </Text>
                <ArrowRight size={14} className='text-white' />
              </div>
            </div>
          </div>
        </button>
      </DialogTrigger>

      <MerchDetailsDialog item={item} />
    </Dialog>
  );
}

export function Merchandise() {
  const [merchandise, setMerchandise] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMerchandise() {
      try {
        setLoading(true);
        const response = await fetch('/api/club');
        if (!response.ok) throw new Error('Failed to fetch club data');
        const data: ClubData = await response.json();
        setMerchandise(data.merchandise ?? []);
        setError(null);
      } catch (err) {
        console.error('Error fetching merchandise:', err);
        setError('Failed to load merchandise. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchMerchandise();
  }, []);

  if (!loading && !error && merchandise.length === 0) return null;

  return (
    <section className='container mx-auto px-4 mb-4 mt-10'>
      <Card className='p-4'>
        <div className='fade-in-from-bottom text-center'>
          <Text variant='caption' size='xs' className='mb-1 font-semibold uppercase tracking-[0.2em]'>
            Shop
          </Text>
          <Text variant='hd-xl'>Merchandise</Text>
        </div>

        {loading && (
          <div className='flex min-h-[240px] items-center justify-center'>
            <Spinner className='w-10 h-10' />
          </div>
        )}

        {!loading && error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <ExpandableGridSection
            items={merchandise}
            renderCard={(item, i) => <MerchCard item={item} index={i} />}
          />
        )}
      </Card>
    </section>
  );
}
