import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
};

const ADMIN_PASSWORD = "Vasudev@2012";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin password
    const adminPassword = req.headers.get("x-admin-password");
    if (adminPassword !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, table, data, id } = await req.json();

    let result;

    switch (action) {
      case "list":
        const { data: listData, error: listError } = await supabase
          .from(table)
          .select("*")
          .order("display_order", { ascending: true });
        if (listError) throw listError;
        result = listData;
        break;

      case "insert":
        const { data: insertData, error: insertError } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();
        if (insertError) throw insertError;
        result = insertData;
        break;

      case "update":
        const { data: updateData, error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq("id", id)
          .select()
          .single();
        if (updateError) throw updateError;
        result = updateData;
        break;

      case "upsert":
        const { data: upsertData, error: upsertError } = await supabase
          .from(table)
          .upsert(data)
          .select();
        if (upsertError) throw upsertError;
        result = upsertData;
        break;

      case "delete":
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq("id", id);
        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      case "upload":
        // For file uploads, we expect base64 data
        const { bucket, path, fileBase64, contentType } = data;
        const fileData = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, fileData, {
            contentType,
            upsert: true,
          });
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        
        result = { path: uploadData.path, publicUrl: urlData.publicUrl };
        break;

      case "deleteFile":
        const { bucket: delBucket, path: delPath } = data;
        const { error: delFileError } = await supabase.storage
          .from(delBucket)
          .remove([delPath]);
        if (delFileError) throw delFileError;
        result = { success: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Admin operation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
