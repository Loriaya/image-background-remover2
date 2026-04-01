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
  imageFile: File,
  apiKey: string
): Promise<RemoveBgResult | RemoveBgError> {
  const startTime = Date.now();
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('size', 'auto');
  formData.append('format', 'png');

  try {
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
