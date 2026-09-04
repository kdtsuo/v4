'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  ArrowRight,
  Edit,
  ExternalLink,
  History,
  ImageIcon,
  Info,
  MapPin,
} from 'lucide-react';
import { Text } from '@/components/Text';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDelayClass } from '@/utils';
import { getTimeSince, supabase } from '@/lib';
import { FallbackSponsors } from '@/lib/data';
import type { SponsorData } from '@/types';
import * as SponsorActions from '@/components/SponsorActions';
import { useAuth, useMediaQuery, useToast } from '@/hooks';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';

function sponsorTenureSort(a: SponsorData, b: SponsorData) {
  const ta = getTimeSince(a.created_at);
  const tb = getTimeSince(b.created_at);

  if (tb.months !== ta.months) return tb.months - ta.months;
  if (tb.days !== ta.days) return tb.days - ta.days;
  if (tb.hours !== ta.hours) return tb.hours - ta.hours;
  if (tb.minutes !== ta.minutes) return tb.minutes - ta.minutes;
  return tb.seconds - ta.seconds;
}

function isSameSponsor(a: SponsorData, b: SponsorData | null) {
  if (!b) return false;
  if (a.id && b.id) return a.id === b.id;
  return a.title === b.title;
}

function tenureBadgeVariant(months: number) {
  if (months >= 8) return 'gold' as const;
  if (months >= 4) return 'platinum' as const;
  return 'silver' as const;
}

function sponsorCardDottedBg(theme: string | undefined) {
  return `var(--bg-xless-dotted-${theme === 'dark' ? 'light' : 'dark'})`;
}

function tenureLabel(time: ReturnType<typeof getTimeSince>) {
  if (time.months === 0) {
    const duration =
      time.days > 0
        ? `${time.days} ${time.days === 1 ? 'day' : 'days'}`
        : time.hours > 0
          ? `${time.hours} ${time.hours === 1 ? 'hour' : 'hours'}`
          : `${time.minutes} ${time.minutes === 1 ? 'min' : 'mins'}`;
    return `Just Joined ${duration}`;
  }
  return `${time.months}+ ${time.months === 1 ? 'month' : 'months'}`;
}

function SponsorLogo({
  src,
  alt,
  className,
  size = 128,
}: {
  src: string;
  alt: string;
  className?: string;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`flex flex-col items-center justify-center ${className ?? ''}`}>
        <ImageIcon size={48} className='mb-2 text-muted-foreground' />
        <Text as='span' variant='default' size='sm' className='text-muted-foreground'>
          {alt}
        </Text>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={() => setImageError(true)}
      unoptimized
    />
  );
}

function SponsorDetailsDialog({ sponsor }: { sponsor: SponsorData }) {
  const time = getTimeSince(sponsor.created_at);

  return (
    <DialogContent className='flex max-h-[75vh] flex-col overflow-hidden p-0'>
      <DialogTitle className='sr-only'>{sponsor.title}</DialogTitle>

      <Card className='flex min-h-0 flex-1 flex-col gap-0 border-0 py-0'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='relative flex min-h-48 items-center justify-center bg-muted p-8'>
            <SponsorLogo
              src={sponsor.image}
              alt={sponsor.title}
              size={160}
              className='max-h-36 object-contain'
            />
            <Badge className='absolute top-4 left-4 rounded-full bg-amber-500/90 px-3 py-1 backdrop-blur-sm'>
              <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                {sponsor.text}
              </Text>
            </Badge>
          </div>

          <CardHeader className='border-b py-3 flex flex-col gap-2'>
            <Text variant='hd-md'>{sponsor.title}</Text>
            <Badge variant={tenureBadgeVariant(time.months)}>
              <History size={12} />
              {tenureLabel(time)}
            </Badge>
          </CardHeader>

          <CardContent className='flex flex-col gap-3 py-3'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <MapPin className='size-4 shrink-0' />
              <Text as='span' variant='default' size='sm'>
                {sponsor.location}
              </Text>
            </div>
            <Text variant='muted' size='sm'>
              Show your KDT membership at checkout to redeem this offer.
            </Text>
          </CardContent>
        </div>

        <CardFooter className='flex flex-col-reverse  sm:flex-row flex-wrap justify-end gap-2 border-t p-4 shrink-0'>
          <DialogClose asChild>
            <Button variant='outline' className='w-full sm:w-auto'>Close</Button>
          </DialogClose>
          <Button asChild variant='secondary' className='w-full sm:w-auto'>
            <a href={sponsor.maplink} target='_blank' rel='noopener noreferrer'>
              Directions
              <ExternalLink size={14} />
            </a>
          </Button>
          <Button asChild className='w-full sm:w-auto'>
            <a href={sponsor.websitelink} target='_blank' rel='noopener noreferrer'>
              Visit Website
              <ExternalLink size={14} />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </DialogContent>
  );
}

function SponsorCard({
  sponsor,
  index,
  isAdmin,
  onRefresh,
}: {
  sponsor: SponsorData;
  index: number;
  isAdmin: boolean;
  onRefresh: () => void;
}) {
  const { theme } = useTheme();
  const time = getTimeSince(sponsor.created_at);
  const dottedBg = sponsorCardDottedBg(theme);

  return (
    <Dialog>
      <div className='relative h-full'>
        {isAdmin && sponsor.id && (
          <div
            className='absolute top-3 right-3 z-20 flex gap-2'
            onClick={(e) => e.stopPropagation()}
          >
            <SponsorActions.AddEditSponsorDialog
              mode='edit'
              sponsor={sponsor}
              onSponsorSaved={onRefresh}
              trigger={
                <Button className='h-8 w-8 p-0' variant='secondary' size='sm'>
                  <Edit size={16} />
                </Button>
              }
            />
            <SponsorActions.DeleteSponsorDialog
              sponsor={sponsor}
              onSponsorDeleted={onRefresh}
            />
          </div>
        )}

        <DialogTrigger asChild>
          <button
            type='button'
            className={`group block h-full w-full text-left fade-in-from-bottom ${getDelayClass(index)}`}
          >
            <div className='relative h-full min-h-70 overflow-hidden rounded-2xl shadow-lg border-muted border'>
              <div className='absolute inset-0' style={{ background: dottedBg }} />
              <div className='absolute inset-0 flex items-center justify-center p-8'>
                <SponsorLogo
                  src={sponsor.image}
                  alt={sponsor.title}
                  size={192}
                  className='t200e max-h-36 object-contain group-hover:scale-110'
                />
              </div>
              <div
                className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30
                  to-transparent transition-all duration-300 group-hover:from-black/75'
              />

              <Badge
                className='absolute top-4 left-4 rounded-full bg-amber-500/80 px-3 py-1
                  backdrop-blur-sm transition-all duration-300 group-hover:bg-amber-500/90'
              >
                <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                  {sponsor.text}
                </Text>
              </Badge>

              <div className='absolute right-0 bottom-0 left-0 p-5'>
                <div className='translate-y-full transition-transform duration-300 group-hover:translate-y-0'>
                  <Text variant='hd-md' className='line-clamp-2 text-white'>
                    {sponsor.title}
                  </Text>
                </div>

                <div
                  className='mt-2 flex translate-y-2 items-center gap-1.5 text-gray-300 opacity-0
                    transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'
                >
                  <MapPin size={12} strokeWidth={2} className='shrink-0' />
                  <Text as='span' variant='default' size='sm' className='line-clamp-1'>
                    {sponsor.location}
                  </Text>
                </div>

                <div
                  className='mt-3 flex translate-x-2 items-center gap-1 opacity-0 transition-all
                    duration-300 group-hover:translate-x-0 group-hover:opacity-100'
                >
                  <Text as='span' variant='label' size='xs' className='font-semibold text-white'>
                    View Details
                  </Text>
                  <ArrowRight size={14} className='text-white' />
                </div>
              </div>
            </div>
          </button>
        </DialogTrigger>
      </div>

      <SponsorDetailsDialog sponsor={sponsor} />
    </Dialog>
  );
}

function FeaturedSponsor({ sponsor }: { sponsor: SponsorData }) {
  const time = getTimeSince(sponsor.created_at);

  return (
    <section className='container mx-auto mb-4 px-4'>
      <Card className='fade-in-from-bottom p-6 md:p-8'>
        <div className='flex flex-col items-center gap-6 md:flex-row md:items-center'>
          <div
            className='bg-muted/30 flex size-44 shrink-0 items-center justify-center rounded-2xl
              p-4 md:size-56'
          >
            <SponsorLogo
              src={sponsor.image}
              alt={sponsor.title}
              size={220}
              className='max-h-40 object-contain md:max-h-48'
            />
          </div>

          <CardContent className='flex-1 p-0 text-center md:text-left'>
            <Badge variant='gold' className='mb-3'>
              Top Sponsor
            </Badge>
            <Text variant='hd-lg'>{sponsor.title}</Text>
            <Text variant='muted' size='sm' className='mt-2'>
              Thank you for supporting us for{' '}
              <span className='text-foreground font-semibold'>
                {time.months} {time.months === 1 ? 'month' : 'months'}
                {time.days > 0 && (
                  <>
                    {', '}
                    {time.days} {time.days === 1 ? 'day' : 'days'}
                  </>
                )}
              </span>
            </Text>
            <Badge className='mt-3 bg-amber-500/90 text-white hover:bg-amber-500/90'>
              {sponsor.text}
            </Badge>

            <div className='mt-5 flex flex-col justify-center gap-3 sm:flex-row md:justify-start'>
              <Button asChild>
                <a href={sponsor.websitelink} target='_blank' rel='noopener noreferrer'>
                  Visit Website
                  <ExternalLink size={14} />
                </a>
              </Button>
              <Button asChild variant='secondary'>
                <a href={sponsor.maplink} target='_blank' rel='noopener noreferrer'>
                  <MapPin size={14} />
                  {sponsor.location}
                </a>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </section>
  );
}

function SponsorTierSection({
  caption,
  title,
  tooltip,
  sponsors,
  isAdmin,
  onRefresh,
  isMobile,
  emptyMessage,
}: {
  caption?: string;
  title: string;
  tooltip: string;
  sponsors: SponsorData[];
  isAdmin: boolean;
  onRefresh: () => void;
  isMobile: boolean;
  emptyMessage: string;
}) {
  return (
    <div className='mb-10 last:mb-0'>
      <div className='mb-4'>
        <Text
          variant='caption'
          size='xs'
          className='mb-1 font-semibold uppercase tracking-[0.2em]'
        >
          {caption}
        </Text>
        <div className='flex items-center gap-2'>
          <Text variant='hd-md'>{title}</Text>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type='button' className='text-muted-foreground inline-flex'>
                <Info size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? 'top' : 'right'} align='center'>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {sponsors.length === 0 ? (
        <div
          className='text-muted-foreground rounded-xl border border-dashed p-8 text-center'
        >
          {emptyMessage}
        </div>
      ) : (
        <div className='grid auto-rows-70 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {sponsors.map((sponsor, index) => (
            <SponsorCard
              key={sponsor.id ?? sponsor.title}
              sponsor={sponsor}
              index={index}
              isAdmin={isAdmin}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sponsors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLoading, setIsLoading] = useState(true);
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [error, setError] = useState(false);

  const fetchSponsors = useCallback(async () => {
    setIsLoading(true);
    setError(false);

    try {
      const { data, error: fetchError } = await supabase
        .from('sponsors')
        .select('*')
        .order('title', { ascending: true });

      if (fetchError) throw fetchError;

      setSponsors(data && data.length > 0 ? data : FallbackSponsors);
    } catch {
      toast.error('Failed to load sponsors. Using default data.');
      setSponsors(FallbackSponsors);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const topSponsor = sponsors.length ? [...sponsors].sort(sponsorTenureSort)[0] : null;

  const legacySponsors = sponsors
    .filter((s) => getTimeSince(s.created_at).months >= 8)
    .filter((s) => !isSameSponsor(s, topSponsor))
    .sort(sponsorTenureSort);

  const veteranSponsors = sponsors
    .filter(
      (s) =>
        getTimeSince(s.created_at).months >= 4 && getTimeSince(s.created_at).months < 8
    )
    .filter((s) => !isSameSponsor(s, topSponsor))
    .sort(sponsorTenureSort);

  const newSponsors = sponsors
    .filter((s) => getTimeSince(s.created_at).months < 4)
    .filter((s) => !isSameSponsor(s, topSponsor))
    .sort(sponsorTenureSort);

  return (
    <>
      <div className='fade-in-from-bottom mb-8 px-4 text-center'>
        <Text
          variant='caption'
          size='xs'
          className='mb-1 font-semibold uppercase tracking-[0.2em]'
        >
          People who support us
        </Text>
        <Text variant='hd-xl'>Sponsors & Member Perks</Text>
        <Text variant='muted' size='sm' className='mx-auto mt-2 max-w-lg'>
          Local businesses supporting KDT. Show your membership for exclusive discounts
        </Text>
      </div>

      {isLoading && (
        <div className='flex min-h-[240px] items-center justify-center'>
          <Spinner className='size-10' />
        </div>
      )}

      {!isLoading && error && (
        <div className='container mx-auto mb-4 px-4'>
          <Alert variant='destructive'>
            <AlertDescription>
              Failed to load sponsors from the database.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!isLoading && topSponsor && <FeaturedSponsor sponsor={topSponsor} />}

      {!isLoading && (
        <section className='container mx-auto mb-4 px-4'>
          <Card className='p-4'>
            <div className='fade-in-from-bottom mb-6 text-center'>
              <Text
                variant='caption'
                size='xs'
                className='mb-1 font-semibold uppercase tracking-[0.2em]'
              >
                Our Partners
              </Text>
              <Text variant='hd-xl'>All Sponsors</Text>
            </div>

            {user && (
              <div className='mb-6 flex justify-center'>
                <SponsorActions.AddEditSponsorDialog
                  mode='add'
                  onSponsorSaved={fetchSponsors}
                />
              </div>
            )}

            <SponsorTierSection
              title='Way Paver Sponsors'
              tooltip='Our most dedicated sponsors who have been with us for 8 or more months.'
              sponsors={legacySponsors}
              isAdmin={!!user}
              onRefresh={fetchSponsors}
              isMobile={isMobile}
              emptyMessage='No Way Paver sponsors yet.'
            />

            <SponsorTierSection
              title='Rising Stars Sponsors'
              tooltip='Sponsors who have been with us for 4–7 months.'
              sponsors={veteranSponsors}
              isAdmin={!!user}
              onRefresh={fetchSponsors}
              isMobile={isMobile}
              emptyMessage='No Rising Stars sponsors yet.'
            />

            <SponsorTierSection
              title='Debut Sponsors'
              tooltip='Sponsors who joined us within the last 4 months.'
              sponsors={newSponsors}
              isAdmin={!!user}
              onRefresh={fetchSponsors}
              isMobile={isMobile}
              emptyMessage='No debut sponsors yet.'
            />
          </Card>
        </section>
      )}
    </>
  );
}
