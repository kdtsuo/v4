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
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

type DeleteProps = {
  positions?: Position[];
  onPositionDeleted: () => void;
  trigger?: React.ReactNode;
};

export function Delete({ positions = [], onPositionDeleted, trigger }: DeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPositionLabel, setSelectedPositionLabel] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const selectedPosition = selectedPositionLabel
    ? positions.find(
        (p) => p.label.toLowerCase().replace(/\s+/g, '') === selectedPositionLabel
      )
    : undefined;

  const handleDelete = async () => {
    if (!selectedPosition?.label) {
      toast.error('Cannot delete position without a label');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('label', selectedPosition.label);

      if (error) throw error;

      toast.success('Position deleted successfully!');
      setConfirmOpen(false);
      setIsOpen(false);
      setSelectedPositionLabel('');
      onPositionDeleted();
    } catch (error) {
      toast.error('Failed to delete position. Please try again.');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedPositionLabel('');
      setConfirmOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Delete Position</DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[50vh] pr-4 sm:max-h-[70vh]'>
          <div className='space-y-4'>
            <div className='flex flex-col space-y-2'>
              <Label>Select Position to Delete:</Label>
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
            {selectedPositionLabel && selectedPosition && (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='w-full'>
                    Delete &quot;{selectedPosition.label}&quot;
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Position</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete{' '}
                      <strong>{selectedPosition.label}</strong>? This action cannot be
                      undone.
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
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
