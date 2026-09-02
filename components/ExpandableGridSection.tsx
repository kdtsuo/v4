'use client';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useGridCols } from '@/hooks';
import { Text } from '@/components/Text';
import { Button } from './ui/button';

export function ExpandableGridSection<T extends { id: string }>({
  title,
  items,
  emptyMessage,
  renderCard,
}: {
  title?: string;
  items: T[];
  emptyMessage?: string;
  renderCard: (item: T, index: number) => ReactNode;
}) {
  const cols = useGridCols();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [items]);

  if (items.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className='mb-12 last:mb-0'>
        {title && (
          <Text variant='caption' size='xs' className='mb-4 text-center font-semibold uppercase tracking-[0.2em]'>
            {title}
          </Text>
        )}
        <div className='border rounded-xl border-dashed'>
          <Text variant='default' className='py-8 text-center text-muted-foreground'>
            {emptyMessage}
          </Text>
        </div>
      </div>
    );
  }

  const hasMore = items.length > cols;
  const visibleItems = expanded ? items : items.slice(0, cols);

  return (
    <div className='mb-12 last:mb-0'>
      <div className='mb-2 flex flex-col items-center gap-4 justify-center'>
        {title && (
          <Text variant='caption' size='xs' className='font-semibold uppercase tracking-[0.2em]'>
            {title}
          </Text>
        )}

        {hasMore && (
          <Button
            type='button'
            onClick={() => setExpanded((e) => !e)}
          >
            <Text as='span' variant='label' size='xs' className='font-semibold uppercase tracking-wide'>
              {expanded ? 'Show less' : 'Show more'}
            </Text>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        )}
      </div>

      <div
        className='grid auto-rows-70 grid-cols-1 gap-4 sm:grid-cols-2
          lg:grid-cols-3'
      >
        {visibleItems.map((item, i) => (
          <Fragment key={item.id}>{renderCard(item, i)}</Fragment>
        ))}
      </div>
    </div>
  );
}
