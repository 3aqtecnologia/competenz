-- Migration: 053_add_whatsapp_flag.sql
-- Description: Adiciona flag para identificar se o telefone do usuário é WhatsApp
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS is_whatsapp BOOLEAN DEFAULT false;