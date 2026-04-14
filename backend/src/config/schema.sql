-- AOA MVP — Database Schema
-- Run this in the Supabase SQL editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Businesses table
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  services TEXT[] DEFAULT '{}',
  service_area TEXT,
  business_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
  ai_prompt_context TEXT,
  solana_wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'voice')),
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'qualifying', 'qualified', 'deposit_sent',
    'deposit_paid', 'job_scheduled', 'job_complete', 'lost'
  )),
  contact_name TEXT,
  contact_phone TEXT,
  service_needed TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  problem_description TEXT,
  preferred_schedule TEXT,
  location TEXT,
  conversation_summary TEXT,
  raw_messages JSONB DEFAULT '[]',
  deposit_amount_usdc DECIMAL(10,2),
  solana_pay_url TEXT,
  solana_tx_signature TEXT,
  deposit_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  qualified_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('prospect', 'assistant')),
  content TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'voice')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(contact_phone);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_messages_lead ON messages(lead_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Enable Realtime for leads and messages
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Seed demo business
INSERT INTO businesses (id, name, slug, services, service_area, business_hours, ai_prompt_context)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ClimaTech Refrigeração',
  'climatech',
  ARRAY[
    'Instalação de ar-condicionado',
    'Manutenção preventiva',
    'Limpeza de filtros',
    'Conserto de ar-condicionado',
    'Instalação de câmara fria'
  ],
  'São Paulo — Zona Sul e Centro',
  '{"start": "08:00", "end": "18:00"}'::jsonb,
  'ClimaTech Refrigeração é uma empresa familiar com 8 anos de experiência em ar-condicionado residencial e comercial na zona sul de São Paulo. Trabalhamos com todas as marcas. Visita técnica custa R$150, descontada do serviço. Instalação de split a partir de R$800. Manutenção preventiva R$250. Atendemos emergências 24h com taxa adicional de R$200.'
);
