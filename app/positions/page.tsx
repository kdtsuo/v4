'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Position } from '@/types';
import { Clipboard, Edit, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import * as PositionsActions from '@/components/PositionsActions';
import Link from 'next/link';

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
      {/* Hero Section */}
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
          <div>
            <h1
              className='text-lightblue-100 fade-in-from-bottom my-5 text-center text-3xl
                font-bold delay-75 lg:text-4xl'
            >
              Find out what position fits you!
            </h1>
            <p
              className='lg:paragraph fade-in-from-bottom max-w-screen-sm text-center
                text-xl delay-150'
            >
              We have a variety of positions available for you to join! Whether
              you&apos;re interested in dancing, videography, or graphic design, we have a
              spot for you.
            </p>
          </div>

          {/* Add Position Button - Admin Only */}
          {user && (
            <div
              className='fade-in-from-bottom flex justify-center gap-2 flex-wrap
                delay-200'
            >
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
        </div>
      </div>

      {/* Positions Cards Section */}
      {isLoading ? (
        <div className='container mx-auto px-4 py-16'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, index) => (
              <Card key={index} className='fade-in-from-bottom'>
                <CardHeader>
                  <Skeleton className='h-7 w-3/4 mb-2' />
                  <Skeleton className='h-4 w-full' />
                </CardHeader>
                <CardFooter className='flex gap-2'>
                  <Skeleton className='h-10 flex-1' />
                  <Skeleton className='h-10 flex-1' />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className='container mx-auto px-4 py-16'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {positionsData.map((position, index) => (
              <Card
                key={index}
                className='fade-in-from-bottom justify-between relative'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Admin buttons */}
                {user && (
                  <div className='absolute top-2 right-2 z-10 flex gap-2'>
                    <PositionsActions.AddEdit
                      position={position}
                      onPositionSaved={fetchPositionFromDatabase}
                      trigger={
                        <Button
                          className='h-8 w-8 p-0'
                          variant='secondary'
                          size='sm'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      }
                    />
                    <PositionsActions.Delete
                      position={position}
                      onPositionDeleted={fetchPositionFromDatabase}
                      trigger={
                        <Button
                          className='h-8 w-8 p-0'
                          variant='destructive'
                          size='sm'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      }
                    />
                  </div>
                )}
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <CardTitle
                      className={`text-xl
                        ${!position.is_accepting_responses ? 'opacity-50' : ''}`}
                    >
                      {position.label}
                    </CardTitle>
                  </div>
                  {position.description && (
                    <CardDescription
                      className={`text-base
                        ${!position.is_accepting_responses ? 'opacity-50' : ''}`}
                    >
                      {position.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className='flex gap-2'>
                  {!position.is_accepting_responses && (
                    <>
                      <X className='h-5 w-5 text-red-500 shrink-0' />
                      <div className='text-sm text-red-500 font-medium'>
                        Not accepting applications currently
                      </div>
                    </>
                  )}
                </CardContent>

                <CardFooter className='flex gap-2 flex-wrap'>
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
                  >
                    <Link
                      href={position.form_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center gap-2'
                    >
                      <ExternalLink className='h-4 w-4' /> Go to Form
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
