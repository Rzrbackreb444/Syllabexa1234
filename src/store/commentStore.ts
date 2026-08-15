import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import { CommentItem } from '../types';

interface CommentState {
  comments: CommentItem[];
  addComment: (comment: Omit<CommentItem, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

export const useCommentStore = create<CommentState>()(
  persist(
    (set) => ({
      comments: [
        {
          id: 'comm-1',
          author: 'Senior Editor',
          text: 'Strengthen the technical transition here regarding coin slide replacement.',
          timestamp: new Date().toISOString(),
          resolved: false,
          chapterId: 'chap-1',
          selectionText: 'coin slide',
          aiSuggestedEdit: 'Replace coin slide mechanisms with solid-state RFID readers.'
        }
      ],

      addComment: (commentData) =>
        set((state) => ({
          comments: [
            ...state.comments,
            {
              ...commentData,
              id: `comm-${Date.now()}`,
              timestamp: new Date().toISOString(),
              resolved: false,
            }
          ]
        })),

      resolveComment: (id) =>
        set((state) => ({
          comments: state.comments.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c)
        })),

      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter(c => c.id !== id)
        })),
    }),
    {
      name: 'syllabexa-comment-storage',
      storage: idbStorage,
    }
  )
);