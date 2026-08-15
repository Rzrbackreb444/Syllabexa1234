import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

export interface VFSFile {
  id: string;
  path: string;
  content: string;
  updatedAt: number;
  hash: string;
}

export interface VFSSnapshot {
  id: string;
  timestamp: number;
  commitMessage: string;
  tree: Record<string, VFSFile>;
  authorId?: string;
}

interface VFSState {
  files: Record<string, VFSFile>;
  snapshots: VFSSnapshot[];
  activeFileId: string | null;
  isSyncing: boolean;
  
  // File operations
  upsertFile: (path: string, content: string) => void;
  deleteFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  
  // Ledger & Snapshot operations
  createSnapshot: (commitMessage: string, authorId?: string) => Promise<string>;
  rollbackToSnapshot: (snapshotId: string) => boolean;
  deleteSnapshot: (snapshotId: string) => void;
  syncToCloudSilent: (userId: string) => Promise<void>;
}

// Custom IndexedDB Storage Driver for high-volume manuscripts
const customIDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useVFSStore = create<VFSState>()(
  persist(
    (set, get) => ({
      files: {},
      snapshots: [],
      activeFileId: null,
      isSyncing: false,

      upsertFile: (path: string, content: string) => {
        const id = btoa(path);
        const hash = Math.random().toString(36).substring(2, 9);
        const file: VFSFile = { id, path, content, updatedAt: Date.now(), hash };

        set((state) => ({
          files: { ...state.files, [id]: file },
        }));
      },

      deleteFile: (id: string) => {
        set((state) => {
          const updatedFiles = { ...state.files };
          delete updatedFiles[id];
          return {
            files: updatedFiles,
            activeFileId: state.activeFileId === id ? null : state.activeFileId,
          };
        });
      },

      setActiveFile: (id: string | null) => set({ activeFileId: id }),

      createSnapshot: async (commitMessage: string, authorId?: string) => {
        const { files, snapshots } = get();
        const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        
        const newSnapshot: VFSSnapshot = {
          id: snapshotId,
          timestamp: Date.now(),
          commitMessage,
          tree: JSON.parse(JSON.stringify(files)),
          authorId,
        };

        set({ snapshots: [newSnapshot, ...snapshots] });
        return snapshotId;
      },

      rollbackToSnapshot: (snapshotId: string) => {
        const { snapshots } = get();
        const targetSnapshot = snapshots.find((s) => s.id === snapshotId);
        if (!targetSnapshot) return false;

        set({
          files: JSON.parse(JSON.stringify(targetSnapshot.tree)),
        });
        return true;
      },

      deleteSnapshot: (snapshotId: string) => {
        set((state) => ({
          snapshots: state.snapshots.filter((s) => s.id !== snapshotId),
        }));
      },

      syncToCloudSilent: async (userId: string) => {
        if (!userId) return;
        set({ isSyncing: true });
        try {
          // Background sync to Firestore subcollection without blocking UI
          const payload = JSON.stringify(get().files);
          await fetch(`/api/vfs/sync?userId=${encodeURIComponent(userId)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          });
        } catch {
          // Silently handle offline/network failovers via IndexedDB cache
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'syllabexa_vfs_ledger',
      storage: createJSONStorage(() => customIDBStorage),
    }
  )
);