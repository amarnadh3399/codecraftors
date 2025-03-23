
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const requestData = await req.json();
    const { eventData, images } = requestData;

    // Convert Date objects to ISO strings for PostgreSQL
    if (eventData.date && typeof eventData.date !== 'string') {
      eventData.date = eventData.date.toISOString();
    }
    if (eventData.created_at && typeof eventData.created_at !== 'string') {
      eventData.created_at = eventData.created_at.toISOString();
    }
    if (eventData.updated_at && typeof eventData.updated_at !== 'string') {
      eventData.updated_at = eventData.updated_at.toISOString();
    }

    // Create the event
    const { data: newEvent, error: eventError } = await supabase
      .from("events")
      .insert(eventData)
      .select("id")
      .single();

    if (eventError) {
      throw new Error(`Error creating event: ${eventError.message}`);
    }

    if (!newEvent?.id) {
      throw new Error("Failed to create event");
    }

    // Process images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((image: any) => ({
        event_id: newEvent.id,
        image_url: image.url,
        is_primary: image.isPrimary || false,
      }));

      const { error: imagesError } = await supabase
        .from("event_images")
        .insert(imageInserts);

      if (imagesError) {
        throw new Error(`Error saving event images: ${imagesError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Event created successfully", 
        eventId: newEvent.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An error occurred creating the event" 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
