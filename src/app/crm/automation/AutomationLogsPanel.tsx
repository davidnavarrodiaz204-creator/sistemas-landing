'use client';

import { RotateCcw } from 'lucide-react';
import type { AutomationLog, AutomationLogType } from '@/lib/crm-automation/automationTypes';

const LOG_ICONS: Record<AutomationLogType, string> = {
  prospect_found: '🔍',
  duplicate_detected: '⚠️',
  message_generated: '💬',
  sent: '✅',
  simulated: '🔄',
  error: '❌',
  blocked_limit: '🚫',
  queue_approved: '📋',
  queue_prepared: '📦',
  search_performed: '📡',
};

export function AutomationLogsPanel({
  logs,
  onRefresh,
}: {
  logs: AutomationLog[];
  onRefresh: () => void;
}) {
  return (
    <div className="crm-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="crm-eyebrow mb-2">Registros de actividad</p>
          <h2 className="crm-section-title">Logs de automatización</h2>
        </div>
        <button
          type="button"
          className="crm-button-secondary min-h-0 px-3 py-2 text-xs"
          onClick={onRefresh}
        >
          <RotateCcw size={14} /> Actualizar
        </button>
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {logs.length === 0 && (
          <p className="crm-note text-sm">Sin actividad registrada. Usa la búsqueda automática para empezar.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="crm-mini-card flex items-start gap-3 rounded-xl p-3">
            <span className="mt-0.5 text-base">{LOG_ICONS[log.type] || '📝'}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{log.message}</p>
              <p className="crm-muted text-xs">
                {new Date(log.timestamp).toLocaleString('es-PE')}
                {log.prospectId && ` · ID: ${log.prospectId.slice(0, 12)}...`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
