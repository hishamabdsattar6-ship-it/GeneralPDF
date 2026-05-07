import { create } from 'zustand';
import { openDB, IDBPDatabase } from 'idb';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface ChatHistoryEntry {
  fileHash: string;
  fileName: string;
  extractedText: string;
  chatHistory: ChatMessage[];
  timestamp: number;
}

interface ChatDBSchema {
  chats: {
    key: string;
    value: ChatHistoryEntry;
    indexes: {
      'by-timestamp': number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export const getChatDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<any>('generalpdf-chat-store', 1, {
      upgrade(db) {
        const store = db.createObjectStore('chats', { keyPath: 'fileHash' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
};

interface ChatStoreState {
  currentFileHash: string | null;
  historyEntries: Omit<ChatHistoryEntry, 'extractedText' | 'chatHistory'>[];
  loadHistoryEntries: () => Promise<void>;
  saveChat: (entry: ChatHistoryEntry) => Promise<void>;
  getChat: (fileHash: string) => Promise<ChatHistoryEntry | undefined>;
  activeExtractedText: string | null;
  activeChatHistory: ChatMessage[];
  setActiveChat: (fileHash: string) => Promise<void>;
  addMessageToActive: (message: ChatMessage) => Promise<void>;
  clearActive: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  currentFileHash: null,
  historyEntries: [],
  activeExtractedText: null,
  activeChatHistory: [],

  loadHistoryEntries: async () => {
    try {
      const db = await getChatDB();
      const allEntries = await db.getAllFromIndex('chats', 'by-timestamp');
      const sorted = allEntries.reverse().map(e => ({
        fileHash: e.fileHash,
        fileName: e.fileName,
        timestamp: e.timestamp,
      }));
      set({ historyEntries: sorted });
    } catch (e) {
      console.error("Failed to load history entries:", e);
    }
  },

  saveChat: async (entry) => {
    try {
      const db = await getChatDB();
      await db.put('chats', entry);
      await get().loadHistoryEntries();
    } catch (e) {
      console.error("Failed to save chat:", e);
    }
  },

  getChat: async (fileHash) => {
    try {
      const db = await getChatDB();
      return await db.get('chats', fileHash);
    } catch (e) {
      console.error("Failed to get chat:", e);
      return undefined;
    }
  },

  setActiveChat: async (fileHash) => {
    const entry = await get().getChat(fileHash);
    if (entry) {
      set({
        currentFileHash: fileHash,
        activeExtractedText: entry.extractedText,
        activeChatHistory: entry.chatHistory,
      });
    }
  },

  addMessageToActive: async (message) => {
    const state = get();
    if (!state.currentFileHash) return;
    
    const newHistory = [...state.activeChatHistory, message];
    set({ activeChatHistory: newHistory });

    const entry = await state.getChat(state.currentFileHash);
    if (entry) {
      entry.chatHistory = newHistory;
      entry.timestamp = Date.now();
      await state.saveChat(entry);
    }
  },

  clearActive: () => {
    set({
      currentFileHash: null,
      activeExtractedText: null,
      activeChatHistory: [],
    });
  }
}));
