const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

async function fetchWithFallback(url: string): Promise<string> {
  // Try direct fetch first
  try {
    const resp = await fetch(url, { headers: FETCH_HEADERS });
    if (resp.ok) {
      const text = await resp.text();
      if (text.length > 100) return text;
    }
  } catch (_) { /* fallback */ }

  // Try proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const resp = await fetch(proxy(url), { headers: { 'Accept': 'text/html' } });
      if (resp.ok) {
        const text = await resp.text();
        if (text.length > 100) return text;
      }
    } catch (_) { /* next */ }
  }
  throw new Error('Failed to fetch URL after all attempts');
}

function isViewCandResponse(url: string): boolean {
  return url.toLowerCase().includes('viewcandresponse');
}

function getMultiPartUrls(url: string): string[] {
  const urls = [url];
  // Generate parts 2-5
  for (let i = 2; i <= 5; i++) {
    const partUrl = url.replace(/ViewCandResponse\.aspx/i, `ViewCandResponse${i}.aspx`);
    if (partUrl !== url) urls.push(partUrl);
  }
  return urls;
}

async function fetchMultiPart(url: string): Promise<string> {
  const partUrls = getMultiPartUrls(url);
  const results: string[] = [];

  for (const partUrl of partUrls) {
    try {
      const html = await fetchWithFallback(partUrl);
      if (html && html.length > 200) {
        results.push(html);
      } else {
        break; // No more parts
      }
    } catch (_) {
      break; // No more parts
    }
  }

  if (results.length === 0) throw new Error('Failed to fetch any parts');
  return results.join('\n<!-- PART_SEPARATOR -->\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, html: providedHtml } = await req.json();

    if (!url && !providedHtml) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL or HTML is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let html = providedHtml;

    if (!html && url) {
      // Validate URL
      if (!url.includes('digialm.com') && !url.includes('.html')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Only digialm URLs or .html answer key URLs are supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Fetching URL:', url);

      if (isViewCandResponse(url)) {
        html = await fetchMultiPart(url);
      } else {
        html = await fetchWithFallback(url);
      }
    }

    console.log('Fetched HTML length:', html?.length || 0);

    return new Response(
      JSON.stringify({ success: true, html }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
