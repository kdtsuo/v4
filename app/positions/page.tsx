'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Position } from '@/types';
import { Clipboard, Edit, Plus, Trash2, X } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import * as PositionsActions from '@/components/PositionsActions';
const fallbackPositions: Position[] = [
  {
    label: 'Senior Executive Team',
    form_url: 'https://forms.gle/ufezb8Gut92E7pMeA',
    is_accepting_responses: true,
  },
  {
    label: 'Junior Executive Team',
    form_url: 'https://forms.gle/ufezb8Gut92E7pMeA',
    is_accepting_responses: true,
  },
  {
    label: 'Dance Instructor',
    form_url: 'https://forms.gle/eciAuTKB63WLQzGg7',
    is_accepting_responses: true,
  },
  {
    label: 'Performance Group',
    form_url: 'https://forms.gle/4CFzbsd3Xn1Lstns8',
    is_accepting_responses: true,
  },
  {
    label: 'Cameraman',
    form_url: 'https://forms.gle/LpXTwzCNKjVZN3De9',
    is_accepting_responses: true,
  },
];

export default function Positions() {
  const [value, setValue] = useState<string>('');
  const [formClosed, setFormClosed] = useState<boolean>(false);
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

  useEffect(() => {
    if (value) {
      const selectedPosition = positionsData.find(
        (p) => p.label.toLowerCase().replace(/\s+/g, '') === value
      );
      setFormClosed(selectedPosition ? !selectedPosition.is_accepting_responses : false);
    } else {
      setFormClosed(false);
    }
  }, [value, positionsData]);

  return (
    <div className='animate-fade-in overflow-x-hidden'>
      <div className='relative h-screen w-screen'>
        <Image
          className='object-cover brightness-[0.25]'
          src='/assets/img/stock/joinourteam.jpeg'
          alt='team'
          fill
          priority
          quality={90}
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
          <div
            className='fade-in-from-bottom flex justify-center gap-2 flex-wrap delay-200'
          >
            {/* Manage Positions Section */}
            {user && (
              <>
                {/* Add Position Button */}
                <PositionsActions.AddEdit
                  onPositionSaved={fetchPositionFromDatabase}
                  trigger={
                    <Button variant='default'>
                      <Plus className='h-4 w-4' /> Add
                    </Button>
                  }
                />

                {/* Edit Position Button */}
                <PositionsActions.AddEdit
                  positions={positionsData}
                  onPositionSaved={fetchPositionFromDatabase}
                  trigger={
                    <Button variant='secondary'>
                      <Edit className='h-4 w-4' /> Edit
                    </Button>
                  }
                />

                {/* Delete Position Button */}
                <PositionsActions.Delete
                  positions={positionsData}
                  onPositionDeleted={fetchPositionFromDatabase}
                  trigger={
                    <Button variant='destructive'>
                      <Trash2 className='h-4 w-4' /> Delete
                    </Button>
                  }
                />
              </>
            )}

            {/* Check Positions Section */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    fetchPositionFromDatabase();
                  }}
                  className=''
                  variant='secondary'
                >
                  Check Positions
                </Button>
              </DialogTrigger>
              <DialogContent className='w-[350px] lg:w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Positions</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Select a position that you&apos;re interested in.
                </DialogDescription>
                <div className='flex items-center justify-center'>
                  <Select
                    value={value}
                    onValueChange={(newValue) => {
                      setValue(newValue);
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select position...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {positionsData.map((position) => {
                          const positionValue = position.label
                            .toLowerCase()
                            .replace(/\s+/g, '');

                          return (
                            <SelectItem
                              key={positionValue}
                              value={positionValue}
                              disabled={!position.is_accepting_responses}
                              className={
                                !position.is_accepting_responses
                                  ? 'text-red-500 opacity-75'
                                  : ''
                              }
                            >
                              <div className='flex w-full items-center justify-between'>
                                {position.label}
                                {!position.is_accepting_responses && (
                                  <X className='ml-2 h-4 w-4 text-red-500' />
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* Show message when selected form is closed */}
                {value && formClosed && (
                  <div className='flex items-center text-red-500'>
                    <span className='text-xs'>
                      We are not accepting applications for this position currently
                    </span>
                  </div>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    {value && (
                      <Button
                        variant='secondary'
                        className='cursor-pointer border'
                        onClick={() => {
                          navigator.clipboard.writeText(
                            positionsData.find(
                              (p) => p.label.toLowerCase().replace(/\s+/g, '') === value
                            )?.form_url || ''
                          );
                          toast.success('Copied link to clipboard!');
                        }}
                      >
                        Copy Link <Clipboard />
                      </Button>
                    )}
                  </DialogClose>
                  <DialogClose asChild>
                    {value && (
                      <Button
                        asChild
                        variant='default'
                        className='cursor-pointer'
                        disabled={!value}
                      >
                        <a
                          href={
                            positionsData.find(
                              (p) => p.label.toLowerCase().replace(/\s+/g, '') === value
                            )?.form_url || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Goto Form
                        </a>
                      </Button>
                    )}
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
