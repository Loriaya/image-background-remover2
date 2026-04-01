const API_URL = '/api/remove-bg';

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

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: errorData.error?.code || 'API_ERROR',
          message: errorData.error?.message || 'Remove.bg API error',
        },
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        data: {
          ...data.data,
          processingTime,
        },
      };
    } else {
      return {
        success: false,
        error: data.error,
      };
    }
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
