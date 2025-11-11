'use client';
import { useState } from 'react';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Link } from '@/types';
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
import { GripVertical, Loader2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from '@/components/ui';

type ReorderLinkDialogProps = {
  links: Link[];
  onLinksReordered: () => void;
  trigger?: React.ReactNode;
};

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
        className='shrink-0 cursor-grab active:cursor-grabbing'
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

export function ReorderLinkDialog({
  links: initialLinks,
  onLinksReordered,
  trigger,
}: ReorderLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      setIsOpen(false);
      onLinksReordered();
    } catch (error) {
      toast.error('Failed to save link order');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    // Reset links to initial state when dialog closes
    if (!newOpen) {
      setLinks(initialLinks);
    } else {
      setLinks(initialLinks);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Reorder Links</DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[50vh] pr-4 sm:max-h-[70vh]'>
          <div className='space-y-4 px-2'>
            <p className='text-muted-foreground text-sm'>
              Drag and drop the links below to reorder them. Click &quot;Save Order&quot;
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
                    scrollbar-track-secondary hover:scrollbar-thumb-muted-foreground
                    scrollbar-thumb-rounded-full scrollbar-track-rounded-full flex
                    max-h-96 w-full flex-col space-y-2 overflow-x-hidden overflow-y-auto
                    pr-2'
                >
                  {links
                    .filter((link) => link.id !== undefined)
                    .map((link) => (
                      <SortableItem key={link.id} link={link} />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </ScrollArea>
        <DialogFooter className='mt-4'>
          <Button onClick={handleSaveOrder} className='w-full' disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className='animate-spin' /> : 'Save Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
