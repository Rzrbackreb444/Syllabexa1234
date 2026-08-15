import React, { ReactNode, useEffect } from 'react';
import { useSelfOptimizer } from '../store/useSelfOptimizer';
import { useNetworkSync } from '../hooks/useNetworkSync';
import { cloudSnapshotWorker } from '../services/cloudSnapshotWorker';

interface Props {
  children: ReactNode;
}

export const WorkspaceController: React.FC<Props> = ({ children }) => {
  const optimizer = useSelfOptimizer();
  useNetworkSync();
  
  useEffect(() => {
    cloudSnapshotWorker.start();
    const interval = setInterval(() => {
       const pending = useSelfOptimizer.getState().telemetryQueue.filter(t => t.status === 'detected');
       if (pending.length > 0) {
           // Optionally auto-trigger optimization in background
       }
    }, 60000);
    return () => {
      clearInterval(interval);
      cloudSnapshotWorker.stop();
    };
  }, []);

  return <>{children}</>;
};
