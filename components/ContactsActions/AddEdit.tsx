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
  Textarea,
} from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be at most 100 characters'),
  role: z
    .string()
    .min(1, 'Role is required')
    .max(50, 'Role must be at most 50 characters'),
  bio: z
    .string()
    .min(1, 'Bio is required')
    .max(200, 'Bio must be at most 200 characters'),
  profile_image_url: z.string().url('Please enter a valid image URL').or(z.literal('')),
  instagram_url: z.string().url('Please enter a valid URL').or(z.literal('')),
  linkedin_url: z.string().url('Please enter a valid URL').or(z.literal('')),
  github_url: z.string().url('Please enter a valid URL').or(z.literal('')),
});

type AddEditMemberDialogProps = {
  onMemberSaved: () => void;
  member?: {
    id?: string;
    full_name: string;
    role: string;
    bio: string;
    profile_image_url: string;
    instagram_url: string;
    linkedin_url: string;
    github_url: string;
  };
  mode: 'add' | 'edit';
  trigger?: React.ReactNode;
};

export function AddEditMemberDialog({
  onMemberSaved,
  member,
  mode,
  trigger,
}: AddEditMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: member
      ? {
          full_name: member.full_name || '',
          role: member.role || '',
          bio: member.bio || '',
          profile_image_url: member.profile_image_url || '',
          instagram_url: member.instagram_url || '',
          linkedin_url: member.linkedin_url || '',
          github_url: member.github_url || '',
        }
      : {
          full_name: '',
          role: '',
          bio: '',
          profile_image_url: '',
          instagram_url: '',
          linkedin_url: '',
          github_url: '',
        },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        full_name: member.full_name || '',
        role: member.role || '',
        bio: member.bio || '',
        profile_image_url: member.profile_image_url || '',
        instagram_url: member.instagram_url || '',
        linkedin_url: member.linkedin_url || '',
        github_url: member.github_url || '',
      });
    }
  }, [member, form]);

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

        const { error } = await supabase.from('team_members').insert([
          {
            full_name: values.full_name,
            role: values.role,
            bio: values.bio,
            profile_image_url: values.profile_image_url,
            instagram_url: values.instagram_url,
            linkedin_url: values.linkedin_url,
            github_url: values.github_url,
            order_index: 0,
          },
        ]);

        if (error) throw error;
        toast.success('Team member added successfully!');
      } else if (mode === 'edit' && member?.id) {
        const { error } = await supabase
          .from('team_members')
          .update({
            full_name: values.full_name,
            role: values.role,
            bio: values.bio,
            profile_image_url: values.profile_image_url,
            instagram_url: values.instagram_url,
            linkedin_url: values.linkedin_url,
            github_url: values.github_url,
          })
          .eq('id', member.id);

        if (error) throw error;
        toast.success('Team member updated successfully!');
      }
      form.reset();
      setIsOpen(false);
      onMemberSaved();
    } catch (error) {
      toast.error(
        mode === 'add'
          ? 'Failed to add team member. Please try again.'
          : 'Failed to update team member. Please try again.'
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
            <ListPlus size={20} /> Add Team Member
          </Button>
        ) : (
          <Button className='flex cursor-pointer items-center gap-2' variant='outline'>
            <Pencil size={18} /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Team Member' : 'Edit Team Member'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[50vh] sm:max-h-[70vh] pr-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              <div className='grid gap-4 py-2'>
                <FormField
                  control={form.control}
                  name='full_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder='John Doe' {...field} />
                      </FormControl>
                      <FormDescription>
                        {`Max ${formSchema.shape.full_name.maxLength} characters.`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. President, VP Marketing, Jr Events'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {`Max ${formSchema.shape.role.maxLength} characters.`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us about this team member...'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {`Max ${formSchema.shape.bio.maxLength} characters.`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='profile_image_url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com/image.jpg' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='instagram_url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://instagram.com/username' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='linkedin_url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://linkedin.com/in/username'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='github_url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://github.com/username' {...field} />
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
              'Add Member'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
