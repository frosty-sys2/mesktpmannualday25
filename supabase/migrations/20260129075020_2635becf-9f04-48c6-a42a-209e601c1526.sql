-- Create table for AI model configuration
CREATE TABLE public.ai_model_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id text NOT NULL UNIQUE,
  display_name text NOT NULL,
  provider text NOT NULL, -- 'lovable' or 'groq'
  is_enabled boolean NOT NULL DEFAULT true,
  priority_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for Groq API keys
CREATE TABLE public.groq_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_masked text NOT NULL, -- Store only masked version for display
  api_key_encrypted text NOT NULL, -- Full key for use
  priority_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for AI selection mode
-- Will store in site_settings with key 'ai_config'

-- Enable RLS
ALTER TABLE public.ai_model_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groq_api_keys ENABLE ROW LEVEL SECURITY;

-- Policies for ai_model_config
CREATE POLICY "Admins can manage AI model config" 
ON public.ai_model_config 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view AI model config" 
ON public.ai_model_config 
FOR SELECT 
USING (true);

-- Policies for groq_api_keys
CREATE POLICY "Admins can manage Groq API keys" 
ON public.groq_api_keys 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default AI models
INSERT INTO public.ai_model_config (model_id, display_name, provider, priority_order, is_enabled) VALUES
('google/gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite (Lovable)', 'lovable', 1, true),
('gpt-oss-120b', 'GPT OSS 120B', 'groq', 2, true),
('gpt-oss-20b', 'GPT OSS 20B', 'groq', 3, true),
('kimi-k2', 'Kimi K2', 'groq', 4, true),
('llama-4-scout-17b-16e-instruct', 'Llama 4 Scout', 'groq', 5, true),
('llama-3.3-70b-versatile', 'Llama 3.3 70B', 'groq', 6, true);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_model_config_updated_at
BEFORE UPDATE ON public.ai_model_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();