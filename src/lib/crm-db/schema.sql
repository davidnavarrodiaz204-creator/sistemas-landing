CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  rubro TEXT NOT NULL DEFAULT 'Otro',
  ciudad TEXT NOT NULL DEFAULT '',
  zona TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  tiktok_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
  score INTEGER DEFAULT 0,
  temperature TEXT DEFAULT 'FRIO' CHECK (temperature IN ('CALIENTE','TIBIO','FRIO','SIN_DATOS')),
  status TEXT DEFAULT 'NUEVO' CHECK (status IN ('NUEVO','CONTACTADO','RESPONDIO','INTERESADO','DEMO_AGENDADA','DEMO_ACTIVA','INSTALACION','PRODUCCION','NO_CONTACTAR')),
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP','FACEBOOK','INSTAGRAM','EMAIL')),
  message TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'PREPARADO' CHECK (status IN ('PREPARADO','COPIADO','ABIERTO','ENVIADO_MANUAL','RESPONDIO','FALLIDO')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PRIMER_CONTACTO','RECORDATORIO','DEMO','CIERRE','SOPORTE')),
  note TEXT DEFAULT '',
  due_date TIMESTAMPTZ,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL DEFAULT '',
  detail TEXT DEFAULT '',
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_ciudad ON prospects(ciudad);
CREATE INDEX IF NOT EXISTS idx_prospects_rubro ON prospects(rubro);
CREATE INDEX IF NOT EXISTS idx_prospects_phone ON prospects(phone);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON follow_ups(due_date) WHERE done_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_follow_ups_prospect ON follow_ups(prospect_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_prospect ON contact_messages(prospect_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON automation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_next_follow_up ON prospects(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_created ON prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_type ON follow_ups(type);
CREATE INDEX IF NOT EXISTS idx_demos_status ON demos(status);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS workdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  meta_diaria INTEGER DEFAULT 10,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workdays_date ON workdays(date);

CREATE TABLE IF NOT EXISTS demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  product TEXT NOT NULL DEFAULT 'RESTO',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'AGENDADA' CHECK (status IN ('AGENDADA','REALIZADA','CANCELADA','NO_ASISTIO')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_demos_prospect ON demos(prospect_id);
CREATE INDEX IF NOT EXISTS idx_demos_scheduled ON demos(scheduled_at);

CREATE TABLE IF NOT EXISTS installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  product TEXT NOT NULL DEFAULT 'RESTO',
  scheduled_at TIMESTAMPTZ,
  type TEXT NOT NULL DEFAULT 'PRODUCCION' CHECK (type IN ('DEMO','PRODUCCION')),
  needs_printer BOOLEAN DEFAULT false,
  needs_initial_inventory BOOLEAN DEFAULT false,
  equipment_notes TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE','EN_PROCESO','COMPLETADA','CANCELADA')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_installations_prospect ON installations(prospect_id);
CREATE INDEX IF NOT EXISTS idx_installations_scheduled ON installations(scheduled_at);

CREATE TABLE IF NOT EXISTS crm_inbox_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('WHATSAPP','FACEBOOK','INSTAGRAM','EMAIL')),
  external_thread_id TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_handle TEXT DEFAULT '',
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','PENDING','CLOSED')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_prospect ON crm_inbox_threads(prospect_id);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_status ON crm_inbox_threads(status);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_channel ON crm_inbox_threads(channel);
CREATE INDEX IF NOT EXISTS idx_inbox_threads_last_message ON crm_inbox_threads(last_message_at DESC);

CREATE TABLE IF NOT EXISTS crm_inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES crm_inbox_threads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND')),
  body TEXT NOT NULL DEFAULT '',
  intent TEXT DEFAULT '',
  suggested_reply TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread ON crm_inbox_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_created ON crm_inbox_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS crm_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT '';
ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS thread_id TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_automation_logs_channel ON automation_logs(channel);
CREATE INDEX IF NOT EXISTS idx_automation_logs_thread ON automation_logs(thread_id);
