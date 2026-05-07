import { useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function usePdfWorker() {
  const { startLoading, stopLoading, language } = useAppStore();
  const workerRef = useRef<Worker | null>(null);
  const pendingPromises = useRef<Map<string, {resolve: Function, reject: Function}>>(new Map());

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current.onmessage = (e) => {
        const { id, status, result, error } = e.data;
        const promiseHooks = pendingPromises.current.get(id);
        if (promiseHooks) {
          if (status === 'success') {
            promiseHooks.resolve(result);
          } else {
            promiseHooks.reject(new Error(error));
          }
          pendingPromises.current.delete(id);
        }
      };
    }
  }, []);

  const executeWorkerTask = useCallback(async (action: string, payload: any, loadingMsg: string) => {
    initWorker();
    startLoading(loadingMsg);
    
    const id = Math.random().toString(36).substring(2, 9);
    
    return new Promise<ArrayBuffer>((resolve, reject) => {
      pendingPromises.current.set(id, { resolve, reject });
      workerRef.current?.postMessage({ id, action, payload });
    }).finally(() => {
      stopLoading();
    });
  }, [initWorker, startLoading, stopLoading]);

  const mergeFiles = useCallback(async (files: File[]) => {
    const _filesData = await Promise.all(files.map(async f => (await f.arrayBuffer()).slice(0)));
    const msg = language === 'ar' ? 'جاري دمج الملفات...' : 'Merging files...';
    return executeWorkerTask('merge', { files: _filesData }, msg);
  }, [executeWorkerTask, language]);

  const splitPdf = useCallback(async (file: File, ranges: {start: number, end: number}[]) => {
    const fileData = (await file.arrayBuffer()).slice(0);
    const msg = language === 'ar' ? 'جاري استخراج الصفحات...' : 'Extracting pages...';
    return executeWorkerTask('split', { file: fileData, ranges }, msg);
  }, [executeWorkerTask, language]);

  const compressPdf = useCallback(async (file: File) => {
    const fileData = (await file.arrayBuffer()).slice(0);
    const msg = language === 'ar' ? 'جاري ضغط الملف...' : 'Compressing file...';
    return executeWorkerTask('compress', { file: fileData }, msg);
  }, [executeWorkerTask, language]);

  return { mergeFiles, splitPdf, compressPdf };
}
