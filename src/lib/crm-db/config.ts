import { query } from '@/lib/crm-db/db';

export async function getResponseMode(): Promise<string> {
  try {
    const result = await query('SELECT value FROM crm_config WHERE key = $1', ['response_mode']);
    if (result?.rows?.length) return result.rows[0].value;
  } catch { /* fall through */ }
  return 'copiloto';
}

export async function setResponseMode(mode: string) {
  await query(
    'INSERT INTO crm_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
    ['response_mode', mode],
  );
}

export async function getDailyAutoResponseCount(): Promise<number> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const result = await query(
      `SELECT COUNT(*) as count FROM crm_inbox_messages m
       JOIN crm_inbox_threads t ON t.id = m.thread_id
       WHERE m.direction = 'OUTBOUND'
       AND m.sent_at IS NOT NULL
       AND m.created_at::date = $1::date`,
      [today],
    );
    if (result?.rows?.length) return Number(result.rows[0].count) || 0;
  } catch { /* fall through */ }
  return 0;
}

export async function incrementDailyAutoResponseCount() {
  // The count is computed from actual sent messages; no manual counter needed.
}
