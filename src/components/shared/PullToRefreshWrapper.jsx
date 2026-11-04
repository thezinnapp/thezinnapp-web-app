import { useRef } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';

export default function PullToRefreshWrapper({ onRefresh, children }) {
  const containerRef = useRef(null);
  const { isPulling, pullDistance, THRESHOLD } = usePullToRefresh(onRefresh, containerRef);

  return (
    <div ref={containerRef} className="relative">
      {isPulling && (
        <div
          className="flex items-center justify-center transition-all duration-150"
          style={{ height: Math.max(0, pullDistance), overflow: 'hidden' }}
        >
          <RefreshCw
            className="w-5 h-5 text-primary transition-transform"
            style={{ 
              transform: `rotate(${Math.min((pullDistance / THRESHOLD) * 360, 360)}deg)`, 
              opacity: Math.min(pullDistance / THRESHOLD, 1)
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}