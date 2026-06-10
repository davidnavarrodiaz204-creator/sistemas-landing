import { getDb } from './db';

export async function getResponseMode(): Promise<string> {
  try {
    const db = await getDb();
    const doc = await db.collection('crm_config').findOne({ key: 'response_mode' });
    if (doc?.value) return doc.value;
  } catch { /* fall through */ }
  return 'copiloto';
}

export async function setResponseMode(mode: string) {
  const db = await getDb();
  await db.collection('crm_config').updateOne(
    { key: 'response_mode' },
    { $set: { key: 'response_mode', value: mode, updated_at: new Date().toISOString() } },
    { upsert: true },
  );
}

export async function getDailyAutoResponseCount(): Promise<number> {
  try {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await db.collection('crm_inbox_messages').countDocuments({
      direction: 'OUTBOUND',
      sent_at: { $ne: null },
      created_at: { $gte: today.toISOString(), $lt: tomorrow.toISOString() },
    });
    return count;
  } catch { /* fall through */ }
  return 0;
}

export async function incrementDailyAutoResponseCount() {
  // The count is computed from actual sent messages; no manual counter needed.
}
