'use client';
import { useState } from 'react';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { SponsorData } from '@/types';
import { Loader2, X } from 'lucide-react';
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
} from '@/components/ui';

interface DeleteSponsorDialogProps {
  sponsor: SponsorData;
  onSponsorDeleted: () => void;
}

export function DeleteSponsorDialog({
  sponsor,
  onSponsorDeleted,
}: DeleteSponsorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!sponsor.id) {
      toast.error('Cannot delete sponsor without an ID');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('sponsors').delete().eq('id', sponsor.id);

      if (error) {
        throw error;
      }

      toast.success('Sponsor deleted successfully!');
      setIsOpen(false);
      onSponsorDeleted();
    } catch (error) {
      toast.error('Failed to delete sponsor. Please try again.');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className='z-20 flex size-8 items-center gap-2 p-0'
          variant='destructive'
          size='sm'
          onClick={(e) => e.stopPropagation()}
        >
          <X size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{sponsor.title}</strong>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className='bg-destructive dark:text-primary hover:bg-destructive/90
              not-dark:text-white'
          >
            {isDeleting ? (
              <>
                <Loader2 className='animate-spin' />
                Deleting...
              </>
            ) : (
              'Delete Sponsor'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
