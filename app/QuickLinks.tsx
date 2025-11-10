import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { ActionType, Link } from '@/types';
import { iconMap } from '@/utils';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Edit, GripVertical, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { IconLinkWide } from '@/components/subcomponents';
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
  DialogContent,
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
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { getDelayClass } from '@/utils/animations';

const formSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  link: z.string().url('Please enter a valid URL'),
  iconType: z.string().min(1, 'Icon type is required'),
  price: z
    .number({ invalid_type_error: 'Enter a number or leave blank' })
    .min(0, 'Enter a number or leave blank')
    .optional()
    .or(z.literal(undefined)),
});

const fallbackLinks: Link[] = [
  {
    iconType: 'rubric',
    label: 'Merch',
    link: 'https://campus.hellorubric.com/?s=7805',
    date: '2024-10-31',
    price: undefined,
  },
  {
    iconType: 'rubric',
    label: 'Membership & Ticket Sales',
    link: 'https://campus.hellorubric.com/?s=7805',
    date: '2024-10-31',
    price: undefined,
  },
  {
    iconType: 'googleForms',
    label: 'Google Forms',
    link: 'https://forms.gle/yVZcBeKBWPCm235aA',
    date: '2024-10-31',
    price: undefined,
  },
  {
    iconType: 'discord',
    label: 'Discord Server',
    link: 'https://discord.com/invite/tbKkvjV2W8',
    date: '2024-10-31',
    price: undefined,
  },
];

function SortableItem({ link }: { link: Link }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: link.id!,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-secondary border-ring flex items-center gap-2 rounded-md border-2 p-3'
    >
      <div
        {...attributes}
        {...listeners}
        className='flex-shrink-0 cursor-grab active:cursor-grabbing'
      >
        <GripVertical className='text-muted-foreground h-5 w-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>
          {link.label.length > 35 ? `${link.label.substring(0, 35)}...` : link.label}
        </p>
        <p className='text-muted-foreground truncate text-xs'>
          {link.link.length > 35 ? `${link.link.substring(0, 35)}...` : link.link}
        </p>
      </div>
    </div>
  );
}

export default function QuickLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [manageOpen, setManageOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const manageForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      link: '',
      iconType: 'link',
      price: undefined,
    },
  });

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('order', { ascending: true })
        .order('date', { ascending: false });

      if (error) {
        console.error('Fetch error details:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setLinks(data);
      } else {
        setLinks(fallbackLinks);
      }
    } catch (error) {
      toast.error('Failed to load links from database');
      setLinks(fallbackLinks);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsSubmitting(true);
    try {
      const updates = links.map((link, index) => ({
        id: link.id,
        order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('links')
          .update({ order: update.order })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Link order saved successfully!');
      setManageOpen(false);
      setSelectedAction(null);
      await fetchLinks();
    } catch (error) {
      toast.error('Failed to save link order');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to manage links');
        return;
      }

      if (selectedAction === 'add') {
        const currentDate = new Date().toISOString().split('T')[0];
        const newLink = {
          ...values,
          date: currentDate,
          user_id: user.id,
        };

        const { data, error } = await supabase.from('links').insert([newLink]).select();

        if (error) throw error;
        if (data) {
          setLinks([data[0], ...links]);
          toast.success(`Added new link: ${values.label}`);
        }
      } else if (selectedAction === 'update' && selectedLinkId) {
        const { error } = await supabase
          .from('links')
          .update(values)
          .eq('id', selectedLinkId);

        if (error) throw error;
        toast.success(`Updated link: ${values.label}`);
        await fetchLinks();
      }

      setManageOpen(false);
      setSelectedAction(null);
      setSelectedLinkId(null);
      manageForm.reset();
    } catch (error) {
      toast.error('Failed to manage link');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageDelete = async () => {
    if (!selectedLinkId) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('links').delete().eq('id', selectedLinkId);

      if (error) throw error;

      const updatedLinks = links.filter((link) => link.id !== selectedLinkId);
      if (updatedLinks.length === 0) {
        setLinks(fallbackLinks);
      } else {
        setLinks(updatedLinks);
      }

      toast.success('Link deleted successfully!');
      setManageOpen(false);
      setSelectedAction(null);
      setSelectedLinkId(null);
    } catch (error) {
      toast.error('Failed to delete link');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedAction === 'add') {
      manageForm.reset({
        label: '',
        link: '',
        iconType: 'link',
        price: undefined,
      });
    } else if (selectedAction === 'update' && selectedLinkId) {
      const link = links.find((l) => l.id === selectedLinkId);
      if (link) {
        manageForm.reset({
          label: link.label,
          link: link.link,
          iconType: link.iconType,
          price: link.price,
        });
      }
    }
  }, [selectedAction, selectedLinkId, manageForm, links]);

  return (
    <div
      className={`m-auto mt-5 mb-4 flex w-full flex-col justify-center space-y-4 px-4
        md:mt-10 md:max-w-1/2 lg:mx-4`}
    >
      {user && (
        <div className='mb-4 flex justify-center space-x-2'>
          <Dialog open={manageOpen} onOpenChange={setManageOpen}>
            <DialogTrigger asChild>
              <Button variant='outline'>
                <Edit /> Manage Links
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Manage Links</DialogTitle>
              </DialogHeader>
              <ScrollArea type='always' className='max-h-[50vh] pr-4 sm:max-h-[70vh]'>
                <div className='space-y-4 px-2'>
                  <div className='flex flex-col space-y-2'>
                    <Label>Select Action</Label>
                    <Select
                      value={selectedAction || ''}
                      onValueChange={(value) => {
                        setSelectedAction(value as ActionType);
                        if (value === 'add') {
                          setSelectedLinkId(null);
                        }
                      }}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select action...' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='add'>Add Link</SelectItem>
                          <SelectItem value='update'>Update Link</SelectItem>
                          <SelectItem value='delete'>Delete Link</SelectItem>
                          <SelectItem value='reorder'>Reorder Links</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {(selectedAction === 'update' || selectedAction === 'delete') && (
                    <div className='flex flex-col space-y-2'>
                      <Label>Select Link:</Label>
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
                  {(selectedAction === 'add' ||
                    (selectedAction === 'update' && selectedLinkId)) && (
                    <Form {...manageForm}>
                      <form
                        onSubmit={manageForm.handleSubmit(handleManageSubmit)}
                        className='space-y-2'
                      >
                        <FormField
                          control={manageForm.control}
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
                          control={manageForm.control}
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
                          control={manageForm.control}
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
                                          className={`hover:bg-accent flex cursor-pointer
                                          flex-col items-center justify-center rounded-md
                                          border-2 p-4 ${
                                            field.value === iconKey
                                              ? 'border-primary bg-accent'
                                              : 'border-muted'
                                          }`}
                                        >
                                          {Icon && <Icon strokeWidth={2} size={30} />}
                                          {imagePath && (
                                            <img
                                              src={imagePath}
                                              alt={iconKey}
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
                          control={manageForm.control}
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
                                      field.onChange(
                                        val === '' ? undefined : Number(val)
                                      );
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Leave blank to hide price. Enter 0 for Free, or any
                                positive value.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type='submit' className='w-full' disabled={isSubmitting}>
                          {isSubmitting ? (
                            <Loader2 className='animate-spin' />
                          ) : selectedAction === 'add' ? (
                            'Add Link'
                          ) : (
                            'Update Link'
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                  {selectedAction === 'delete' && selectedLinkId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='destructive'>Delete Link</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Permanently delete the link "
                            {links.find((l) => l.id === selectedLinkId)?.label}" from the
                            database? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleManageDelete}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className='animate-spin' />
                            ) : (
                              'Delete'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {selectedAction === 'reorder' && (
                    <div className='w-full space-y-4'>
                      <p className='text-muted-foreground text-sm'>
                        Drag and drop the links below to reorder them. Click "Save Order"
                        when done.
                      </p>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={links
                            .filter((link) => link.id !== undefined)
                            .map((link) => link.id!)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div
                            className='scrollbar-thin scrollbar-thumb-muted-foreground/50
                              scrollbar-track-secondary
                              hover:scrollbar-thumb-muted-foreground
                              scrollbar-thumb-rounded-full scrollbar-track-rounded-full
                              flex max-h-96 w-full flex-col space-y-2 overflow-x-hidden
                              overflow-y-auto pr-2'
                          >
                            {links
                              .filter((link) => link.id !== undefined)
                              .map((link) => (
                                <SortableItem key={link.id} link={link} />
                              ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <Button
                        onClick={handleSaveOrder}
                        className='w-full'
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className='animate-spin' />
                        ) : (
                          'Save Order'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {loading ? (
        <div className='flex justify-center pb-[860px]'>
          <Loader2 className='h-12 w-12 animate-spin rounded-full text-gray-700' />
        </div>
      ) : (
        links.map((link, idx) => (
          <IconLinkWide
            key={link.id || link.label}
            iconType={link.iconType}
            label={link.label}
            link={link.link}
            date={link.date}
            price={link.price}
            className={`bg-secondary border-ring drop-shadow-box hover:bg-muted
              fade-in-from-bottom fill-mode-both border-2 text-center
              ${getDelayClass(idx)}`}
          />
        ))
      )}
    </div>
  );
}
