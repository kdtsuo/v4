'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Text } from '@/components/Text';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDelayClass } from '@/utils';
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

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  day: string;
  month: string;
  price: string;
  image: string;
  link: string;
  isPast?: boolean;
}

interface EventsData {
  upcomingEvents: Event[];
  pastEvents: Event[];
}

// Matches the grid's own breakpoints: grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-3
function useGridCols() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setCols(3);
      else if (w >= 640) setCols(2);
      else setCols(1);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cols;
}

function EventDetailsDialog({ event, open }: { event: Event; open: boolean }) {
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
                  className='prose prose-sm max-w-none text-muted-foreground'
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
              Buy on Rubric
              <ExternalLink size={14} className='ml-1.5' />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </DialogContent>
  );
}

function EventCard({ event, index }: { event: Event; index: number }) {
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
                <div className='text-xl font-bold leading-none text-white'>{event.day}</div>
                <Text
                  as='span'
                  variant='label'
                  size='xs'
                  className='mt-1 block uppercase tracking-wide text-white'
                >
                  {event.month}
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

function EventsSection({
  title,
  events,
  emptyMessage,
}: {
  title: string;
  events: Event[];
  emptyMessage?: string;
}) {
  const cols = useGridCols();
  const [expanded, setExpanded] = useState(false);

  // Collapse back to the compact view whenever the underlying event list
  // changes (e.g. a refetch), so stale expanded state doesn't persist.
  useEffect(() => {
    setExpanded(false);
  }, [events]);

  if (events.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className='mb-12 last:mb-0'>
        <Text variant='caption' size='xs' className='mb-4 text-center font-semibold uppercase tracking-[0.2em]'>
          {title}
        </Text>
        <div className='border rounded-xl border-dashed'>
          <Text variant='default' className='py-8 text-center text-muted-foreground'>
            {emptyMessage}
          </Text>
        </div>
      </div>
    );
  }

  const hasMore = events.length > cols;
  const visibleEvents = expanded ? events : events.slice(0, cols);

  return (
    <div className='mb-12 last:mb-0'>
      <div className='mb-2 flex flex-col items-center gap-4 justify-center'>
        <Text variant='caption' size='xs' className='font-semibold uppercase tracking-[0.2em]'>
          {title}
        </Text>

        {hasMore && (
          <Button
            type='button'
            onClick={() => setExpanded((e) => !e)}
          >
            <Text as='span' variant='label' size='xs' className='font-semibold uppercase tracking-wide'>
              {expanded ? 'Show less' : 'Show more'}
            </Text>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        )}
      </div>

      <div
        className='grid auto-rows-70 grid-cols-1 gap-4 sm:grid-cols-2
          lg:grid-cols-3'
      >
        {visibleEvents.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}

export function Events() {
  const [eventsData, setEventsData] = useState<EventsData>({
    upcomingEvents: [],
    pastEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data: EventsData = await response.json();
        setEventsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const { upcomingEvents, pastEvents } = eventsData;

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
            <EventsSection
              title='Upcoming Events'
              events={upcomingEvents}
            />
            <EventsSection title='Past Events' events={pastEvents} />
          </>
        )}
      </Card>
    </section>
  );
}
