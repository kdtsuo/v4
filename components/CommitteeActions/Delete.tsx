'use client';
import { useState } from 'react';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { TeamMember } from '@/types';
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

interface DeleteMemberDialogProps {
  member: TeamMember;
  onMemberDeleted: () => void;
}

export function DeleteMemberDialog({ member, onMemberDeleted }: DeleteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!member.id) {
      toast.error('Cannot delete team member without an ID');
      return;
    }

    setIsDeleting(true);
    try {
      await supabase
        .from('team_members')
        .update({ is_archived: true })
        .eq('id', member.id);

      toast.success('Team member deleted successfully!');
      setIsOpen(false);
      onMemberDeleted();
    } catch (error) {
      toast.error('Failed to delete team member. Please try again.');
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
          <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{member.full_name}</strong>? This
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
              'Delete Member'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
