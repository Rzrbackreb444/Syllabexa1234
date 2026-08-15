import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export interface UserProfile {
  name: string;
  color: string;
  avatar?: string;
}

export interface ActiveCollaborator {
  clientId: number;
  name: string;
  color: string;
  isOnline: boolean;
  cursorPosition?: number;
}

/**
 * Enterprise CRDT Collaboration Engine
 * Establishes a P2P WebRTC mesh network for real-time document synchronization.
 */
export function useCollaborationSync(
  documentId: string, 
  userProfile: UserProfile = { name: 'Anonymous Author', color: '#6366f1' }
) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [collaborators, setCollaborators] = useState<ActiveCollaborator[]>([]);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (!documentId) return;

    // 1. Initialize the CRDT Document
    // This is the mathematical data structure that guarantees zero merge conflicts.
    const doc = new Y.Doc();
    
    // 2. Connect to the Signaling Server for this specific document/chapter
    // In production, you would run your own Hocuspocus/WebSocket server. 
    // Here we use WebRTC for a highly resilient, serverless P2P mesh network.
    const webrtcProvider = new WebrtcProvider(`syllabexa-enterprise-${documentId}`, doc, {
      signaling: [
        'wss://signaling.yjs.dev', 
        'wss://y-webrtc-signaling-eu.herokuapp.com'
      ],
      password: 'syllabexa-secure-mesh-v1' // Room encryption layer
    });

    // 3. Set Local User Awareness (Presence & Cursors)
    webrtcProvider.awareness.setLocalStateField('user', {
      name: userProfile.name,
      color: userProfile.color,
      avatar: userProfile.avatar
    });

    // 4. Listen for other users joining, leaving, or moving cursors
    const updateAwareness = () => {
      const states = Array.from(webrtcProvider.awareness.getStates().entries());
      const activeUsers: ActiveCollaborator[] = states
        .filter(([clientId]) => clientId !== webrtcProvider.awareness.clientID) // Exclude self
        .map(([clientId, state]: [number, any]) => ({
          clientId,
          name: state.user?.name || 'Unknown Writer',
          color: state.user?.color || '#cbd5e1',
          isOnline: true,
          cursorPosition: state.cursor?.pos || null,
        }));
      
      setCollaborators(activeUsers);
    };

    webrtcProvider.awareness.on('change', updateAwareness);

    // 5. Track Network Connection Status
    webrtcProvider.on('synced', ({ synced }: { synced: boolean }) => {
      setSyncStatus(synced ? 'connected' : 'connecting');
    });

    const handleDisconnect = () => setSyncStatus('disconnected');
    window.addEventListener('offline', handleDisconnect);
    window.addEventListener('online', () => setSyncStatus('connecting'));

    setYdoc(doc);
    setProvider(webrtcProvider);

    // 6. Cleanup Memory & Connections on Unmount
    return () => {
      window.removeEventListener('offline', handleDisconnect);
      window.removeEventListener('online', () => setSyncStatus('connecting'));
      webrtcProvider.awareness.off('change', updateAwareness);
      webrtcProvider.disconnect();
      webrtcProvider.destroy();
      doc.destroy();
    };
  }, [documentId, userProfile.name, userProfile.color, userProfile.avatar]);

  // 7. Manual Broadcast Fallback
  // While Tiptap automatically syncs text, this allows you to sync custom metadata 
  // (like Chapter Titles or Editor Notes) across the same secure mesh network.
  const broadcastMetadataEdit = useCallback((metadata: Record<string, any>) => {
    if (!ydoc) return;
    const metaMap = ydoc.getMap('metadata');
    Object.entries(metadata).forEach(([key, value]) => {
      metaMap.set(key, value);
    });
  }, [ydoc]);

  return { 
    ydoc, 
    provider, 
    collaborators, 
    syncStatus, 
    broadcastMetadataEdit 
  };
}