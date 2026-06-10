import type { AutomationLog, AutomationLogType } from './automationTypes';

const STORAGE_KEY = 'factusys_automation_logs_pro_v1';
const MAX_LOGS = 200;

function loadLogs(): AutomationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: AutomationLog[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
}

export function addLog(
  type: AutomationLogType,
  message: string,
  details?: { prospectId?: string; campaignId?: string; extra?: Record<string, unknown> },
): AutomationLog {
  const log: AutomationLog = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    prospectId: details?.prospectId,
    campaignId: details?.campaignId,
    details: details?.extra,
  };

  const logs = loadLogs();
  logs.unshift(log);
  saveLogs(logs);
  return log;
}

export function getLogs(limit = 50): AutomationLog[] {
  return loadLogs().slice(0, limit);
}

export function getLogsByType(type: AutomationLogType): AutomationLog[] {
  return loadLogs().filter((log) => log.type === type);
}

export function getLogsByProspect(prospectId: string): AutomationLog[] {
  return loadLogs().filter((log) => log.prospectId === prospectId);
}

export function clearLogs(): void {
  saveLogs([]);
}

export function getLogStats(): Record<string, number> {
  const logs = loadLogs();
  const stats: Record<string, number> = {};
  for (const log of logs) {
    stats[log.type] = (stats[log.type] || 0) + 1;
  }
  return stats;
}
