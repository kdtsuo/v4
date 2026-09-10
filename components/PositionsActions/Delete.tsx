'use client';
import { useState } from 'react';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Position } from '@/types';
import { Loader2 } from 'lucide-react';
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
} from '@/components/ui';

type DeleteProps = {
  position?: Position;
  onPositionDeleted: () => void;
  trigger?: React.ReactNode;
};

export function Delete({ position, onPositionDeleted, trigger }: DeleteProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!position?.id) {
      toast.error('Cannot delete position without an ID');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('positions').delete().eq('id', position.id);

      if (error) throw error;

      toast.success('Position deleted successfully!');
      setConfirmOpen(false);
      onPositionDeleted();
    } catch (error) {
      toast.error('Failed to delete position. Please try again.');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Position</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{position?.label}</strong>? This
            action cannot be undone.
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
              'Delete Position'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
