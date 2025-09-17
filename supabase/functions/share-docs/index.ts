// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePath(urlOrPath: string) {
  if (!urlOrPath) return urlOrPath;
  if (urlOrPath.startsWith('http')) {
    const pubMarker = '/object/public/documents/';
    const pubIdx = urlOrPath.indexOf(pubMarker);
    if (pubIdx !== -1) return urlOrPath.slice(pubIdx + pubMarker.length);
    const anyIdx = urlOrPath.indexOf('/documents/');
    if (anyIdx !== -1) return urlOrPath.slice(anyIdx + '/documents/'.length);
  }
  return urlOrPath.replace(/^\/+/, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { uid, pin } = await req.json();
    if (!uid || !pin) {
      return new Response(JSON.stringify({ error: 'uid and pin are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Compute SHA-256 hash of provided PIN
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
    const pinHashHex = toHex(hash);

    // Fetch profile
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('pin_hash')
      .eq('user_id', uid)
      .maybeSingle();

    if (profileErr) throw profileErr;

    let valid = false;

    if (profile?.pin_hash) {
      valid = profile.pin_hash === pinHashHex;
    } else {
      // Fallback to user_metadata.pin if pin_hash not set
      const { data: userData, error: userErr } = await admin.auth.admin.getUserById(uid);
      if (userErr) throw userErr;
      const metaPin = (userData?.user?.user_metadata as any)?.pin;
      valid = !!metaPin && String(metaPin) === String(pin);
    }

    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid PIN' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Load user's documents
    const { data: docs, error: docsErr } = await admin
      .from('documents')
      .select('id, document_name, document_type, file_url, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (docsErr) throw docsErr;

    const results: any[] = [];

    for (const d of docs || []) {
      const path = normalizePath(d.file_url || '');
      if (!path) continue;
      const { data: signed, error: signErr } = await admin.storage
        .from('documents')
        .createSignedUrl(path, 60 * 10);
      if (signErr) continue;
      results.push({
        id: d.id,
        document_name: d.document_name,
        document_type: d.document_type,
        created_at: d.created_at,
        signed_url: signed?.signedUrl,
      });
    }

    return new Response(JSON.stringify({ documents: results }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
