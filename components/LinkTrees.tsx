'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth, useToast } from '@/hooks';
import { supabase } from '@/lib';
import type { Link } from '@/types';
import { Loader2, Edit, Trash2, ArrowUpDown, Plus } from 'lucide-react';
import { IconLinkWide } from '@/components/';
import { fallbackLinks } from '@/lib/data';
import { Button } from '@/components/ui';
import { getDelayClass } from '@/utils/animations';
import * as HomeActions from '@/components/HomeActions';

export function LinkTrees() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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

  return (
    <div
      className={`m-auto mt-5 mb-4 flex w-full flex-col justify-center space-y-4 px-4
        md:mt-10 md:max-w-1/2 lg:mx-4`}
    >
      {user && (
        <div className='mb-4 flex flex-wrap justify-center gap-2'>
          {/* Add Link Button */}
          <HomeActions.AddEditLinkDialog
            onLinkSaved={fetchLinks}
            trigger={
              <Button variant='default'>
                <Plus className='h-4 w-4' /> Add
              </Button>
            }
          />

          {/* Edit Link Button */}
          <HomeActions.AddEditLinkDialog
            links={links}
            onLinkSaved={fetchLinks}
            trigger={
              <Button variant='secondary'>
                <Edit className='h-4 w-4' /> Edit
              </Button>
            }
          />

          {/* Delete Link Button */}
          <HomeActions.DeleteLinkDialog
            links={links}
            onLinkDeleted={fetchLinks}
            trigger={
              <Button variant='secondary'>
                <Trash2 className='h-4 w-4' /> Delete
              </Button>
            }
          />

          {/* Reorder Links Button */}
          <HomeActions.ReorderLinkDialog
            links={links}
            onLinksReordered={fetchLinks}
            trigger={
              <Button variant='secondary'>
                <ArrowUpDown className='h-4 w-4' /> Reorder
              </Button>
            }
          />
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
