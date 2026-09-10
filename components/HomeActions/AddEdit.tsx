'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, DollarSign, Dot } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks';
import Image from 'next/image';
import { supabase } from '@/lib';
import {
  buildScheduledAtUtc,
  formatVancouverDate,
  getCurrentVancouverScheduleValues,
  iconMap,
  isBeforeVancouverToday,
  parseScheduledAt,
} from '@/utils';
import type { Link } from '@/types';
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';

const scheduledHourSchema = z
  .string()
  .min(1, 'Hour is required')
  .regex(/^\d+$/, 'Enter numbers only')
  .refine((value) => {
    const hour = Number(value);
    return hour >= 1 && hour <= 12;
  }, 'Hour must be between 1 and 12');

const scheduledMinuteSchema = z
  .string()
  .min(1, 'Minutes are required')
  .regex(/^\d+$/, 'Enter numbers only')
  .refine((value) => {
    const minute = Number(value);
    return minute >= 0 && minute <= 60;
  }, 'Minutes must be between 00 and 60');

const scheduledPeriodSchema = z.enum(['AM', 'PM'], {
  message: 'Select AM or PM',
});

const formSchema = z
  .object({
    label: z.string().min(1, 'Label is required'),
    link: z.string().url('Please enter a valid URL'),
    iconType: z.string().min(1, 'Icon type is required'),
    price: z
      .number()
      .min(0, 'Enter a number or leave blank')
      .optional()
      .or(z.literal(undefined)),
    is_scheduled: z.boolean(),
    scheduled_date: z.date().optional(),
    scheduled_hour: z.string().optional(),
    scheduled_minute: z.string().optional(),
    scheduled_period: z.enum(['AM', 'PM']).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_scheduled) return;

    if (!data.scheduled_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Date is required',
        path: ['scheduled_date'],
      });
    }

    const hourResult = scheduledHourSchema.safeParse(data.scheduled_hour);
    if (!hourResult.success) {
      hourResult.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: ['scheduled_hour'] });
      });
    }

    const minuteResult = scheduledMinuteSchema.safeParse(data.scheduled_minute);
    if (!minuteResult.success) {
      minuteResult.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: ['scheduled_minute'] });
      });
    }

    const periodResult = scheduledPeriodSchema.safeParse(data.scheduled_period);
    if (!periodResult.success) {
      periodResult.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: ['scheduled_period'] });
      });
    }
  });

function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function clampNumericString(value: string, min: number, max: number) {
  if (!value) return '';
  const num = Math.min(max, Math.max(min, Number(value)));
  return String(num);
}

function getDefaultScheduleValues() {
  return {
    is_scheduled: false,
    scheduled_date: undefined,
    scheduled_hour: '12',
    scheduled_minute: '00',
    scheduled_period: 'AM' as const,
  };
}

function getScheduleValuesFromLink(link?: Link) {
  const parsed = parseScheduledAt(link?.scheduled_at);
  if (!parsed) return getDefaultScheduleValues();

  return {
    is_scheduled: true,
    scheduled_date: parsed.date,
    scheduled_hour: parsed.hour,
    scheduled_minute: parsed.minute,
    scheduled_period: parsed.period,
  };
}

type AddEditProps = {
  onLinkSaved: () => void;
  links?: Link[];
  trigger?: React.ReactNode;
};

export function AddEdit({ onLinkSaved, links = [], trigger }: AddEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const { toast } = useToast();

  // Determine mode based on whether links are provided
  const mode = links.length > 0 ? 'edit' : 'add';

  const selectedLink = selectedLinkId
    ? links.find((l) => l.id === selectedLinkId)
    : undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      link: '',
      iconType: 'link',
      price: undefined,
      ...getDefaultScheduleValues(),
    },
  });

  const isScheduled = form.watch('is_scheduled');
  const scheduleFieldErrors = [
    { field: 'scheduled_date', message: form.formState.errors.scheduled_date?.message },
    { field: 'scheduled_hour', message: form.formState.errors.scheduled_hour?.message },
    {
      field: 'scheduled_minute',
      message: form.formState.errors.scheduled_minute?.message,
    },
    {
      field: 'scheduled_period',
      message: form.formState.errors.scheduled_period?.message,
    },
  ].filter((entry): entry is { field: string; message: string } =>
    Boolean(entry.message)
  );

  useEffect(() => {
    if (selectedLink) {
      form.reset({
        label: selectedLink.label || '',
        link: selectedLink.link || '',
        iconType: selectedLink.iconType || 'link',
        price: selectedLink.price ?? undefined,
        ...getScheduleValuesFromLink(selectedLink),
      });
    } else {
      form.reset({
        label: '',
        link: '',
        iconType: 'link',
        price: undefined,
        ...getDefaultScheduleValues(),
      });
    }
  }, [selectedLink, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to manage links');
        return;
      }

      const scheduled_at =
        values.is_scheduled && values.scheduled_date
          ? buildScheduledAtUtc(
              values.scheduled_date,
              Number(values.scheduled_hour),
              Number(values.scheduled_minute),
              values.scheduled_period!
            )
          : null;

      const linkPayload = {
        label: values.label,
        link: values.link,
        iconType: values.iconType,
        price: values.price,
        scheduled_at,
      };

      if (mode === 'add') {
        const currentDate = new Date().toISOString().split('T')[0];
        const newLink = {
          ...linkPayload,
          date: currentDate,
          user_id: user.id,
        };
        const { error } = await supabase.from('links').insert([newLink]);
        if (error) throw error;
        toast.success('Link added successfully!');
      } else if (mode === 'edit' && selectedLink?.id) {
        const { error } = await supabase
          .from('links')
          .update(linkPayload)
          .eq('id', selectedLink.id);
        if (error) throw error;
        toast.success('Link updated successfully!');
      }
      form.reset();
      setIsOpen(false);
      setSelectedLinkId(null);
      onLinkSaved();
    } catch (error) {
      toast.error(
        mode === 'add'
          ? 'Failed to add link. Please try again.'
          : 'Failed to update link. Please try again.'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedLinkId(null);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Link' : 'Edit Link'}</DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[60vh] pr-4'>
          {mode === 'edit' && (
            <div className='mb-4 flex flex-col space-y-2'>
              <Label>Select Link to Edit:</Label>
              <Select
                value={selectedLinkId?.toString() || ''}
                onValueChange={(value) => setSelectedLinkId(Number(value))}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select link...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {links
                      .filter((link) => link.id !== undefined)
                      .map((link) => (
                        <SelectItem key={link.id} value={link.id!.toString()}>
                          {link.label}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          {(mode === 'add' || selectedLinkId) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='label'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Label</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter link title' {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed for the link.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='link'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com' {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the full URL including https://
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='iconType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className='flex flex-row flex-wrap justify-start
                            md:justify-around'
                        >
                          {Object.keys(iconMap).map((iconKey) => {
                            const Icon = iconMap[iconKey].iconComponent;
                            const imagePath = iconMap[iconKey].imagePath;
                            return (
                              <FormItem
                                key={iconKey}
                                className='flex flex-col items-center space-y-2'
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={iconKey}
                                    id={`manage-${iconKey}`}
                                    className='sr-only'
                                  />
                                </FormControl>
                                <label
                                  htmlFor={`manage-${iconKey}`}
                                  className={`hover:bg-accent flex cursor-pointer flex-col
                                  items-center justify-center rounded-md border-2 p-4 ${
                                    field.value === iconKey
                                      ? 'border-primary bg-accent'
                                      : 'border-muted'
                                  }`}
                                >
                                  {Icon && <Icon strokeWidth={2} size={30} />}
                                  {imagePath && (
                                    <Image
                                      src={imagePath}
                                      alt={iconKey}
                                      width={32}
                                      height={32}
                                      className='h-8 w-8 object-contain'
                                    />
                                  )}
                                </label>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className='flex items-center justify-between'>
                          <DollarSign className='mr-2' size={25} />
                          <Input
                            className='no-spinner items-center'
                            type='number'
                            placeholder='Enter a number or leave blank'
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === '' ? undefined : Number(val));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave blank to hide price. Enter 0 for Free, or any positive
                        value.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='space-y-4 rounded-lg border p-3 shadow-sm'>
                  <FormField
                    control={form.control}
                    name='is_scheduled'
                    render={({ field }) => (
                      <FormItem
                        className='flex flex-row items-center justify-between space-y-0'
                      >
                        <div className='space-y-0.5'>
                          <FormLabel>Schedule this link</FormLabel>
                          <FormDescription>
                            Choose when this link becomes visible. All times are
                            Vancouver (PT).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                const now = getCurrentVancouverScheduleValues();
                                form.setValue('scheduled_date', now.date);
                                form.setValue('scheduled_hour', now.hour);
                                form.setValue('scheduled_minute', now.minute);
                                form.setValue('scheduled_period', now.period);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {isScheduled && (
                    <div className='space-y-4'>
                      <FormField
                        control={form.control}
                        name='scheduled_date'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant='outline'
                                    className='w-full pl-3 text-left font-normal'
                                  >
                                    {field.value ? (
                                      formatVancouverDate(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent align='start'>
                                <Calendar
                                  mode='single'
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => isBeforeVancouverToday(date)}
                                />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )}
                      />
                      <div className='grid grid-cols-3 gap-4'>
                        <FormField
                          control={form.control}
                          name='scheduled_hour'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hour</FormLabel>
                              <FormControl>
                                <Input
                                  className='text-center'
                                  type='text'
                                  inputMode='numeric'
                                  placeholder='12'
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    field.onChange(digitsOnly(e.target.value, 2));
                                  }}
                                  onBlur={(e) => {
                                    field.onBlur();
                                    const clamped = clampNumericString(
                                      e.target.value,
                                      1,
                                      12
                                    );
                                    if (clamped !== e.target.value) {
                                      field.onChange(clamped);
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='scheduled_minute'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minute</FormLabel>
                              <FormControl>
                                <Input
                                  className='text-center'
                                  type='text'
                                  inputMode='numeric'
                                  placeholder='00'
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    field.onChange(digitsOnly(e.target.value, 2));
                                  }}
                                  onBlur={(e) => {
                                    field.onBlur();
                                    const clamped = clampNumericString(
                                      e.target.value,
                                      0,
                                      60
                                    );
                                    if (clamped !== e.target.value) {
                                      field.onChange(
                                        clamped === ''
                                          ? clamped
                                          : clamped.padStart(2, '0')
                                      );
                                    } else if (clamped) {
                                      field.onChange(clamped.padStart(2, '0'));
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='scheduled_period'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>AM/PM</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='AM/PM' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='AM'>AM</SelectItem>
                                  <SelectItem value='PM'>PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  {isScheduled && scheduleFieldErrors.length > 0 && (
                    <div className='space-y-1'>
                      {scheduleFieldErrors.map(({ field, message }) => (
                        <p
                          key={field}
                          className='text-destructive-foreground text-sm'
                        >
                          {message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </Form>
          )}
        </ScrollArea>
        <DialogFooter hidden={mode === 'edit' && !selectedLinkId}>
          <Button
            type='submit'
            disabled={isSubmitting || (mode === 'edit' && !selectedLinkId)}
            onClick={form.handleSubmit(handleSubmit)}
            className='w-full'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {mode === 'add' ? 'Adding...' : 'Saving...'}
              </>
            ) : mode === 'add' ? (
              'Add Link'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
