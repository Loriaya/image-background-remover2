const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export interface RemoveBgResult {
  success: true;
  data: {
    resultUrl: string;
    originalSize: number;
    processedSize: number;
    processingTime: number;
  };
}

export interface RemoveBgError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export async function removeBackground(
  imageFile: File
): Promise<RemoveBgResult | RemoveBgError> {
  const startTime = Date.now();

  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'Please upload JPG, PNG or WebP format',
        },
      };
    }

    // Validate file size (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size must be under 10MB',
        },
      };
    }

    // For client-side calls, we need to use a CORS proxy or direct call
    // Remove.bg supports direct browser calls with proper error handling
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');
    formData.append('format', 'png');

    // Note: This requires Remove.bg API key to be exposed in client
    // For production, use a backend proxy to protect the API key
    const apiKey = (window as { REMOVE_BG_API_KEY?: string }).REMOVE_BG_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'NO_API_KEY',
          message: 'API key not configured',
        },
      };
    }

    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: errorData.errors?.[0]?.code || 'API_ERROR',
          message: errorData.errors?.[0]?.title || 'Remove.bg API error',
        },
      };
    }

    const blob = await response.blob();
    const resultUrl = URL.createObjectURL(blob);

    return {
      success: true,
      data: {
        resultUrl,
        originalSize: imageFile.size,
        processedSize: blob.size,
        processingTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error, please try again',
      },
    };
  }
}
