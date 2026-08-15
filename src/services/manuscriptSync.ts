// manuscriptSync.ts
// Real-Time Distributed Conflict Resolution (CRDTs) via Yjs and WebRTC.

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useManuscriptStore } from '../store/manuscriptStore';

export const ydoc = new Y.Doc();

const ROOM_NAME = 'syllabexa-master-manuscript-room-v1';

let provider: WebrtcProvider | null = null;
let isSyncingFromRemote = false;

export function initManuscriptSync() {
  if (provider) return;
  try {
    provider = new WebrtcProvider(ROOM_NAME, ydoc, {
      signaling: [
        'wss://signaling.yjs.dev', 
        'wss://y-webrtc-signaling-eu.herokuapp.com', 
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ]
    });

    const yChapters = ydoc.getArray('chapters');
    const yMeta = ydoc.getMap('projectMeta');

    // Observe remote changes from Yjs to update Zustand store
    yChapters.observe(() => {
      if (isSyncingFromRemote) return;
      const remoteChapters = yChapters.toArray() as any[];
      if (remoteChapters && remoteChapters.length > 0) {
        isSyncingFromRemote = true;
        useManuscriptStore.setState({ chapters: remoteChapters });
        setTimeout(() => { isSyncingFromRemote = false; }, 50);
      }
    });

    yMeta.observe(() => {
      if (isSyncingFromRemote) return;
      const remoteMeta = yMeta.toJSON() as any;
      if (remoteMeta && remoteMeta.title) {
        isSyncingFromRemote = true;
        useManuscriptStore.setState(state => ({
          projectMeta: { ...state.projectMeta, ...remoteMeta }
        }));
        setTimeout(() => { isSyncingFromRemote = false; }, 50);
      }
    });

    provider.on('status', (event: any) => {
      console.log('[ManuscriptSync] WebRTC CRDT Peer Status:', event.status);
    });
  } catch (e) {
    console.warn('[ManuscriptSync] Failed to start WebRTC provider:', e);
  }
}

// Push local state updates into Yjs
export function syncLocalToYjs(chapters: any[], projectMeta: any) {
  if (isSyncingFromRemote) return;
  try {
    ydoc.transact(() => {
      const yChapters = ydoc.getArray('chapters');
      if (yChapters.length !== chapters.length || JSON.stringify(yChapters.toArray()) !== JSON.stringify(chapters)) {
        yChapters.delete(0, yChapters.length);
        yChapters.insert(0, chapters);
      }

      const yMeta = ydoc.getMap('projectMeta');
      Object.entries(projectMeta || {}).forEach(([key, value]) => {
        if (yMeta.get(key) !== value) {
          yMeta.set(key, value);
        }
      });
    });
  } catch (e) {
    console.warn('[ManuscriptSync] Sync to Yjs error:', e);
  }
}
