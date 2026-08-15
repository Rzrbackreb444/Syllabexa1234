import { useEffect } from 'react';
import { useSelfOptimizer } from '../store/useSelfOptimizer';

export const useNetworkSync = () => {
  useEffect(() => {
    const handleOnline = () => {
      console.log('[NetworkSync] Connection restored. Flushing pending telemetry queue...');
      useSelfOptimizer.getState().runAutonomousOptimization();
    };

    const handleOffline = () => {
      useSelfOptimizer.getState().logTelemetry(
        'performance',
        'Network offline mode engaged. Local IndexedDB changes queued.'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
};
