'use client';
import { Spinner } from '@/components/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth, useMediaQuery, useToast } from '@/hooks/';
import { getTimeSince, supabase } from '@/lib';
import { FallbackSponsors } from '@/lib/data/';
import { SponsorData, SponsorProps } from '@/types';
import {
  Edit,
  History,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  SquareArrowOutUpRight,
} from 'lucide-react';
import * as SponsorActions from '@/components/SponsorActions';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { getDelayClass } from '@/utils/animations';
import Image from 'next/image';

const Sponsor: React.FC<
  SponsorProps & {
    onSponsorUpdated?: () => void;
  }
> = ({
  id,
  image,
  title,
  location,
  maplink,
  text,
  websitelink,
  created_at,
  isAdmin = false,
  onSponsorDeleted = () => {},
  onSponsorUpdated = () => {},
}) => {
  const [imageError, setImageError] = useState(false);
  const { theme } = useTheme();

  const sponsorData: SponsorData = {
    id,
    image,
    title,
    location,
    maplink,
    text,
    websitelink,
    created_at,
  };

  const time = getTimeSince(created_at);

  return (
    <Card
      className='group t200e animate-fade-in relative mx-auto w-full max-w-md gap-0
        overflow-hidden rounded-xl p-0'
    >
      {/* Admin buttons */}
      {isAdmin && id && (
        <div className='absolute top-1 right-1 z-20 flex gap-2'>
          <SponsorActions.AddEditSponsorDialog
            mode='edit'
            sponsor={sponsorData}
            onSponsorSaved={onSponsorUpdated}
            trigger={
              <Button
                className='h-8 w-8 p-0'
                variant='secondary'
                size='sm'
                onClick={(e) => e.stopPropagation()}
              >
                <Edit size={16} />
              </Button>
            }
          />
          <SponsorActions.DeleteSponsorDialog
            sponsor={sponsorData}
            onSponsorDeleted={onSponsorDeleted}
          />
        </div>
      )}
      <Badge
        variant={time.months >= 8 ? 'gold' : time.months >= 4 ? 'platinum' : 'silver'}
        className='absolute top-2 left-2 z-20'
      >
        {time.months === 0 ? (
          <>
            <History /> Just Joined{' '}
            {time.days > 0
              ? `${time.days} ${time.days === 1 ? 'day' : 'days'}`
              : time.hours > 0
                ? `${time.hours} ${time.hours === 1 ? 'hour' : 'hours'}`
                : `${time.minutes} ${time.minutes === 1 ? 'min' : 'mins'}`}
          </>
        ) : (
          `${time.months}+ ${time.months === 1 ? 'month' : 'months'}`
        )}
      </Badge>

      {/* Edit Sponsor Dialog now handled by trigger prop above */}

      {/* Sponsor logo area */}
      <div className='relative h-48 overflow-hidden'>
        <div className='block h-full w-full' onClick={(e) => e.stopPropagation()}>
          <div
            className='absolute inset-0 flex items-center justify-center p-6'
            style={{
              background: `var(--bg-xless-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
            }}
          >
            {imageError ? (
              <div className='flex flex-col items-center justify-center'>
                <ImageIcon size={48} className='mb-2 text-gray-300' />
                <span className='text-sm text-gray-500'>{title}</span>
              </div>
            ) : (
              <Image
                src={image}
                alt={title}
                width={128}
                height={128}
                className='t200e max-h-32 object-contain group-hover:scale-110'
                onError={() => setImageError(true)}
                unoptimized // Remove this if your images are in /public
              />
            )}
          </div>
        </div>
      </div>

      {/* Sponsor content */}
      <CardContent
        className='bg-muted/20 flex flex-col items-center justify-center space-y-4 p-6
          text-center'
      >
        <CardTitle>
          <Button asChild className='w-full text-lg font-medium md:text-xl'>
            <a href={websitelink} target='_blank' rel='noopener noreferrer'>
              <div>{title}</div>
              <SquareArrowOutUpRight />
            </a>
          </Button>
        </CardTitle>
        <Button asChild variant='secondary'>
          <a href={maplink} target='_blank' rel='noopener noreferrer'>
            <MapPin />
            <div className='text-xs font-medium md:text-sm'>{location}</div>
            <SquareArrowOutUpRight />
          </a>
        </Button>
        <Badge
          className='bg-yellow-500 text-sm wrap-break-word whitespace-normal text-black'
        >
          {text}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default function Sponsors() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const { theme } = useTheme();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  function sponsorTenureSort(a: SponsorData, b: SponsorData) {
    const ta = getTimeSince(a.created_at);
    const tb = getTimeSince(b.created_at);

    if (tb.months !== ta.months) return tb.months - ta.months;
    if (tb.days !== ta.days) return tb.days - ta.days;
    if (tb.hours !== ta.hours) return tb.hours - ta.hours;
    if (tb.minutes !== ta.minutes) return tb.minutes - ta.minutes;
    return tb.seconds - ta.seconds;
  }

  const legacySponsors = sponsors
    .filter((s) => getTimeSince(s.created_at).months >= 8)
    .sort(sponsorTenureSort);

  const veteranSponsors = sponsors
    .filter(
      (s) =>
        getTimeSince(s.created_at).months >= 4 && getTimeSince(s.created_at).months < 8
    )
    .sort(sponsorTenureSort);

  const newSponsors = sponsors
    .filter((s) => getTimeSince(s.created_at).months < 4)
    .sort(sponsorTenureSort);

  const fetchSponsors = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.from('sponsors').select('*').order('title', {
        ascending: true,
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSponsors(data);
      } else {
        setSponsors(FallbackSponsors);
      }
    } catch (error) {
      toast.error('Failed to load sponsors. Using default data.');
      setSponsors(FallbackSponsors);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const topSponsor = sponsors.length ? [...sponsors].sort(sponsorTenureSort)[0] : null;

  return (
    <div>
      <section
        id='sponsors'
        className='relative overflow-hidden px-6 pt-30 md:pt-46'
        style={{
          background: `var(--bg-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
        }}
      >
        <div className='relative z-10 mx-auto w-full xl:w-3/4'>
          {/* Top Sponsor Hero Section */}
          {isLoading ? (
            <div className='flex justify-center items-center my-6'>
              <Spinner className='h-10 w-10' />
            </div>
          ) : (
            topSponsor && (
              <Card
                className='fade-in-from-bottom fill-mode-both my-6 flex flex-col
                  items-center gap-8 rounded-xl bg-yellow-100/20 p-8 shadow-lg
                  backdrop-blur-sm md:flex-row dark:bg-yellow-900/20'
              >
                <div className='shrink-0'>
                  <Avatar
                    className='size-32 border-4 border-yellow-400 shadow
                      fade-in-from-bottom'
                  >
                    <AvatarImage
                      src={topSponsor.image}
                      alt={topSponsor.title}
                      className='object-contain bg-primary-foreground'
                    />
                    <AvatarFallback
                      className='flex items-center justify-center bg-yellow-300 text-2xl
                        font-bold text-yellow-900'
                    >
                      {topSponsor.title?.charAt(0) ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardContent className='flex-1 text-center md:text-left'>
                  <CardTitle
                    className='mb-2 flex items-center justify-center gap-2 text-3xl
                      font-bold text-yellow-700 md:justify-start dark:text-yellow-300
                      fade-in-from-bottom'
                  >
                    🌟 Top Sponsor: {topSponsor.title}
                  </CardTitle>
                  <CardDescription className='mb-4 text-lg text-yellow-800
                    dark:text-yellow-200'>
                    <p className='fade-in-from-bottom'>
                      Thank you for supporting us for{' '}
                      <span className='font-semibold'>
                        {getTimeSince(topSponsor.created_at).months}{' '}
                        {getTimeSince(topSponsor.created_at).months === 1
                          ? 'month'
                          : 'months'}
                        {', '}
                        {getTimeSince(topSponsor.created_at).days}{' '}
                        {getTimeSince(topSponsor.created_at).days === 1 ? 'day' : 'days'}
                      </span>
                    </p>
                    <Badge className='fade-in-from-bottom' variant='gold'>
                      {topSponsor.text}
                    </Badge>
                  </CardDescription>
                  <div
                    className='flex flex-col justify-center gap-3 md:flex-row
                      md:justify-start fade-in-from-bottom'
                  >
                    <Button asChild variant='default'>
                      <a
                        href={topSponsor.websitelink}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Visit Sponsor Website <SquareArrowOutUpRight />
                      </a>
                    </Button>
                    <Button asChild variant='secondary'>
                      <a
                        href={topSponsor.maplink}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <MapPin />
                        {topSponsor.location}
                        <SquareArrowOutUpRight />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className='flex min-h-[200px] items-center justify-center pt-[1000px]'>
              <Loader2 className='text-lb-500 h-10 w-10 animate-spin' />
            </div>
          ) : (
            <section>
              {/* Legacy Sponsors */}
              <Card className='fade-in-from-right w-full'>
                <CardHeader>
                  <CardTitle className='fade-in-from-right text-3xl'>Sponsors</CardTitle>
                  <CardDescription className='fade-in-from-right'>
                    Become a sponsor now to help us continue our work!
                  </CardDescription>
                  {/* Admin section for logged in users */}
                  {user && (
                    <div className='mb-4 flex justify-end'>
                      <SponsorActions.AddEditSponsorDialog
                        mode='add'
                        onSponsorSaved={fetchSponsors}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className='fade-in-from-right flex flex-col gap-8'>
                  {/* Legacy Sponsors */}
                  <div>
                    <h1 className='mb-4 flex items-center gap-2 text-2xl font-bold'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className='inline-flex cursor-pointer items-center text-xl
                              lg:text-2xl'
                          >
                            🌟 Way Paver Sponsors
                            <Info size={15} className='text-muted-foreground ml-2' />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side={isMobile ? 'top' : 'right'} align='center'>
                          Our most dedicated sponsors who have been with us for 8 or more
                          months.
                        </TooltipContent>
                      </Tooltip>
                    </h1>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3'>
                      {legacySponsors.length === 0 ? (
                        <div
                          className='text-muted-foreground col-span-full rounded-lg border
                            border-dashed p-4 text-center'
                        >
                          No Way Paver sponsors yet.
                        </div>
                      ) : (
                        legacySponsors.map((sponsor, index) => (
                          <div
                            key={`legacy-${index}`}
                            className={`fade-in-from-right ${getDelayClass(index)}`}
                          >
                            <Sponsor
                              {...sponsor}
                              isAdmin={!!user}
                              onSponsorDeleted={fetchSponsors}
                              onSponsorUpdated={fetchSponsors}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Veteran Sponsors */}
                  <div>
                    <h1 className='mb-4 flex items-center gap-2 text-2xl font-bold'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className='inline-flex cursor-pointer items-center text-xl
                              lg:text-2xl'
                          >
                            ✨ Rising Stars Sponsors
                            <Info size={15} className='text-muted-foreground ml-2' />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side={isMobile ? 'top' : 'right'}>
                          Sponsors who have been with us for 4-7 months.
                        </TooltipContent>
                      </Tooltip>
                    </h1>
                    <div className='gap-8xl:grid-cols-3 grid grid-cols-1 md:grid-cols-2'>
                      {veteranSponsors.length === 0 ? (
                        <div
                          className='text-muted-foreground col-span-full rounded-lg border
                            border-dashed p-4 text-center'
                        >
                          No Rising Stars sponsors yet.
                        </div>
                      ) : (
                        veteranSponsors.map((sponsor, index) => (
                          <div
                            key={`veteran-${index}`}
                            className={`fade-in-from-right ${getDelayClass(index)}`}
                          >
                            <Sponsor
                              {...sponsor}
                              isAdmin={!!user}
                              onSponsorDeleted={fetchSponsors}
                              onSponsorUpdated={fetchSponsors}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* New Sponsors */}
                  <div>
                    <h1 className='mb-4 flex items-center gap-2 text-2xl font-bold'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className='inline-flex cursor-pointer items-center text-xl
                              lg:text-2xl'
                          >
                            🎤 Debut Sponsors
                            <Info size={15} className='text-muted-foreground ml-2' />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side={isMobile ? 'top' : 'right'}>
                          Sponsors who joined us within the last 3 months.
                        </TooltipContent>
                      </Tooltip>
                    </h1>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3'>
                      {newSponsors.length === 0 ? (
                        <div
                          className='text-muted-foreground col-span-full rounded-lg border
                            border-dashed p-4 text-center'
                        >
                          No debut sponsors yet.
                        </div>
                      ) : (
                        newSponsors.map((sponsor, index) => (
                          <div
                            key={`new-${index}`}
                            className={`fade-in-from-right ${getDelayClass(index)}`}
                          >
                            <Sponsor
                              {...sponsor}
                              isAdmin={!!user}
                              onSponsorDeleted={fetchSponsors}
                              onSponsorUpdated={fetchSponsors}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
