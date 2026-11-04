import { useState, useEffect } from 'react';

export function useScrollToNew(dataAttr, dep) {
  const [scrollTargetId, setScrollTargetId] = useState(null);

  useEffect(() => {
    if (!scrollTargetId) return;
    const el = document.querySelector(`[${dataAttr}="${scrollTargetId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('scroll-highlight');
      const timeout = setTimeout(() => {
        el.classList.remove('scroll-highlight');
      }, 2600);
      setScrollTargetId(null);
      return () => clearTimeout(timeout);
    }
  }, [scrollTargetId, dataAttr, dep]);

  return setScrollTargetId;
}