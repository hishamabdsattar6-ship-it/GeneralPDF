import { openDB, IDBPDatabase } from 'idb';

interface PdfCacheSchema {
  ocrCache: {
    key: string;
    value: {
      text: string;
      timestamp: number;
    };
  };
  documents: {
    key: string;
    value: {
      id: string;
      title: string;
      content: string;
      timestamp: number;
      type: 'ai-created' | 'translated' | 'summarized';
    };
  };
}

let dbPromise: Promise<IDBPDatabase<PdfCacheSchema>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PdfCacheSchema>('pdf-processing-cache', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('ocrCache');
        }
        if (oldVersion < 2) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveDocument = async (doc: {
  id: string;
  title: string;
  content: string;
  type: 'ai-created' | 'translated' | 'summarized';
}) => {
  try {
    const db = await getDB();
    await db.put('documents', {
      ...doc,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error('Failed to save document:', e);
  }
};

export const getDocument = async (id: string) => {
  try {
    const db = await getDB();
    return await db.get('documents', id);
  } catch (e) {
    return null;
  }
};

export const getAllDocuments = async () => {
  try {
    const db = await getDB();
    return await db.getAll('documents');
  } catch (e) {
    return [];
  }
};

export const getCachedOcr = async (fileHash: string, pageNum: number): Promise<string | null> => {
  try {
    const db = await getDB();
    const result = await db.get('ocrCache', `${fileHash}_${pageNum}`);
    if (result && Date.now() - result.timestamp < 1000 * 60 * 60 * 24 * 7) { // 7 days cache
      return result.text;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const setCachedOcr = async (fileHash: string, pageNum: number, text: string): Promise<void> => {
  try {
    const db = await getDB();
    await db.put('ocrCache', { text, timestamp: Date.now() }, `${fileHash}_${pageNum}`);
  } catch (e) {
    // Ignore cache errors
  }
};

export const generateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.slice(0, 1024 * 100).arrayBuffer(); // Hash first 100kb
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
