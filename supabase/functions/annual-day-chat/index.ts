import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHOOL_KNOWLEDGE = `You are CyberDoom Agentic Ver.2 Absolete Beta, an AI assistant for MES Campus School Kuttippuram's Annual Day celebration.

ABOUT MES CAMPUS SCHOOL:
MES Campus School, Kuttippuram is a premier educational institution under the Muslim Educational Society, committed to providing quality education that combines academic excellence with character building. Our school nurtures young minds to become responsible citizens who contribute positively to society.

Like all other MES institutions, MES College of Engineering Campus School shares the noble mission of developing and moulding the young with the firm faith that we need to cultivate people for our vision is eternity. With this objective, MES Kuttippuram unit started the Kindergarten classes in 1991 at Chembikal, 3 km west of Kuttippuram. As the site was inconvenient and accommodation was insufficient, the very next year the school was shifted to a rented building at South Bazaar Kuttippuram.

VISION: Moulding an ideal generation with academic excellence who believes in the values of morality, respect and responsibility.

MISSION: To educate, prepare and inspire the students to achieve their full potential as life long learners, thinkers and productive citizens of progressive world.

VALUES: To educate, prepare and inspire the students to achieve their full potential as life long learners, thinkers and productive citizens of progressive world.

WHAT MAKES US SPECIAL:
1. Academic Excellence - Nurturing young minds with quality education and holistic development.
2. House System - Building teamwork and healthy competition through our vibrant house system.
3. Co-Curricular Activities - Comprehensive CCA programs to develop well-rounded personalities.
4. Kalotsav - Our annual arts festival celebrating creativity and cultural heritage.

With a focus on holistic development, we offer a comprehensive curriculum complemented by various co-curricular activities, sports, and cultural programs. Our dedicated faculty and modern facilities create an ideal learning environment for students to thrive and excel.

EXPLORE OUR SCHOOL:
- Results: View competition results
- Houses: Our house system
- CCA: Co-curricular activities
- Kalotsav: Arts festival

You have access to the programme schedule, media gallery, and quick links for the Annual Day celebration. When users ask about event details, schedules, or media, use the provided context data.

Be helpful, friendly, and informative. Keep responses concise but thorough. If you don't know something specific, say so politely.`;

interface AIModel {
  model_id: string;
  display_name: string;
  provider: 'lovable' | 'groq';
  is_enabled: boolean;
  priority_order: number;
}

interface GroqApiKey {
  api_key_encrypted: string;
  priority_order: number;
  is_enabled: boolean;
}

interface AIConfig {
  models: AIModel[];
  groqApiKeys: GroqApiKey[];
  apiKeySelectionMode: 'ordered' | 'random';
}

async function callLovableAI(messages: any[], systemPrompt: string): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    }),
  });

  return response;
}

async function callGroqAI(
  messages: any[], 
  systemPrompt: string, 
  modelId: string, 
  apiKey: string
): Promise<Response> {
  console.log(`Calling Groq API with model: ${modelId}`);
  
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    }),
  });

  return response;
}

function selectApiKey(keys: GroqApiKey[], mode: 'ordered' | 'random'): GroqApiKey | null {
  const enabledKeys = keys.filter(k => k.is_enabled);
  if (enabledKeys.length === 0) return null;

  if (mode === 'random') {
    const randomIndex = Math.floor(Math.random() * enabledKeys.length);
    return enabledKeys[randomIndex];
  }

  // Ordered mode - return first enabled key
  return enabledKeys.sort((a, b) => a.priority_order - b.priority_order)[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Fetch dynamic data from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get AI configuration
    const { data: aiConfigData } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "ai_config")
      .maybeSingle();

    const aiConfig: AIConfig = aiConfigData?.value || {
      models: [{ model_id: 'google/gemini-2.5-flash-lite', provider: 'lovable', is_enabled: true, priority_order: 1 }],
      groqApiKeys: [],
      apiKeySelectionMode: 'ordered',
    };

    // Get programme schedule
    const { data: schedules } = await supabase
      .from("programme_schedule")
      .select("*")
      .order("display_order");

    // Get quick links
    const { data: links } = await supabase
      .from("quick_links")
      .select("*")
      .order("display_order");

    // Get media items
    const { data: media } = await supabase
      .from("media_gallery")
      .select("*")
      .order("display_order")
      .limit(20);

    // Build dynamic context
    let dynamicContext = "\n\nCURRENT ANNUAL DAY DATA:\n";
    
    if (schedules && schedules.length > 0) {
      dynamicContext += "\nPROGRAMME SCHEDULE:\n";
      schedules.forEach((schedule: any) => {
        dynamicContext += `\n${schedule.title}:\n`;
        const headers = schedule.column_headers as string[];
        const rows = schedule.table_data as string[][];
        if (headers && rows) {
          dynamicContext += `Columns: ${headers.join(", ")}\n`;
          rows.forEach((row: string[], idx: number) => {
            dynamicContext += `Row ${idx + 1}: ${row.join(" | ")}\n`;
          });
        }
      });
    }

    if (links && links.length > 0) {
      dynamicContext += "\nQUICK LINKS:\n";
      links.forEach((link: any) => {
        dynamicContext += `- ${link.title}: ${link.url}\n`;
      });
    }

    if (media && media.length > 0) {
      dynamicContext += "\nMEDIA GALLERY:\n";
      dynamicContext += `Total items: ${media.length}\n`;
      media.forEach((item: any) => {
        if (item.title) {
          dynamicContext += `- ${item.title} (${item.media_type})${item.description ? ': ' + item.description : ''}\n`;
        }
      });
    }

    const systemPrompt = SCHOOL_KNOWLEDGE + dynamicContext;

    // Get enabled models sorted by priority
    const enabledModels = (aiConfig.models || [])
      .filter(m => m.is_enabled)
      .sort((a, b) => a.priority_order - b.priority_order);

    if (enabledModels.length === 0) {
      return new Response(JSON.stringify({ error: "No AI models are enabled" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try each model in order until one succeeds
    let lastError: Error | null = null;
    
    for (const model of enabledModels) {
      try {
        console.log(`Trying model: ${model.model_id} (${model.provider})`);
        
        let response: Response;
        
        if (model.provider === 'lovable') {
          response = await callLovableAI(messages, systemPrompt);
        } else {
          // Groq model - need API key
          const selectedKey = selectApiKey(aiConfig.groqApiKeys || [], aiConfig.apiKeySelectionMode);
          
          if (!selectedKey) {
            console.log('No Groq API keys available, skipping Groq model');
            continue;
          }
          
          response = await callGroqAI(messages, systemPrompt, model.model_id, selectedKey.api_key_encrypted);
        }

        if (response.ok) {
          console.log(`Model ${model.model_id} succeeded`);
          return new Response(response.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }

        // Handle specific error codes
        if (response.status === 429) {
          console.log(`Model ${model.model_id} rate limited, trying next...`);
          continue;
        }
        if (response.status === 402) {
          console.log(`Model ${model.model_id} payment required, trying next...`);
          continue;
        }

        const errorText = await response.text();
        console.error(`Model ${model.model_id} failed:`, response.status, errorText);
        lastError = new Error(`${model.model_id}: ${errorText}`);
        
      } catch (error) {
        console.error(`Error with model ${model.model_id}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    // All models failed
    return new Response(JSON.stringify({ 
      error: lastError?.message || "All AI models failed. Please try again later." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
