import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  FileText, 
  Table, 
  Trash2, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  FolderOpen, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Loader2,
  CheckCircle2,
  ListTodo,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Globe
} from 'lucide-react';
import { googleSignIn, getAccessToken, logout, initAuth } from '../lib/googleAuth';
import { useToast } from '../lib/ToastContext';

export default function GoogleWorkspaceHub() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'keep' | 'sheets' | 'forms' | 'classroom' | 'picker'>('tasks');

  // Tasks state
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  // Keep / Notes state (synced via Drive files)
  const [keepNotes, setKeepNotes] = useState<any[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isKeepLoading, setIsKeepLoading] = useState(false);

  // Sheets state
  const [spreadsheets, setSpreadsheets] = useState<any[]>([]);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isSheetsLoading, setIsSheetsLoading] = useState(false);

  // Classroom state
  const [courses, setCourses] = useState<any[]>([]);
  const [isClassroomLoading, setIsClassroomLoading] = useState(false);

  // Forms state
  const [forms, setForms] = useState<any[]>([]);
  const [isFormsLoading, setIsFormsLoading] = useState(false);

  // Picker / Drive state
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setIsAuthenticated(true);
        setAccessToken(token);
        fetchAllData(token);
      },
      () => {
        setIsAuthenticated(false);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res && res.accessToken) {
        setIsAuthenticated(true);
        setAccessToken(res.accessToken);
        showToast('Successfully authenticated with Google Workspace!', 'success');
        fetchAllData(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Google Sign-In failed: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async (token: string) => {
    fetchTasks(token);
    fetchKeepNotes(token);
    fetchSheets(token);
    fetchClassroomCourses(token);
    fetchDriveFiles(token);
  };

  // Google Tasks API
  const fetchTasks = async (token: string) => {
    setIsTasksLoading(true);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.items) {
        setTaskLists(data.items);
        if (data.items.length > 0 && !selectedListId) {
          setSelectedListId(data.items[0].id);
        }
      }

      const listId = selectedListId || '@default';
      const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasksData = await tasksRes.json();
      setTasks(tasksData.items || []);
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !accessToken) return;
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTaskTitle })
      });
      if (res.ok) {
        setNewTaskTitle('');
        showToast('Google Task created successfully!', 'success');
        fetchTasks(accessToken);
      }
    } catch (e) {
      showToast('Failed to create task.', 'error');
    }
  };

  // Google Keep Notes via Drive Storage
  const fetchKeepNotes = async (token: string) => {
    setIsKeepLoading(true);
    try {
      const res = await fetch("https://www.googleapis.com/drive/v3/files?q=name contains 'syllabexa_keep_note'", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const files = data.files || [];
      const notes = [];
      for (const f of files) {
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const content = await fileRes.json();
        notes.push({ id: f.id, ...content });
      }
      setKeepNotes(notes);
    } catch (e) {
      console.error('Failed to fetch keep notes', e);
    } finally {
      setIsKeepLoading(false);
    }
  };

  const handleCreateKeepNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !accessToken) return;
    try {
      const metadata = {
        name: `syllabexa_keep_note_${Date.now()}.json`,
        mimeType: 'application/json'
      };
      const noteContent = { title: newNoteTitle, content: newNoteContent, updatedAt: new Date().toISOString() };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(noteContent)], { type: 'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (res.ok) {
        setNewNoteTitle('');
        setNewNoteContent('');
        showToast('Google Keep note synced to Drive!', 'success');
        fetchKeepNotes(accessToken);
      }
    } catch (e) {
      showToast('Failed to create note.', 'error');
    }
  };

  const handleDeleteKeepNote = async (fileId: string) => {
    if (!window.confirm('Delete this Google Keep note from Drive?')) return;
    if (!accessToken) return;
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      showToast('Note deleted.', 'success');
      fetchKeepNotes(accessToken);
    } catch (e) {
      showToast('Failed to delete note.', 'error');
    }
  };

  // Google Sheets API
  const fetchSheets = async (token: string) => {
    setIsSheetsLoading(true);
    try {
      const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSpreadsheets(data.files || []);
    } catch (e) {
      console.error('Failed to fetch sheets', e);
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim() || !accessToken) return;
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: newSheetTitle }
        })
      });
      if (res.ok) {
        setNewSheetTitle('');
        showToast('Google Spreadsheet created!', 'success');
        fetchSheets(accessToken);
      }
    } catch (e) {
      showToast('Failed to create spreadsheet.', 'error');
    }
  };

  // Google Classroom API
  const fetchClassroomCourses = async (token: string) => {
    setIsClassroomLoading(true);
    try {
      const res = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (e) {
      console.error('Failed to fetch classroom courses', e);
    } finally {
      setIsClassroomLoading(false);
    }
  };

  // Google Drive Files / Picker View
  const fetchDriveFiles = async (token: string) => {
    setIsDriveLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink)', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (e) {
      console.error('Failed to fetch drive files', e);
    } finally {
      setIsDriveLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#12151c] border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-widest">Google Workspace Integration Hub</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage Google Tasks, Keep Notes, Sheets, Classroom, and Drive Picker seamlessly.</p>
          </div>
        </div>

        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck size={14} /> Connected
              </span>
              <button
                onClick={() => logout()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition-all cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-mono text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              <span>Sign in with Google Workspace</span>
            </button>
          )}
        </div>
      </div>

      {isAuthenticated ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'tasks' ? 'bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/20' : 'bg-[#12151c] text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              <CheckSquare size={14} /> Google Tasks
            </button>
            <button
              onClick={() => setActiveTab('keep')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'keep' ? 'bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/20' : 'bg-[#12151c] text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              <FileText size={14} /> Google Keep / Notes
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'sheets' ? 'bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/20' : 'bg-[#12151c] text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              <Table size={14} /> Google Sheets
            </button>
            <button
              onClick={() => setActiveTab('classroom')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'classroom' ? 'bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/20' : 'bg-[#12151c] text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              <GraduationCap size={14} /> Google Classroom
            </button>
            <button
              onClick={() => setActiveTab('picker')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'picker' ? 'bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/20' : 'bg-[#12151c] text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              <FolderOpen size={14} /> Google Picker / Drive
            </button>
          </div>

          {/* Tab Content: Tasks */}
          {activeTab === 'tasks' && (
            <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest">Google Tasks Manager</h2>
                  <p className="text-xs text-slate-400">Sync and manage your editorial and project milestones.</p>
                </div>
                <button 
                  onClick={() => accessToken && fetchTasks(accessToken)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="Refresh Tasks"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="flex gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter new task title..."
                  className="flex-1 bg-[#0c0e12] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus size={16} /> Add Task
                </button>
              </form>

              {isTasksLoading ? (
                <div className="py-12 flex justify-center text-indigo-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-xs font-mono text-slate-500">No tasks found in this list.</div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-[#0c0e12] border border-slate-800/80 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} className={task.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'} />
                          <span className={`text-xs ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400">
                          {task.status || 'needsAction'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Keep / Notes */}
          {activeTab === 'keep' && (
            <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest">Google Keep / Drive Notes Sync</h2>
                  <p className="text-xs text-slate-400">Create sticky notes and synch them directly with Google Drive storage.</p>
                </div>
                <button 
                  onClick={() => accessToken && fetchKeepNotes(accessToken)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="Refresh Notes"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateKeepNote} className="space-y-3 bg-[#0c0e12] border border-slate-800 p-4 rounded-2xl">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note content here..."
                  rows={3}
                  className="w-full bg-[#12151c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteTitle.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus size={14} /> Save Note to Drive
                  </button>
                </div>
              </form>

              {isKeepLoading ? (
                <div className="py-12 flex justify-center text-indigo-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keepNotes.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-xs font-mono text-slate-500">No synced notes found in Google Drive.</div>
                  ) : (
                    keepNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-[#0c0e12] border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-bold text-slate-200">{note.title}</h3>
                            <button
                              onClick={() => handleDeleteKeepNote(note.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Delete note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">{note.content}</p>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2">
                          Synced: {new Date(note.updatedAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Sheets */}
          {activeTab === 'sheets' && (
            <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest">Google Spreadsheets</h2>
                  <p className="text-xs text-slate-400">Create and browse Google Sheets directly within the application.</p>
                </div>
                <button 
                  onClick={() => accessToken && fetchSheets(accessToken)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="Refresh Sheets"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <form onSubmit={handleCreateSheet} className="flex gap-3">
                <input
                  type="text"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  placeholder="New Spreadsheet Title..."
                  className="flex-1 bg-[#0c0e12] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newSheetTitle.trim()}
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus size={16} /> Create Spreadsheet
                </button>
              </form>

              {isSheetsLoading ? (
                <div className="py-12 flex justify-center text-indigo-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {spreadsheets.length === 0 ? (
                    <div className="text-center py-8 text-xs font-mono text-slate-500">No Google Spreadsheets found.</div>
                  ) : (
                    spreadsheets.map((sheet) => (
                      <div key={sheet.id} className="flex items-center justify-between p-4 bg-[#0c0e12] border border-slate-800/80 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet size={18} className="text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">{sheet.name}</span>
                        </div>
                        {sheet.webViewLink && (
                          <a
                            href={sheet.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl transition-all"
                          >
                            Open <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Classroom */}
          {activeTab === 'classroom' && (
            <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest">Google Classroom Courses</h2>
                  <p className="text-xs text-slate-400">View enrolled courses and academic sync statuses.</p>
                </div>
                <button 
                  onClick={() => accessToken && fetchClassroomCourses(accessToken)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="Refresh Courses"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {isClassroomLoading ? (
                <div className="py-12 flex justify-center text-indigo-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-xs font-mono text-slate-500">No Google Classroom courses found.</div>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="p-4 bg-[#0c0e12] border border-slate-800 rounded-2xl space-y-2">
                        <h3 className="text-xs font-bold text-slate-100">{course.name}</h3>
                        <p className="text-[11px] text-slate-400">{course.section || 'No section'} • {course.room || 'No room'}</p>
                        {course.alternateLink && (
                          <a
                            href={course.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:underline pt-2"
                          >
                            Open in Classroom <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Picker / Drive */}
          {activeTab === 'picker' && (
            <div className="bg-[#12151c] border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest">Google Picker & Drive Files</h2>
                  <p className="text-xs text-slate-400">Browse and access documents stored in your Google Drive.</p>
                </div>
                <button 
                  onClick={() => accessToken && fetchDriveFiles(accessToken)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  title="Refresh Drive"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {isDriveLoading ? (
                <div className="py-12 flex justify-center text-indigo-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {driveFiles.length === 0 ? (
                    <div className="text-center py-8 text-xs font-mono text-slate-500">No files found in Google Drive.</div>
                  ) : (
                    driveFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-[#0c0e12] border border-slate-800/80 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <FolderOpen size={18} className="text-indigo-400" />
                          <div>
                            <span className="text-xs font-bold text-slate-200">{file.name}</span>
                            <div className="text-[10px] font-mono text-slate-500">{file.mimeType}</div>
                          </div>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl transition-all"
                          >
                            Open <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#12151c] border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Globe size={32} />
          </div>
          <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-widest">Google Workspace Authentication Required</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Please sign in with your Google account above to securely connect Tasks, Sheets, Keep Notes, Classroom, and Drive Picker.</p>
        </div>
      )}
    </div>
  );
}
