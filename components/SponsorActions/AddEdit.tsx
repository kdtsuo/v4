'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListPlus, Pencil, Loader2 } from 'lucide-react';
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
} from '@/components/ui';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().url('Please enter a valid image URL'),
  location: z.string().min(1, 'Location is required'),
  maplink: z.string().url('Please enter a valid map link URL'),
  text: z.string().min(1, 'Discount text is required'),
  websitelink: z.string().url('Please enter a valid website URL'),
});

type AddEditSponsorDialogProps = {
  onSponsorSaved: () => void;
  sponsor?: {
    id?: string;
    title: string;
    image: string;
    location: string;
    maplink: string;
    text: string;
    websitelink: string;
  };
  mode: 'add' | 'edit';
  trigger?: React.ReactNode;
};

export function AddEditSponsorDialog({
  onSponsorSaved,
  sponsor,
  mode,
  trigger,
}: AddEditSponsorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: sponsor
      ? {
          title: sponsor.title || '',
          image: sponsor.image || '',
          location: sponsor.location || '',
          maplink: sponsor.maplink || '',
          text: sponsor.text || '',
          websitelink: sponsor.websitelink || '',
        }
      : {
          title: '',
          image: '',
          location: '',
          maplink: '',
          text: '',
          websitelink: '',
        },
  });

  useEffect(() => {
    if (sponsor) {
      form.reset({
        title: sponsor.title || '',
        image: sponsor.image || '',
        location: sponsor.location || '',
        maplink: sponsor.maplink || '',
        text: sponsor.text || '',
        websitelink: sponsor.websitelink || '',
      });
    }
  }, [sponsor, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('No authenticated user found');
        }

        const { error } = await supabase.from('sponsors').insert([
          {
            title: values.title,
            image: values.image,
            location: values.location,
            maplink: values.maplink,
            text: values.text,
            websitelink: values.websitelink,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
        toast.success('Sponsor added successfully!');
      } else if (mode === 'edit' && sponsor?.id) {
        const { error } = await supabase
          .from('sponsors')
          .update({
            title: values.title,
            image: values.image,
            location: values.location,
            maplink: values.maplink,
            text: values.text,
            websitelink: values.websitelink,
          })
          .eq('id', sponsor.id);

        if (error) throw error;
        toast.success('Sponsor updated successfully!');
      }
      form.reset();
      setIsOpen(false);
      onSponsorSaved();
    } catch (error) {
      toast.error(
        mode === 'add'
          ? 'Failed to add sponsor. Please try again.'
          : 'Failed to update sponsor. Please try again.'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : mode === 'add' ? (
          <Button className='flex cursor-pointer items-center gap-2' variant='default'>
            <ListPlus size={20} /> Add Sponsor
          </Button>
        ) : (
          <Button className='flex cursor-pointer items-center gap-2' variant='outline'>
            <Pencil size={18} /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Sponsor' : 'Edit Sponsor'}</DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[60vh] pr-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              <div className='grid gap-4 py-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder='Sponsor name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com/image.png' {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the sponsor&apos;s logo image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder='123 Main St' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='maplink'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Link</FormLabel>
                      <FormControl>
                        <Input placeholder='https://maps.google.com/...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='text'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Text</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. 10% off for KDT members!' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='websitelink'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor&apos;s Website Link</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button
            type='submit'
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {mode === 'add' ? 'Adding...' : 'Saving...'}
              </>
            ) : mode === 'add' ? (
              'Add Sponsor'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
