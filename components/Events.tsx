'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ExternalLink, Star } from 'lucide-react';
import { Text } from '@/components/Text';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDelayClass } from '@/utils';
import type { ClubData, ClubEvent } from '@/types';
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

interface Review {
  displayName: string;
  rating: number;
  review: string;
  ratingDate: string;
}

interface ReviewsData {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={2}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/40'}
        />
      ))}
    </div>
  );
}

function ReviewsSection() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/reviews')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(true);
        } else {
          setData(json);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className='mb-12 last:mb-0'>
        <Text variant='caption' size='xs' className='mb-4 text-center font-semibold uppercase tracking-[0.2em]'>
          Reviews
        </Text>
        <div className='flex justify-center py-8'>
          <Spinner className='size-8 text-muted' />
        </div>
      </div>
    );
  }

  if (error || !data || data.totalReviews === 0) return null;

  return (
    <div className='mb-12 last:mb-0'>
      <Text variant='caption' size='xs' className='mb-4 text-center font-semibold uppercase tracking-[0.2em]'>
        Reviews
      </Text>

      <div className='flex items-center justify-center gap-2 mb-4'>
        <StarRating rating={Math.round(data.avgRating)} />
        <Text as='span' variant='default' size='sm' className='font-semibold'>
          {data.avgRating.toFixed(1)}
        </Text>
        <Text as='span' variant='default' size='sm' className='text-muted-foreground'>
          ({data.totalReviews} {data.totalReviews === 1 ? 'review' : 'reviews'})
        </Text>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data.reviews.map((r, i) => (
          <Card key={i} className='p-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center justify-between'>
                <Text as='span' variant='default' size='sm' className='font-semibold'>
                  {r.displayName}
                </Text>
                <StarRating rating={r.rating} />
              </div>
              <Text as='p' variant='default' size='sm' className='text-muted-foreground whitespace-pre-line'>
                {r.review}
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventDetailsDialog({ event, open }: { event: ClubEvent; open: boolean }) {
  const isFree = event.price.toLowerCase().includes('free');
  const [description, setDescription] = useState<string | null>(null);
  const [descLoading, setDescLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setDescLoading(true);
    setDescription(null);

    fetch(`/api/events/${event.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDescription(data.description ?? null);
      })
      .catch(() => {
        if (!cancelled) setDescription(null);
      })
      .finally(() => {
        if (!cancelled) setDescLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, event.id]);

  return (
    <DialogContent className='overflow-hidden p-0 sm:max-w-lg flex flex-col max-h-[60vh] sm:max-h-[85vh] '>
      {/* Visually hidden title for accessibility — Radix requires a DialogTitle */}
      <DialogTitle className='sr-only'>{event.title}</DialogTitle>

      <Card className='border-0 gap-0 py-0 flex flex-col min-h-0 flex-1'>
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='relative w-full'>
            <Image
              src={event.image}
              alt={event.title}
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
                {event.price}
              </Text>
            </Badge>
          </div>

          <CardHeader className='py-2 border-b'>
            <Text variant='hd-md'>{event.title}</Text>
          </CardHeader>

          <CardContent className='flex flex-col gap-2 pt-2'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Calendar className='size-4 shrink-0' />
                <Text as='span' variant='default' size='sm'>
                  {event.date}
                </Text>
              </div>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MapPin className='size-4 shrink-0' />
                <Text as='span' variant='default' size='sm'>
                  {event.location}
                </Text>
              </div>
            </div>

            <div className='border-t py-3'>
              {descLoading && (
                <div className='flex justify-center my-4'>
                  <Spinner className='size-8 text-muted' />
                </div>
              )}
              {!descLoading && description && (
                <div
                  className='rubric-description'
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
              {!descLoading && !description && (
                <Text variant='default' size='sm' className='text-muted-foreground'>
                  No description available.
                </Text>
              )}
            </div>
          </CardContent>
        </div>

        <CardFooter className='flex justify-end gap-2 border-t-1 p-4 shrink-0'>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
          <Button asChild>
            <Link href={event.link} target='_blank' rel='noopener noreferrer'>
              {event.price === 'Free'?'Get it free on Rubric':'Get it on Rubric for ' + event.price}
              <ExternalLink size={14} className='ml-1.5' />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </DialogContent>
  );
}

function EventCard({ event, index }: { event: ClubEvent; index: number }) {
  const isFree = event.price.toLowerCase().includes('free');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className={`group block h-full w-full text-left fade-in-from-bottom ${getDelayClass(index)}`}
        >
          <div className='relative h-full min-h-70 overflow-hidden rounded-2xl shadow-lg'>
            <Image
              src={event.image}
              alt={event.title}
              fill
              className='object-cover object-center t200e group-hover:scale-105 brightness-50
                group-hover:brightness-100'
              sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
            />
            <div
              className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30
                to-black/10 transition-all duration-300 group-hover:from-black/75'
            />

            {!event.isPast && (
              <div
                className='absolute left-4 top-4 rounded-xl bg-white/20 px-3 py-2 text-center
                  backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30'
              >
                <Text
                  as='span'
                  variant='label'
                  size='lg'
                  className='font-bold text-white tracking-wide'
                >{event.day}
                </Text>
                <Text
                  as='span'
                  variant='label'
                  size='xs'
                  className='mt-1 block uppercase tracking-wide text-white '
                >{event.month}
                </Text>
              </div>
            )}

            <Badge
              className={`absolute right-4 top-4 rounded-full px-3 py-1 backdrop-blur-sm
                ${isFree ? 'bg-emerald-500/80' : 'bg-white/20'}`}
            >
              <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                {event.price}
              </Text>
            </Badge>

            <div className='absolute bottom-0 left-0 right-0 p-5'>
              <div className='transition-transform duration-300 translate-y-full group-hover:translate-y-0'>
                <Text variant='hd-md' className='text-white line-clamp-2'>
                  {event.title}
                </Text>
              </div>

              <div
                className='mt-2 flex translate-y-2 flex-col gap-1 opacity-0 transition-all
                  duration-300 group-hover:translate-y-0 group-hover:opacity-100'
              >
                <div className='flex items-center gap-1.5 text-gray-300'>
                  <Calendar size={12} strokeWidth={2} className='shrink-0' />
                  <Text as='span' variant='default' size='sm'>
                    {event.date}
                  </Text>
                </div>
                <div className='flex items-center gap-1.5 text-gray-300'>
                  <MapPin size={12} strokeWidth={2} className='shrink-0' />
                  <Text as='span' variant='default' size='sm' className='line-clamp-1'>
                    {event.location}
                  </Text>
                </div>
              </div>

              <div
                className='mt-3 flex translate-x-2 items-center gap-1 opacity-0 transition-all
                  duration-300 group-hover:translate-x-0 group-hover:opacity-100'
              >
                <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                  View Event
                </Text>
                <ArrowRight size={14} className='text-white' />
              </div>
            </div>
          </div>
        </button>
      </DialogTrigger>

      <EventDetailsDialog event={event} open={open} />
    </Dialog>
  );
}

export function Events() {
  const [events, setEvents] = useState<Pick<ClubData, 'upcomingEvents' | 'pastEvents'>>({
    upcomingEvents: [],
    pastEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClub() {
      try {
        setLoading(true);
        const response = await fetch('/api/club');
        if (!response.ok) throw new Error('Failed to fetch club data');
        const data: ClubData = await response.json();
        setEvents({ upcomingEvents: data.upcomingEvents, pastEvents: data.pastEvents });
        setError(null);
      } catch (err) {
        console.error('Error fetching club data:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchClub();
  }, []);

  const { upcomingEvents, pastEvents } = events;

  return (
    <section className='container mx-auto px-4 mb-4 mt-10'>
      <Card className='p-4'>
        <div className='fade-in-from-bottom text-center'>
          <Text variant='caption' size='xs' className='mb-1 font-semibold uppercase tracking-[0.2em]'>
            Happening
          </Text>
          <Text variant='hd-xl'>Events</Text>
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
          <>
            <ExpandableGridSection
              title='Upcoming Events'
              items={upcomingEvents}
              renderCard={(event, i) => <EventCard event={event} index={i} />}
            />
            <ExpandableGridSection
              title='Past Events'
              items={pastEvents}
              renderCard={(event, i) => <EventCard event={event} index={i} />}
            />
            <ReviewsSection />
          </>
        )}
      </Card>
    </section>
  );
}
