'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks';
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
  ScrollArea,
  Switch,
  Textarea,
} from '@/components/ui';

const positionSchema = z.object({
  label: z.string().min(1, 'Position name is required'),
  form_url: z.url('Must be a valid URL'),
  is_accepting_responses: z.boolean(),
  description: z.string().optional(),
});

type AddEditProps = {
  onPositionSaved: () => void;
  position?: Position;
  trigger?: React.ReactNode;
};

export function AddEdit({ onPositionSaved, position, trigger }: AddEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Determine mode based on whether a position is provided
  const mode = position ? 'edit' : 'add';

  const form = useForm<z.infer<typeof positionSchema>>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      label: '',
      form_url: '',
      is_accepting_responses: true,
      description: '',
    },
  });

  useEffect(() => {
    if (position) {
      form.reset({
        label: position.label || '',
        form_url: position.form_url || '',
        is_accepting_responses: position.is_accepting_responses ?? true,
        description: position.description || '',
      });
    } else {
      form.reset({
        label: '',
        form_url: '',
        is_accepting_responses: true,
        description: '',
      });
    }
  }, [position, form]);

  const handleSubmit = async (values: z.infer<typeof positionSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/positions', {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:
          mode === 'add'
            ? JSON.stringify(values)
            : JSON.stringify({ id: position?.id, ...values }),
      });

      if (!res.ok) {
        const message = (mode === 'add' ? 'Failed to add position.' : 'Failed to update position.');
        toast.error(message + ' Please try again.');
        return;
      }

      toast.success(mode === 'add' ? 'Position added successfully!' : 'Position updated successfully!');
      form.reset();
      setIsOpen(false);
      onPositionSaved();
    } catch {
      toast.error(
        mode === 'add'
          ? 'Failed to add position. Please try again.'
          : 'Failed to update position. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
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
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter position description...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the position and its responsibilities.
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
        </ScrollArea>
        <DialogFooter>
          <Button
            type='submit'
            disabled={isSubmitting}
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
