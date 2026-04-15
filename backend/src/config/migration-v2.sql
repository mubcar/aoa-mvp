-- AOA MVP — Migration v2: Multi-tenant + RLS
-- Run this in the Supabase SQL editor AFTER schema.sql

-- 1. Add owner_id to businesses (links auth user → business)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- 2. Add whatsapp_instance for webhook routing
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_instance TEXT;
CREATE INDEX IF NOT EXISTS idx_businesses_whatsapp_instance ON businesses(whatsapp_instance);
CREATE INDEX IF NOT EXISTS idx_businesses_whatsapp_number ON businesses(whatsapp_number);

-- 3. Add whatsapp_connected status
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT false;

-- 4. Add updated_at to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for businesses
CREATE POLICY "Users can read their own business"
  ON businesses FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own business"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own business"
  ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow service_role (backend) to read all businesses (for webhook routing)
-- service_role bypasses RLS by default, so no policy needed for backend

-- 7. RLS Policies for leads
CREATE POLICY "Users can read leads for their business"
  ON leads FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update leads for their business"
  ON leads FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Service can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- 8. RLS Policies for messages
CREATE POLICY "Users can read messages for their business leads"
  ON messages FOR SELECT
  USING (lead_id IN (
    SELECT l.id FROM leads l
    JOIN businesses b ON l.business_id = b.id
    WHERE b.owner_id = auth.uid()
  ));

CREATE POLICY "Service can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- 9. Keep demo business accessible (update it when a user claims it, or leave for testing)
-- The demo business (id=00000000-...-000000000001) has no owner_id, so it won't show
-- for any user via RLS. This is correct — each user gets their own business.
