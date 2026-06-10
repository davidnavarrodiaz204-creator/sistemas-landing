import type { QueueItem, QueueChannel, QueueItemStatus } from './automationTypes';

const STORAGE_KEY = 'factusys_automation_queue_pro_v1';

function loadFromStorage(): QueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: QueueItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createQueueItem(
  prospectId: string,
  channel: QueueChannel,
  message: string,
): QueueItem {
  return {
    id: `queue-pro-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    prospectId,
    channel,
    message,
    scheduledAt: new Date().toISOString(),
    sentAt: null,
    error: null,
    attempts: 0,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
}

export function addToQueue(item: QueueItem): QueueItem[] {
  const current = loadFromStorage();
  const updated = [item, ...current];
  saveToStorage(updated);
  return updated;
}

export function addBatchToQueue(items: QueueItem[]): QueueItem[] {
  const current = loadFromStorage();
  const updated = [...items, ...current];
  saveToStorage(updated);
  return updated;
}

export function getQueue(): QueueItem[] {
  return loadFromStorage();
}

export function getQueueByChannel(channel: QueueChannel): QueueItem[] {
  return loadFromStorage().filter((item) => item.channel === channel);
}

export function getPendingQueue(): QueueItem[] {
  return loadFromStorage().filter(
    (item) => item.status === 'pending' || item.status === 'approved',
  );
}

export function getApprovedQueue(): QueueItem[] {
  return loadFromStorage().filter((item) => item.status === 'approved');
}

export function updateQueueItem(
  id: string,
  patch: Partial<QueueItem>,
): QueueItem[] {
  const current = loadFromStorage();
  const updated = current.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  saveToStorage(updated);
  return updated;
}

export function approveQueueItem(id: string): QueueItem[] {
  return updateQueueItem(id, { status: 'approved' as QueueItemStatus });
}

export function markAsSent(id: string): QueueItem[] {
  const current = loadFromStorage();
  const item = current.find((i) => i.id === id);
  return updateQueueItem(id, {
    status: 'sent' as QueueItemStatus,
    sentAt: new Date().toISOString(),
    attempts: (item?.attempts || 0) + 1,
  });
}

export function markAsSimulated(id: string): QueueItem[] {
  const current = loadFromStorage();
  const item = current.find((i) => i.id === id);
  return updateQueueItem(id, {
    status: 'simulated' as QueueItemStatus,
    sentAt: new Date().toISOString(),
    attempts: (item?.attempts || 0) + 1,
  });
}

export function markAsFailed(id: string, error: string): QueueItem[] {
  const current = loadFromStorage();
  const item = current.find((i) => i.id === id);
  return updateQueueItem(id, {
    status: 'failed' as QueueItemStatus,
    error,
    attempts: (item?.attempts || 0) + 1,
  });
}

export function markAsBlocked(id: string, reason: string): QueueItem[] {
  return updateQueueItem(id, {
    status: 'blocked' as QueueItemStatus,
    error: reason,
  });
}

export function clearQueue(): void {
  saveToStorage([]);
}

export function removeFromQueue(id: string): QueueItem[] {
  const current = loadFromStorage();
  const updated = current.filter((item) => item.id !== id);
  saveToStorage(updated);
  return updated;
}

export function getQueueStats(): {
  total: number;
  pending: number;
  approved: number;
  sent: number;
  failed: number;
  blocked: number;
  simulated: number;
} {
  const items = loadFromStorage();
  return {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    approved: items.filter((i) => i.status === 'approved').length,
    sent: items.filter((i) => i.status === 'sent').length,
    failed: items.filter((i) => i.status === 'failed').length,
    blocked: items.filter((i) => i.status === 'blocked').length,
    simulated: items.filter((i) => i.status === 'simulated').length,
  };
}
