export type InboxThread = {
  id: string;
  prospect_id: string | null;
  channel: string;
  external_thread_id: string;
  contact_name: string;
  contact_handle: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  business_name?: string;
  rubro?: string;
  phone?: string;
  lastMessage?: string;
  lastIntent?: string;
  lastSuggestedReply?: string;
};

export type InboxMessage = {
  id: string;
  thread_id: string;
  direction: string;
  body: string;
  intent: string;
  suggested_reply: string;
  approved_at: string | null;
  sent_at: string | null;
  created_at: string;
};
