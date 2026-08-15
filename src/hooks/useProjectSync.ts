import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/googleAuth';
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { BookProject, Chapter, CommentItem, Snapshot } from '../types';
import { useToast } from '../lib/ToastContext';

// Default book templates mapped to project IDs
const DEFAULT_BOOKS: Record<string, BookProject> = {
  washbiz: {
    title: "The WashBizHub Laundromat Bible: Three Generations’ Guide to a Profitable Laundry Empire",
    author: "Nicholas Kremers (3rd Gen Laundromat Operator)",
    selectedChapterId: "wb-ch-1",
    chapters: [
      {
        id: "wb-ch-1",
        title: "Foreword: The Legacy of Lint",
        content: "My grandfather built Kremers Laundry Equipment on the sweat of physical hand-cranks and 50lb iron Huebsch dryers. I grew up with the metallic tang of dry-cleaning fluid in my mouth and the low hum of heavy-duty motors vibrating through my boots. Most people look at a laundromat and see dusty tiles, coin slots, and people killing time on plastic chairs. I see the ultimate cash-flowing real estate fortress.\n\nThis isn't theory. This is sixty years of family operational warfare captured in ink."
      },
      {
        id: "wb-ch-2",
        title: "Chapter 1: The Site Density Formula",
        content: "Location is the only variable you cannot fix with a wrench. Most operators sign a lease because they like the rent price. They are dead before they open their doors. Here is the strict site-acquisition blueprint:\n\n1. Renter Density: A 2-mile radius must hold a minimum of 35% renter-occupied households. Homeowners do not wash their rugs at your store. Renters do.\n\n2. Utilities-to-Revenue Threshold: If the building's main water-line capacity is less than 2 inches, do not walk away—run. Upgrading a city sewer hookup can cost upwards of $80,000 in impact fees alone.\n\n3. Dedicated Parking: You must maintain a strict 3:1000 ratio—three dedicated parking spots per 1,000 square feet of retail footprint. If customers cannot park, they will take their 40-pound bags to your competitor down the block."
      },
      {
        id: "wb-ch-3",
        title: "Chapter 2: The G-Force Extractor Quotient",
        content: "Every rookie operator obsesses over washer price. Veterans obsess over G-Force. Here is the math most owners miss:\n\nStandard washers extract water at 100G. High-G extractors extract water at 350G to 450G. When a customer shifts their laundry from a 450G washer to your gas dryers, the clothes are already 30% drier. This does two critical things:\n\n1. It drops your gas utility bill by a direct 28-32%, which is the single biggest operational cost under your control.\n\n2. It cuts customer drying times from 40 minutes to 25 minutes. This spikes your customer velocity throughput during busy weekend rushes, allowing you to cycle more customers without adding physical floor space.\n\nNever buy a 100G machine to 'save' capital. It is a long-term utility tax on your profit margins."
      },
      {
        id: "wb-ch-4",
        title: "Chapter 3: The 22% Golden Ratio",
        content: "Let’s talk utilities-to-revenue ratios. Water, sewer, gas, electric. If your total combined utility bill exceeds 22% of gross revenue, you do not have a business—you have a hobby that funds the local power plant.\n\nIf your water-sewer ratio is spiking above 15% alone, you have one of two problems:\n\n- Hidden slab leaks (inspect your water meter at midnight when all machines are locked and idle).\n\n- Incorrect water levels on your Milnor or Dexter machines. Factory settings are designed to clean muddy football uniforms; you must reprogram them to a tight, efficient wash-cycle curve. Scale down the rinse-cycle depths by 1.5 inches. Your customers won't notice, but your pocketbook will."
      }
    ]
  },
  stroke: {
    title: "The Ultimate Stroke Recovery Revolution",
    author: "Nicholas 'Stroked-Out Sasquatch' Kremers",
    selectedChapterId: "ch-1",
    chapters: [
      {
        id: "ch-1",
        title: "Foreword",
        content: "Most forewords are a credentialed stranger telling the survivor the author is worth their time. This one is the survivor.\n\nI sat with this page for almost a year.\n\nI had a short list of people I respected enough to ask. A neurologist who has spent thirty years studying neuroplasticity. A speech-language pathologist who treats stroke aphasia in a teaching hospital. A survivor whose own memoir cleared a path for mine. Any of them could have written four pages that opened this book with the kind of authority a first-time author is supposed to borrow.\n\nI did not write the email."
      },
      {
        id: "ch-2",
        title: "Chapter 1: December 3, 2018",
        content: "I remember the exact moment because I have replayed it ten thousand times since.\n\nI was thirty-six years old. Two hundred and fifty pounds of Arkansas, built like a brick outhouse. I had benched over four hundred pounds the week before. I was Vice President of Kremers Laundry Equipment — third-generation family operation, working the kind of long days that make you feel like you can't be killed. Lisa was pregnant. Our son was due in the spring. Life was loaded and pointed in one direction: more.\n\nThat morning I woke up with a headache I tried to ignore.\n\nBy lunch the headache had teeth. Behind my left eye."
      }
    ]
  },
  new: {
    title: "New Book Manuscript",
    author: "Nicholas Kremers",
    selectedChapterId: "new-ch-1",
    chapters: [
      {
        id: "new-ch-1",
        title: "Chapter 1: The Beginning",
        content: "Start writing or launch the Autopilot outline engine to stream the manuscript..."
      }
    ]
  }
};

const DEFAULT_BIBLE = { characters: [], locations: [], scenes: [], timeline: [] };
const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: "comm-sample-1",
    author: "Editor Lisa",
    text: "Make this paragraph about Kremers Laundry Equipment feel more personal! Speak about Nicholas working alongside his grandfather.",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolved: false,
    chapterId: "ch-2"
  }
];

export function useProjectSync(userId: string | null, projectId: string) {
  const [book, setBook] = useState<BookProject>(() => {
    const defaultBook = DEFAULT_BOOKS[projectId] || DEFAULT_BOOKS.washbiz;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`manuscript_book_data_${projectId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.chapters) && parsed.chapters.length > 0) {
            return parsed;
          }
        } catch (e) {}
      }
    }
    return defaultBook;
  });

  const [bible, setBible] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`manuscript_bible_data_${projectId}`) || localStorage.getItem('manuscript_bible_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_BIBLE;
  });

  const [comments, setComments] = useState<CommentItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`manuscript_comments_data_${projectId}`) || localStorage.getItem('manuscript_comments_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return projectId === 'stroke' ? DEFAULT_COMMENTS : [];
  });

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`manuscript_snapshots_data_${projectId}`) || localStorage.getItem('manuscript_snapshots_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const skipNextSnapshotRef = useRef(false);

  const { addToast, triggerFirestoreError } = useToast();

  const handleSyncError = (message: string, error: any, op: OperationType, path: string) => {
    console.error(message, error);
    setSyncError(message);
    triggerFirestoreError(error, op, path);
    try {
      handleFirestoreError(error, op, path);
    } catch (e) {
      // Suppress thrown exception from handleFirestoreError so component does not crash
    }
  };

  // Sync to localStorage when offline (userId is null)
  useEffect(() => {
    if (!userId) {
      localStorage.setItem(`manuscript_book_data_${projectId}`, JSON.stringify(book));
      localStorage.setItem(`manuscript_bible_data_${projectId}`, JSON.stringify(bible));
      localStorage.setItem(`manuscript_comments_data_${projectId}`, JSON.stringify(comments));
      localStorage.setItem(`manuscript_snapshots_data_${projectId}`, JSON.stringify(snapshots));
    }
  }, [book, bible, comments, snapshots, userId, projectId]);

  // Load and subscribe to real-time updates when logged in
  useEffect(() => {
    if (!userId) return;

    setIsSyncing(true);

    const bookDocRef = doc(db, 'users', userId, 'projects', projectId);
    
    // Check if project metadata exists. If not, bootstrap the initial state.
    const bootstrapProject = async () => {
      try {
        const snap = await getDoc(bookDocRef);
        if (!snap.exists()) {
          const defaultBook = DEFAULT_BOOKS[projectId] || DEFAULT_BOOKS.washbiz;
          const initialBible = projectId === 'stroke' ? DEFAULT_BIBLE : DEFAULT_BIBLE;
          const initialComments = projectId === 'stroke' ? DEFAULT_COMMENTS : [];

          // Save Book Metadata
          await setDoc(bookDocRef, {
            userId: userId,
            title: defaultBook.title,
            author: defaultBook.author,
            selectedChapterId: defaultBook.selectedChapterId,
            updatedAt: serverTimestamp()
          });

          // Save chapters
          for (const ch of defaultBook.chapters) {
            await setDoc(doc(db, 'users', userId, 'projects', projectId, 'chapters', ch.id), {
              id: ch.id,
              title: ch.title,
              content: ch.content,
              updatedAt: serverTimestamp()
            });
          }

          // Save Story Bible
          await setDoc(doc(db, 'users', userId, 'projects', projectId, 'bible', 'index'), {
            characters: initialBible.characters || [],
            locations: initialBible.locations || [],
            scenes: initialBible.scenes || [],
            timeline: initialBible.timeline || [],
            updatedAt: serverTimestamp()
          });

          // Save Comments
          for (const comm of initialComments) {
            await setDoc(doc(db, 'users', userId, 'projects', projectId, 'comments', comm.id), {
              id: comm.id,
              author: comm.author,
              text: comm.text,
              timestamp: comm.timestamp,
              resolved: comm.resolved,
              chapterId: comm.chapterId,
              selectionText: comm.selectionText || null,
              aiSuggestedEdit: comm.aiSuggestedEdit || null,
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (err) {
        console.error("Failed to bootstrap project data in Firestore", err);
      } finally {
        setIsSyncing(false);
      }
    };

    bootstrapProject();

    // 1. Subscribe to Book Metadata
    const unsubBook = onSnapshot(bookDocRef, (snap) => {
      if (snap.exists() && !snap.metadata.hasPendingWrites) {
        const data = snap.data();
        setBook(prev => ({
          ...prev,
          title: data.title || prev.title,
          author: data.author || prev.author,
          selectedChapterId: data.selectedChapterId || prev.selectedChapterId
        }));
      }
    }, (err) => handleSyncError("Error subscribing to book metadata.", err, OperationType.GET, `users/${userId}/projects/${projectId}`));

    // 2. Subscribe to Chapters
    const chaptersColRef = collection(db, 'users', userId, 'projects', projectId, 'chapters');
    const unsubChapters = onSnapshot(chaptersColRef, (snap) => {
      if (!snap.metadata.hasPendingWrites) {
        const loadedChapters: Chapter[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          loadedChapters.push({
            id: data.id,
            title: data.title,
            content: data.content,
            orderIndex: data.orderIndex !== undefined ? data.orderIndex : 0
          });
        });
        
        // Sort chapters by orderIndex
        loadedChapters.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

        if (loadedChapters.length > 0) {
          setBook(prev => ({
            ...prev,
            chapters: loadedChapters
          }));
        }
      }
    }, (err) => handleSyncError("Error subscribing to chapters list.", err, OperationType.LIST, `users/${userId}/projects/${projectId}/chapters`));

    // 3. Subscribe to Story Bible Index
    const bibleDocRef = doc(db, 'users', userId, 'projects', projectId, 'bible', 'index');
    const unsubBible = onSnapshot(bibleDocRef, (snap) => {
      if (snap.exists() && !snap.metadata.hasPendingWrites) {
        const bData = snap.data();
        setBible({
          characters: bData.characters || [],
          locations: bData.locations || [],
          scenes: bData.scenes || [],
          timeline: bData.timeline || []
        });
      }
    }, (err) => handleSyncError("Error subscribing to Story Bible updates.", err, OperationType.GET, `users/${userId}/projects/${projectId}/bible/index`));

    // 4. Subscribe to Comments
    const commentsColRef = collection(db, 'users', userId, 'projects', projectId, 'comments');
    const unsubComments = onSnapshot(commentsColRef, (snap) => {
      if (!snap.metadata.hasPendingWrites) {
        const loadedComments: CommentItem[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          loadedComments.push({
            id: data.id,
            author: data.author,
            text: data.text,
            timestamp: data.timestamp,
            resolved: data.resolved,
            chapterId: data.chapterId,
            selectionText: data.selectionText,
            aiSuggestedEdit: data.aiSuggestedEdit
          });
        });
        setComments(loadedComments);
      }
    }, (err) => handleSyncError("Error subscribing to comments feed.", err, OperationType.LIST, `users/${userId}/projects/${projectId}/comments`));

    // 5. Subscribe to Snapshots
    const snapshotsColRef = collection(db, 'users', userId, 'projects', projectId, 'snapshots');
    const unsubSnapshots = onSnapshot(snapshotsColRef, (snap) => {
      if (!snap.metadata.hasPendingWrites) {
        const loadedSnapshots: Snapshot[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          loadedSnapshots.push({
            id: data.id,
            timestamp: data.timestamp,
            title: data.title,
            chapters: data.chapters || [],
            bible: data.bible
          });
        });
        setSnapshots(loadedSnapshots);
      }
    }, (err) => handleSyncError("Error subscribing to snapshots.", err, OperationType.LIST, `users/${userId}/projects/${projectId}/snapshots`));

    return () => {
      unsubBook();
      unsubChapters();
      unsubBible();
      unsubComments();
      unsubSnapshots();
    };
  }, [userId, projectId]);

  // Unified save functions to mutate cloud data reactively
  const saveBookMetadata = async (updatedTitle: string, updatedAuthor: string, selectedId: string | null) => {
    if (!userId) {
      setBook(prev => ({
        ...prev,
        title: updatedTitle,
        author: updatedAuthor,
        selectedChapterId: selectedId
      }));
      return;
    }

    const bookDocRef = doc(db, 'users', userId, 'projects', projectId);
    await setDoc(bookDocRef, {
      userId,
      title: updatedTitle,
      author: updatedAuthor,
      selectedChapterId: selectedId,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(err => {
      handleSyncError("Failed to sync book metadata to Firestore.", err, OperationType.WRITE, `users/${userId}/projects/${projectId}`);
    });
  };

  const saveChapter = async (chapter: Chapter) => {
    // Update local state first for instant responsiveness
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === chapter.id ? chapter : c)
    }));

    if (!userId) return;

    const chDocRef = doc(db, 'users', userId, 'projects', projectId, 'chapters', chapter.id);
    await setDoc(chDocRef, {
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
      orderIndex: chapter.orderIndex !== undefined ? chapter.orderIndex : 0,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(err => {
      handleSyncError(`Failed to sync chapter "${chapter.title}" to Firestore.`, err, OperationType.WRITE, `users/${userId}/projects/${projectId}/chapters/${chapter.id}`);
    });
  };

  const deleteChapterFromCloud = async (chapterId: string) => {
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== chapterId)
    }));

    if (!userId) return;

    const chDocRef = doc(db, 'users', userId, 'projects', projectId, 'chapters', chapterId);
    await deleteDoc(chDocRef).catch(err => {
      handleSyncError("Failed to delete chapter from Firestore.", err, OperationType.DELETE, `users/${userId}/projects/${projectId}/chapters/${chapterId}`);
    });
  };

  const saveStoryBible = async (updatedBible: any) => {
    setBible(updatedBible);

    if (!userId) return;

    const bibleDocRef = doc(db, 'users', userId, 'projects', projectId, 'bible', 'index');
    await setDoc(bibleDocRef, {
      characters: updatedBible.characters || [],
      locations: updatedBible.locations || [],
      scenes: updatedBible.scenes || [],
      timeline: updatedBible.timeline || [],
      updatedAt: serverTimestamp()
    }).catch(err => {
      handleSyncError("Failed to sync Story Bible updates to Firestore.", err, OperationType.WRITE, `users/${userId}/projects/${projectId}/bible/index`);
    });
  };

  const saveComment = async (comment: CommentItem) => {
    setComments(prev => {
      const idx = prev.findIndex(c => c.id === comment.id);
      if (idx > -1) {
        return prev.map(c => c.id === comment.id ? comment : c);
      } else {
        return [...prev, comment];
      }
    });

    if (!userId) return;

    const commDocRef = doc(db, 'users', userId, 'projects', projectId, 'comments', comment.id);
    await setDoc(commDocRef, {
      id: comment.id,
      author: comment.author,
      text: comment.text,
      timestamp: comment.timestamp,
      resolved: comment.resolved,
      chapterId: comment.chapterId,
      selectionText: comment.selectionText || null,
      aiSuggestedEdit: comment.aiSuggestedEdit || null,
      updatedAt: serverTimestamp()
    }).catch(err => {
      handleSyncError("Failed to sync comment to Firestore.", err, OperationType.WRITE, `users/${userId}/projects/${projectId}/comments/${comment.id}`);
    });
  };

  const deleteCommentFromCloud = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));

    if (!userId) return;

    const commDocRef = doc(db, 'users', userId, 'projects', projectId, 'comments', commentId);
    await deleteDoc(commDocRef).catch(err => {
      handleSyncError("Failed to delete comment from Firestore.", err, OperationType.DELETE, `users/${userId}/projects/${projectId}/comments/${commentId}`);
    });
  };

  const saveSnapshotToCloud = async (snapshot: Snapshot) => {
    setSnapshots(prev => [...prev, snapshot]);

    if (!userId) return;

    const snapDocRef = doc(db, 'users', userId, 'projects', projectId, 'snapshots', snapshot.id);
    await setDoc(snapDocRef, {
      id: snapshot.id,
      timestamp: snapshot.timestamp,
      title: snapshot.title,
      chapters: snapshot.chapters,
      bible: snapshot.bible || null,
      updatedAt: serverTimestamp()
    }).catch(err => {
      handleSyncError("Failed to save snapshot to Firestore.", err, OperationType.WRITE, `users/${userId}/projects/${projectId}/snapshots/${snapshot.id}`);
    });
  };

  const deleteSnapshotFromCloud = async (snapshotId: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));

    if (!userId) return;

    const snapDocRef = doc(db, 'users', userId, 'projects', projectId, 'snapshots', snapshotId);
    await deleteDoc(snapDocRef).catch(err => {
      handleSyncError("Failed to delete snapshot from Firestore.", err, OperationType.DELETE, `users/${userId}/projects/${projectId}/snapshots/${snapshotId}`);
    });
  };

  return {
    book,
    setBook,
    bible,
    setBible,
    comments,
    setComments,
    snapshots,
    setSnapshots,
    isSyncing,
    syncError,
    clearSyncError: () => setSyncError(null),
    saveBookMetadata,
    saveChapter,
    deleteChapterFromCloud,
    saveStoryBible,
    saveComment,
    deleteCommentFromCloud,
    saveSnapshotToCloud,
    deleteSnapshotFromCloud
  };
}