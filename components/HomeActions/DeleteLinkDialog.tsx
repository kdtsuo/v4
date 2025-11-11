'use client';
import { useState } from 'react';
import { useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Link } from '@/types';
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

type DeleteLinkDialogProps = {
  links?: Link[];
  onLinkDeleted: () => void;
  trigger?: React.ReactNode;
};

export function DeleteLinkDialog({
  links = [],
  onLinkDeleted,
  trigger,
}: DeleteLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const selectedLink = selectedLinkId
    ? links.find((l) => l.id === selectedLinkId)
    : undefined;

  const handleDelete = async () => {
    if (!selectedLinkId) {
      toast.error('Cannot delete link without an ID');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('links').delete().eq('id', selectedLinkId);

      if (error) throw error;

      toast.success('Link deleted successfully!');
      setConfirmOpen(false);
      setIsOpen(false);
      setSelectedLinkId(null);
      onLinkDeleted();
    } catch (error) {
      toast.error('Failed to delete link. Please try again.');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedLinkId(null);
      setConfirmOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Delete Link</DialogTitle>
        </DialogHeader>
        <ScrollArea type='always' className='max-h-[50vh] pr-4 sm:max-h-[70vh]'>
          <div className='space-y-4 px-2'>
            <div className='flex flex-col space-y-2'>
              <Label>Select Link to Delete:</Label>
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
            {selectedLinkId && selectedLink && (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='w-full'>
                    Delete &quot;{selectedLink.label}&quot;
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Link</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete{' '}
                      <strong>{selectedLink.label}</strong>? This action cannot be undone.
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
                        'Delete Link'
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
