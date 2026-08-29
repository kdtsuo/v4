'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Position } from '@/types';
import { ArrowDown, Clipboard, Edit, ExternalLink, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import * as PositionsActions from '@/components/PositionsActions';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { getDelayClass } from '@/utils';
import { Text } from '@/components/Text';

const fallbackPositions: Position[] = [
  {
    id: '688fea18-10c4-4c83-8ba7-76c29fa931d3',
    label: 'Executive Team',
    form_url: 'https://forms.gle/ufezb8Gut92E7pMeA',
    is_accepting_responses: false,
    description:
      "Executive Team runs the club's core operations. We plan events and performances, manage finances, handle promotions, coordinate practices, and represent the team with UBCO and external partners. We keep the club organized, visible, and growing.",
    created_at: '2025-03-08 07:01:20.911111+00',
  },
  {
    id: 'a3b290a3-b2e1-4924-af94-c554d6436d42',
    label: 'Performance Group',
    form_url: 'https://forms.gle/4CFzbsd3Xn1Lstns8',
    is_accepting_responses: true,
    description:
      'Performance group is for club members who wish to participate in performances and the showcase. Workshops and practice spaces will be provided; however, it will be expected that choreography is self-taught while the Performance Director will focus on formations, detail and quality.',
    created_at: '2025-03-09 07:01:20.911111+00',
  },
  {
    id: 'b4fbcd10-aa1c-4b21-b4e7-aec809657fdd',
    label: 'ACE',
    form_url: 'https://forms.gle/jUTrkHMrQkKF2RBKA',
    is_accepting_responses: true,
    description:
      'ACE Group is a performance-focused subunit made up of intermediate-advanced dancers and capable singers who will sing/rap + dance simultaneously, following a K-pop idol training style, but in a positive & supportive environment!',
    created_at: '2025-08-14 01:38:13.239365+00',
  },
  {
    id: 'b6019b1e-4f69-4315-8f1f-e9cd474d2ba2',
    label: 'Dance Instructor',
    form_url: 'https://forms.gle/eciAuTKB63WLQzGg7',
    is_accepting_responses: true,
    description:
      'Dance Instructors leads weekly classes by teaching choreography selected through member and non-member song voting. They break down routines clearly, guide skill development for all levels, and keep practices structured, fun, and high-energy.',
    created_at: '2025-03-10 07:01:20.911111+00',
  },
  {
    id: 'e9ab7739-4a07-449c-84b5-5cdb24411e87',
    label: 'Cameraman',
    form_url: 'https://forms.gle/LpXTwzCNKjVZN3De9',
    is_accepting_responses: true,
    description:
      'Cameraman leads all photography and videography for the club, capturing classes, performances, and events for marketing and promotion. They manage filming, editing, and visual content to maintain a strong online presence and brand image.',
    created_at: '2025-03-11 07:01:20.911111+00',
  },
];

export default function Positions() {
  const [positionsData, setPositionsData] = useState<Position[]>(fallbackPositions);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  const fetchPositionFromDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch error details:', error);
        throw error;
      }

      const positions = data && data.length > 0 ? data : fallbackPositions;
      setPositionsData(positions);
    } catch (error) {
      setPositionsData(fallbackPositions);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositionFromDatabase();
  }, [fetchPositionFromDatabase]);

  const handleCopyLink = (formUrl: string, label: string) => {
    navigator.clipboard.writeText(formUrl);
    toast.success(`Copied ${label} link to clipboard!`);
  };

  return (
    <div className='animate-fade-in overflow-x-hidden'>
      {/* Hero — keep as-is */}
      <div className='relative h-screen w-screen'>
        <Image
          className='object-cover brightness-[0.25]'
          src='/assets/img/stock/joinourteam.jpeg'
          alt='team'
          fill
          priority
        />
        <div
          className='relative flex h-full flex-col items-center justify-center space-y-4
            p-4 text-white'
        >
          <div className='flex flex-col justify-center max-w-screen-sm'>
            <Text
              variant='hd-xxl'
              className='text-lightblue-100 fade-in-from-bottom my-5 text-center delay-75'
            >
              Find out what position fits you!
            </Text>
            <Text
              variant='default'
              size='xl'
              className='fade-in-from-bottom text-center delay-150'
            >
              We have a variety of positions available for you to join! Whether
              you&apos;re interested in dancing, videography, or graphic design, we have a
              spot for you.
            </Text>
          </div>
          <div className='fade-in-from-bottom delay-300'>
            <Button
              variant='default'
              onClick={() => {
                const section = document.getElementById('positions-section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Positions <ArrowDown />
            </Button>
          </div>
        </div>
      </div>

      <div id='positions-section' />

      <section
        style={{
          background: `var(--bg-xless-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
        }}
      >
        <div className='container mx-auto rounded-2xl px-4 py-10'>
          {/* Section header */}
          <div className='fade-in-from-bottom mb-10 text-center'>
            <Text
              variant='caption'
              size='xs'
              className='mb-1 font-semibold uppercase tracking-[0.2em]'
            >
              Join the Team
            </Text>
            <Text variant='hd-xl'>Positions</Text>
            <Text variant='muted' className='mt-3'>
              Explore the various positions available to join within our club!
            </Text>
          </div>

          {/* Admin — add button */}
          {user && (
            <div className='fade-in-from-bottom mb-6 flex justify-center'>
              <PositionsActions.AddEdit
                onPositionSaved={fetchPositionFromDatabase}
                trigger={
                  <Button variant='default'>
                    <Plus className='h-4 w-4' /> Add Position
                  </Button>
                }
              />
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className='fade-in-from-bottom rounded-2xl'>
                  <div className='p-6 space-y-3'>
                    <Skeleton className='h-5 w-24 rounded-full' />
                    <Skeleton className='h-7 w-3/4' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-5/6' />
                  </div>
                  <CardFooter className='flex gap-2 border-t p-4'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 flex-1' />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {positionsData.map((position, index) => (
                <Card
                  key={position.id}
                  className={`fade-in-from-bottom ${getDelayClass(index)} flex flex-col
                    gap-2 justify-between`}
                >
                  <CardHeader className='gap-3'>
                    {/* Status + admin controls row */}
                    <div className='flex items-center justify-between'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5
                          py-1 text-xs font-semibold ${
                            position.is_accepting_responses
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-red-500/10 text-red-500 dark:text-red-400'
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full
                            ${position.is_accepting_responses ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        {position.is_accepting_responses
                          ? 'Accepting Applications'
                          : 'Closed'}
                      </span>

                      {user && (
                        <div className='flex gap-1.5'>
                          <PositionsActions.AddEdit
                            position={position}
                            onPositionSaved={fetchPositionFromDatabase}
                            trigger={
                              <Button
                                variant='secondary'
                                size='icon'
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit />
                              </Button>
                            }
                          />
                          <PositionsActions.Delete
                            position={position}
                            onPositionDeleted={fetchPositionFromDatabase}
                            trigger={
                              <Button
                                variant='destructive'
                                size='icon'
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 />
                              </Button>
                            }
                          />
                        </div>
                      )}
                    </div>

                    <CardTitle
                      className={`text-xl
                        ${!position.is_accepting_responses ? 'opacity-50' : ''}`}
                    >
                      <Text variant='hd-sm'>{position.label}</Text>
                    </CardTitle>
                  </CardHeader>

                  {position.description && (
                    <CardContent>
                      <Text
                        variant='muted'
                        size='sm'
                        className={`leading-relaxed
                          ${!position.is_accepting_responses ? 'opacity-50' : ''}`}
                      >
                        {position.description}
                      </Text>
                    </CardContent>
                  )}

                  <CardFooter className='flex gap-2 border-t pt-4'>
                    <Button
                      variant='secondary'
                      className='flex-1'
                      onClick={() => handleCopyLink(position.form_url, position.label)}
                      disabled={!position.is_accepting_responses && !user}
                    >
                      <Clipboard className='h-4 w-4' /> Copy Link
                    </Button>
                    <Button
                      variant='default'
                      className='flex-1'
                      disabled={!position.is_accepting_responses && !user}
                      asChild
                    >
                      <Link
                        href={position.form_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <ExternalLink className='h-4 w-4' /> Go to Form
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
