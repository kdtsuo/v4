import { useEffect, useState } from 'react';

// Matches the grid's own breakpoints: grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-3
export function useGridCols() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setCols(3);
      else if (w >= 640) setCols(2);
      else setCols(1);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cols;
}
