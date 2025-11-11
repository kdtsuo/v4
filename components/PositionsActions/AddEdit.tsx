'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Position } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import {
  Button,
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
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';

const positionSchema = z.object({
  label: z.string().min(1, 'Position name is required'),
  form_url: z.url('Must be a valid URL'),
  is_accepting_responses: z.boolean(),
});

type AddEditProps = {
  onPositionSaved: () => void;
  positions?: Position[];
  trigger?: React.ReactNode;
};

export function AddEdit({ onPositionSaved, positions = [], trigger }: AddEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPositionLabel, setSelectedPositionLabel] = useState<string>('');
  const { toast } = useToast();

  // Determine mode based on whether positions are provided
  const mode = positions.length > 0 ? 'edit' : 'add';

  const selectedPosition = selectedPositionLabel
    ? positions.find(
        (p) => p.label.toLowerCase().replace(/\s+/g, '') === selectedPositionLabel
      )
    : undefined;

  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      label: '',
      form_url: '',
      is_accepting_responses: true,
    },
  });

  useEffect(() => {
    if (selectedPosition) {
      form.reset({
        label: selectedPosition.label || '',
        form_url: selectedPosition.form_url || '',
        is_accepting_responses: selectedPosition.is_accepting_responses ?? true,
      });
    } else {
      form.reset({
        label: '',
        form_url: '',
        is_accepting_responses: true,
      });
    }
  }, [selectedPosition, form]);

  const handleSubmit = async (values: z.infer<typeof positionSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to manage positions');
        return;
      }

      if (mode === 'add') {
        const { error } = await supabase.from('positions').insert([
          {
            ...values,
          },
        ]);
        if (error) throw error;
        toast.success('Position added successfully!');
      } else if (mode === 'edit' && selectedPosition?.label) {
        const { error } = await supabase
          .from('positions')
          .update(values)
          .eq('label', selectedPosition.label);
        if (error) throw error;
        toast.success('Position updated successfully!');
      }
      form.reset();
      setIsOpen(false);
      setSelectedPositionLabel('');
      onPositionSaved();
    } catch (error) {
      toast.error(
        mode === 'add'
          ? 'Failed to add position. Please try again.'
          : 'Failed to update position. Please try again.'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedPositionLabel('');
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Position' : 'Edit Position'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[60vh] pr-4'>
          {mode === 'edit' && (
            <div className='mb-4 flex flex-col space-y-2'>
              <Label>Select Position to Edit:</Label>
              <Select
                value={selectedPositionLabel}
                onValueChange={(value) => setSelectedPositionLabel(value)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select position...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {positions.map((position) => {
                      const positionValue = position.label
                        .toLowerCase()
                        .replace(/\s+/g, '');
                      return (
                        <SelectItem key={positionValue} value={positionValue}>
                          {position.label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          {(mode === 'add' || selectedPositionLabel) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-2'>
                <FormField
                  control={form.control}
                  name='label'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter position name' {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed for the position.
                      </FormDescription>
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
                      <FormDescription>
                        Enter the full URL of the application form.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='is_accepting_responses'
                  render={({ field }) => (
                    <FormItem
                      className='flex flex-row items-center justify-between rounded-lg
                        border p-3 shadow-sm'
                    >
                      <div className='space-y-0.5'>
                        <FormLabel>Accepting Responses</FormLabel>
                        <FormDescription>
                          Toggle if this position is currently accepting applications
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </ScrollArea>
        <DialogFooter hidden={mode === 'edit' && !selectedPositionLabel}>
          <Button
            type='submit'
            disabled={isSubmitting || (mode === 'edit' && !selectedPositionLabel)}
            onClick={form.handleSubmit(handleSubmit)}
            className='w-full'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {mode === 'add' ? 'Adding...' : 'Saving...'}
              </>
            ) : mode === 'add' ? (
              'Add Position'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
