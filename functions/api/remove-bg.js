const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ERROR_MESSAGES = {
    INVALID_FORMAT: 'Please upload JPG, PNG or WebP format',
    FILE_TOO_LARGE: 'File size must be under 10MB',
    NO_API_KEY: 'API key not configured',
    API_ERROR: 'Remove.bg API error',
  };

  try {
    const formData = await context.request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return jsonResponse({ success: false, error: { code: 'INVALID_FORMAT', message: ERROR_MESSAGES.INVALID_FORMAT } }, 400, corsHeaders);
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      return jsonResponse({ success: false, error: { code: 'INVALID_FORMAT', message: ERROR_MESSAGES.INVALID_FORMAT } }, 400, corsHeaders);
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return jsonResponse({ success: false, error: { code: 'FILE_TOO_LARGE', message: ERROR_MESSAGES.FILE_TOO_LARGE } }, 400, corsHeaders);
    }

    const apiKey = context.env?.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return jsonResponse({ success: false, error: { code: 'NO_API_KEY', message: ERROR_MESSAGES.NO_API_KEY } }, 500, corsHeaders);
    }

    const startTime = Date.now();

    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');
    removeBgFormData.append('format', 'png');

    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: removeBgFormData,
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      console.error('Remove.bg API error:', response.status);
      return jsonResponse({ success: false, error: { code: 'API_ERROR', message: ERROR_MESSAGES.API_ERROR } }, 500, corsHeaders);
    }

    const blob = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(blob)));
    const resultUrl = `data:image/png;base64,${base64}`;

    return jsonResponse({
      success: true,
      data: { resultUrl, originalSize: imageFile.size, processedSize: blob.byteLength, processingTime },
    }, 200, corsHeaders);
  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({ success: false, error: { code: 'API_ERROR', message: 'Processing failed' } }, 500, corsHeaders);
  }
}

function jsonResponse(body, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
