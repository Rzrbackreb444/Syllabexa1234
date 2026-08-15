import { useState, useCallback } from 'react';

export interface TelemetryLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'agent';
  agent?: string;
}

export function usePipelineTelemetry(initialLogs: string[] = []) {
  const [logs, setLogs] = useState<TelemetryLog[]>(() => 
    initialLogs.map((msg, idx) => ({
      id: `${Date.now()}-${idx}`,
      timestamp: new Date().toISOString().substring(11, 19),
      message: msg,
      level: 'info'
    }))
  );

  const addLog = useCallback((message: string, level: TelemetryLog['level'] = 'info', agent?: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    const newEntry: TelemetryLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      message,
      level,
      agent
    };
    setLogs(prev => [...prev, newEntry].slice(-300));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    clearLogs
  };
}
