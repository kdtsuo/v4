'use client';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { ActionType, Position } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard, Edit, Loader2, Plus, Trash, X } from 'lucide-react';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';

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

const positionSchema = z.object({
  label: z.string().min(1, 'Position name is required'),
  form_url: z.url('Must be a valid URL'),
  is_accepting_responses: z.boolean(),
});

export default function Positions() {
  const [value, setValue] = useState<string>('');
  const [formClosed, setFormClosed] = useState<boolean>(false);
  const [positionsData, setPositionsData] = useState<Position[]>(fallbackPositions);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [selectedAdminPosition, setSelectedAdminPosition] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      label: '',
      form_url: '',
      is_accepting_responses: true,
    },
  });

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

  const handleSubmit = async (data: z.infer<typeof positionSchema>) => {
    setIsSubmitting(true);
    try {
      if (selectedAction === 'add') {
        const { error } = await supabase.from('positions').insert([
          {
            ...data,
            user_id: user?.id,
          },
        ]);

        if (error) throw error;
        toast.success('Position added successfully!');
      } else if (selectedAction === 'update') {
        const position = positionsData.find(
          (p) => p.label.toLowerCase().replace(/\s+/g, '') === selectedAdminPosition
        );

        if (!position) throw new Error('Position not found');

        const { error } = await supabase
          .from('positions')
          .update(data)
          .eq('label', position.label);

        if (error) throw error;
        toast.success('Position updated successfully!');
      }
      await fetchPositionFromDatabase();
      setSelectedAction(null);
      setSelectedAdminPosition('');
    } catch (error) {
      toast.error('Failed to manage position');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePosition = async () => {
    setIsSubmitting(true);
    try {
      const position = positionsData.find(
        (p) => p.label.toLowerCase().replace(/\s+/g, '') === selectedAdminPosition
      );

      if (!position) throw new Error('Position not found');

      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('label', position.label);

      if (error) throw error;

      toast.success('Position deleted successfully!');
      await fetchPositionFromDatabase();

      setSelectedAction(null);
      setSelectedAdminPosition('');
    } catch (error) {
      toast.error('Failed to delete position');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

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

  useEffect(() => {
    if (selectedAction === 'update' && selectedAdminPosition) {
      const position = positionsData.find(
        (p) => p.label.toLowerCase().replace(/\s+/g, '') === selectedAdminPosition
      );
      if (position) {
        form.reset({
          label: position.label,
          form_url: position.form_url,
          is_accepting_responses: position.is_accepting_responses,
        });
      }
    } else if (selectedAction === 'add') {
      form.reset({
        label: '',
        form_url: '',
        is_accepting_responses: true,
      });
    }
  }, [selectedAction, selectedAdminPosition, positionsData, form]);

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
          <div className='fade-in-from-bottom flex justify-center gap-4 delay-200'>
            {/* Manage Positions Section */}
            {user && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='secondary'>
                    <Edit />
                    Manage Positions
                  </Button>
                </DialogTrigger>
                <DialogContent className='w-[350px] lg:w-[500px]'>
                  <DialogHeader>
                    <DialogTitle>Manage Positions</DialogTitle>
                    <DialogDescription>
                      Add, update or delete position information
                    </DialogDescription>
                  </DialogHeader>

                  {/* Action Type Selection */}
                  <div className='flex flex-col gap-4'>
                    <div className='flex flex-col space-y-2'>
                      <Label>Select Action</Label>
                      <Select
                        value={selectedAction || ''}
                        onValueChange={(value) => {
                          setSelectedAction(value as ActionType);
                          if (value === 'add') {
                            setSelectedAdminPosition('');
                          }
                        }}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select action...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='add'>
                              <div className='flex items-center'>
                                <Plus className='mr-2 h-4 w-4' /> Add Position
                              </div>
                            </SelectItem>
                            <SelectItem value='update'>
                              <div className='flex items-center'>
                                <Edit className='mr-2 h-4 w-4' /> Update Position
                              </div>
                            </SelectItem>
                            <SelectItem value='delete'>
                              <div className='flex items-center'>
                                <Trash className='mr-2 h-4 w-4' /> Delete Position
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Position Selection (only for update and delete) */}
                    {(selectedAction === 'update' || selectedAction === 'delete') && (
                      <div className='flex flex-col space-y-2'>
                        <Label>Select Position:</Label>
                        <Select
                          value={selectedAdminPosition}
                          onValueChange={(value) => {
                            setSelectedAdminPosition(value);
                          }}
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
                                  <SelectItem key={positionValue} value={positionValue}>
                                    <div
                                      className='flex w-full items-center justify-between'
                                    >
                                      {position.label.length > 38
                                        ? position.label.substring(0, 35) + '...'
                                        : position.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Form for Add or Update */}
                    {(selectedAction === 'add' ||
                      (selectedAction === 'update' && selectedAdminPosition)) && (
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleSubmit)}
                          className='space-y-4'
                        >
                          <FormField
                            control={form.control}
                            name='label'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position Name</FormLabel>
                                <FormControl>
                                  <Input placeholder='Enter position name' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='form_url'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Form URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='https://docs.google.com/forms/d/e/...'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='is_accepting_responses'
                            render={({ field }) => (
                              <FormItem
                                className='flex flex-row items-center justify-between
                                  rounded-lg border p-3 shadow-sm'
                              >
                                <div className='space-y-0.5'>
                                  <FormLabel>Accepting Responses</FormLabel>
                                  <FormDescription>
                                    Toggle if this position is currently accepting
                                    applications
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className='flex justify-end gap-2'>
                            <DialogClose asChild>
                              <Button type='button' variant='outline'>
                                Close
                              </Button>
                            </DialogClose>
                            <Button
                              type='submit'
                              variant='default'
                              disabled={isSubmitting}
                            >
                              {isSubmitting && (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              )}
                              {selectedAction === 'add'
                                ? 'Add Position'
                                : isSubmitting
                                  ? 'Updating...'
                                  : 'Update Position'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    )}
                  </div>
                  <DialogFooter>
                    {/* Delete Confirmation */}
                    {selectedAction === 'delete' && selectedAdminPosition && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='destructive'>Delete Position</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Permanently delete the position &quot;
                              {(() => {
                                const label =
                                  positionsData.find(
                                    (p) =>
                                      p.label.toLowerCase().replace(/\s+/g, '') ===
                                      selectedAdminPosition
                                  )?.label || '';

                                return label.length > 38
                                  ? label.substring(0, 35) + '...'
                                  : label;
                              })()}
                              &quot; from the database? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeletePosition}
                              disabled={isSubmitting}
                              className='bg-destructive dark:text-destructive-foreground
                                not-dark:text-background'
                            >
                              {isSubmitting && <Loader2 className='animate-spin' />}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
