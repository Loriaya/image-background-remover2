import { NextRequest, NextResponse } from 'next/server';

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_FORMAT: '请上传 JPG、PNG 或 WebP 格式',
  FILE_TOO_LARGE: '文件大小请控制在10MB以内',
  PROCESSING_FAILED: '处理失败，请稍后重试',
  API_ERROR: '服务繁忙，请稍后重试',
  TIMEOUT: '网络超时，请重试',
  NO_API_KEY: 'API Key 未配置',
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || '处理失败，请稍后重试';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: getErrorMessage('INVALID_FORMAT'),
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: getErrorMessage('INVALID_FORMAT'),
          },
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: getErrorMessage('FILE_TOO_LARGE'),
          },
        },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_API_KEY',
            message: getErrorMessage('NO_API_KEY'),
          },
        },
        { status: 500 }
      );
    }

    const startTime = Date.now();

    // Create form data for remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');
    removeBgFormData.append('format', 'png');

    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      console.error('Remove.bg API error:', response.status, await response.text());
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'API_ERROR',
            message: getErrorMessage('API_ERROR'),
          },
        },
        { status: 500 }
      );
    }

    const blob = await response.blob();
    const resultUrl = `data:image/png;base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;

    return NextResponse.json({
      success: true,
      data: {
        resultUrl,
        originalSize: imageFile.size,
        processedSize: blob.size,
        processingTime,
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: getErrorMessage('PROCESSING_FAILED'),
        },
      },
      { status: 500 }
    );
  }
}
