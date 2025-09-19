// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

const htmlPage = (uid: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Virtual Setu - Secure Document Access</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 mt-12">
    <div class="text-center mb-6">
      <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Secure Document Access</h1>
      <p class="text-gray-600">Enter your PIN to view documents</p>
    </div>
    
    <div id="pin-form">
      <input type="password" id="pin" placeholder="Enter 4-digit PIN" maxlength="6" 
             class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center text-lg" 
             inputmode="numeric">
      <button onclick="unlock()" id="unlock-btn" 
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Unlock Documents
      </button>
    </div>
    
    <div id="documents" class="hidden">
      <div class="text-center mb-4">
        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-800">Documents Unlocked</h2>
      </div>
      <div id="doc-list"></div>
    </div>
    
    <div id="error" class="hidden text-red-600 text-center mt-4"></div>
  </div>

  <script>
    const uid = "${uid}";
    
    document.getElementById('pin').addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    document.getElementById('pin').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') unlock();
    });
    
    async function unlock() {
      const pin = document.getElementById('pin').value;
      const btn = document.getElementById('unlock-btn');
      const error = document.getElementById('error');
      
      if (!pin || pin.length < 4) {
        showError('Enter your 4-digit PIN');
        return;
      }
      
      btn.textContent = 'Unlocking...';
      btn.disabled = true;
      error.classList.add('hidden');
      
      try {
        const res = await fetch(window.location.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, pin })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Invalid PIN');
        }
        
        showDocuments(data.documents || []);
      } catch (e) {
        showError(e.message || 'Failed to unlock documents');
        btn.textContent = 'Unlock Documents';
        btn.disabled = false;
      }
    }
    
    function showError(msg) {
      const error = document.getElementById('error');
      error.textContent = msg;
      error.classList.remove('hidden');
    }
    
    function showDocuments(docs) {
      document.getElementById('pin-form').classList.add('hidden');
      document.getElementById('documents').classList.remove('hidden');
      
      const list = document.getElementById('doc-list');
      if (docs.length === 0) {
        list.innerHTML = '<p class="text-gray-500 text-center">No documents found</p>';
        return;
      }
      
      list.innerHTML = docs.map(doc => \`
        <div class="border border-gray-200 rounded-lg p-3 mb-3">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-800 truncate">\${doc.document_name}</h3>
              <p class="text-sm text-gray-500 capitalize">\${doc.document_type}</p>
            </div>
            <div class="flex space-x-2 ml-3">
              <button onclick="window.open('\${doc.signed_url}', '_blank')" 
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <button onclick="downloadDoc('\${doc.signed_url}', '\${doc.document_name}')" 
                      class="p-2 text-green-600 hover:bg-green-50 rounded">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      \`).join('');
    }
    
    function downloadDoc(url, name) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  </script>
</body>
</html>
`;

serve(async (req) => {
  console.log('Share-docs function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  
  console.log('UID parameter:', uid);

  // GET request - show HTML page
  if (req.method === 'GET' && uid) {
    console.log('Serving HTML page for UID:', uid);
    const html = htmlPage(uid);
    console.log('HTML length:', html.length);
    
    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  // POST request - handle PIN verification
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { uid: bodyUid, pin } = await req.json();
    const targetUid = bodyUid || uid;
    
    if (!targetUid || !pin) {
      return new Response(JSON.stringify({ error: 'uid and pin are required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Compute SHA-256 hash of provided PIN
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
    const pinHashHex = toHex(hash);

    // Fetch profile
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('pin_hash')
      .eq('user_id', targetUid)
      .maybeSingle();

    if (profileErr) throw profileErr;

    let valid = false;

    if (profile?.pin_hash) {
      valid = profile.pin_hash === pinHashHex;
    } else {
      // Fallback to user_metadata.pin if pin_hash not set
      const { data: userData, error: userErr } = await admin.auth.admin.getUserById(targetUid);
      if (userErr) throw userErr;
      const metaPin = (userData?.user?.user_metadata as any)?.pin;
      valid = !!metaPin && String(metaPin) === String(pin);
    }

    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid PIN' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Load user's documents
    const { data: docs, error: docsErr } = await admin
      .from('documents')
      .select('id, document_name, document_type, file_url, created_at')
      .eq('user_id', targetUid)
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

    return new Response(JSON.stringify({ documents: results }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
