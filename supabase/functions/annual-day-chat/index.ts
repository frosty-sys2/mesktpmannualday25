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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch dynamic data from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
