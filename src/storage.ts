import type { Project } from './types';

export const REAL_DB_NAME = 'table-proofing-desk';
export const DEMO_DB_NAME = 'demo:table-proofing-desk';
const STORE = 'projects';

function database(demo = false): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(demo ? DEMO_DB_NAME : REAL_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: Project, demo = false): Promise<void> {
  const db = await database(demo);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(project);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProject(demo = false): Promise<Project | null> {
  const db = await database(demo);
  const result = await new Promise<Project | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result as Project | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result ?? null;
}

export async function clearProject(demo = false): Promise<void> {
  const db = await database(demo);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete('current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
