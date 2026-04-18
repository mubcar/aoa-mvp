-- Add notification target to businesses
-- Can be a phone number (5511999999999) or a WhatsApp group JID (120363XXXXX@g.us)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notification_whatsapp TEXT;

-- Index for quick lookup
COMMENT ON COLUMN businesses.notification_whatsapp IS
  'WhatsApp number or group JID to notify when a lead is qualified. '
  'Phone: 5511999999999 — Group: 120363XXXXXX@g.us';
