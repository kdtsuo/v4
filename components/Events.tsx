'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  return (
    <Link href={event.link} target="_blank" rel="noopener noreferrer" className="block h-full">
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden p-0 relative h-full gap-4">
        <div className="relative aspect-[16/9] md:aspect-[2] w-full overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
          />
          {!event.isPast && (
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 rounded-lg shadow-md px-3 py-2 text-center min-w-[60px]">
              <div className="text-2xl font-bold leading-none">{event.day}</div>
              <div className="text-sm text-muted-foreground uppercase mt-1">{event.month}</div>
            </div>
          )}
        </div>
        
        <CardContent className="flex-1">
          <h3 className="font-semibold text-lg line-clamp-2 ">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 ">
            {event.location}
          </p>
          <p className="text-sm italic text-muted-foreground">
            {event.date}
          </p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Badge variant={event.price.toLowerCase().includes('free') ? 'green' : 'default'}>
            {event.price}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
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
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
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

  if (loading) {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
          <Spinner className="w-12 h-12" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { upcomingEvents, pastEvents } = eventsData;

  return (
    <Card className="w-full">
      <CardContent>
        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found at the moment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
