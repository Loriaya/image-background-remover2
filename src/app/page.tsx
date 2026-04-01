'use client';

import { useState, useCallback, useRef } from 'react';
import UploadZone from '@/components/UploadZone';
import ImagePreview from '@/components/ImagePreview';
import ProcessingState from '@/components/ProcessingState';
import { removeBackground } from '@/lib/remove-bg';

type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface ProcessingResult {
  resultUrl: string;
  originalSize: number;
  processedSize: number;
  processingTime: number;
}

interface ErrorInfo {
  code: string;
  message: string;
}

// API key will be injected at build time via environment variable
const API_KEY = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || '';

export default function Home() {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus('uploading');
    setError(null);
    setResult(null);
    setOriginalFile(file);

    // Create URL for original image preview
    const originalImageUrl = URL.createObjectURL(file);
    setOriginalUrl(originalImageUrl);

    setStatus('processing');

    try {
      // Set API key globally for the removeBg function
      (window as { REMOVE_BG_API_KEY?: string }).REMOVE_BG_API_KEY = API_KEY;

      const response = await removeBackground(file);

      if (response.success) {
        setResult(response.data);
        setStatus('done');
      } else {
        setError(response.error);
        setStatus('error');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError({
        code: 'PROCESSING_FAILED',
        message: 'Processing failed, please try again',
      });
      setStatus('error');
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setOriginalFile(null);
    setOriginalUrl('');
    setResult(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    setStatus('idle');
    setOriginalFile(null);
    setOriginalUrl('');
    setResult(null);
    setError(null);
  }, [originalUrl]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦐</span>
            <span className="font-bold text-xl">ImageBG</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              How it works
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              FAQ
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Remove Image Background in 5 Seconds
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Simple · Fast · Free · No Sign-up Required
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {status === 'idle' && (
            <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
          )}

          {(status === 'uploading' || status === 'processing') && (
            <>
              <UploadZone onFileSelect={handleFileSelect} isProcessing={true} />
              <ProcessingState onCancel={handleCancel} />
            </>
          )}

          {status === 'done' && result && originalFile && (
            <div className="space-y-6">
              <ImagePreview
                originalUrl={originalUrl}
                resultUrl={result.resultUrl}
                originalFileName={originalFile.name}
              />
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Process another image →
                </button>
              </div>
            </div>
          )}

          {status === 'error' && error && (
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                  ⚠️ {error.message}
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Upload again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="max-w-2xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-medium text-gray-900 dark:text-white">5 Seconds</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered detection</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-medium text-gray-900 dark:text-white">Secure & Private</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Images never stored</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">💯</div>
            <h3 className="font-medium text-gray-900 dark:text-white">High Quality</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Preserves original quality</p>
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="py-12 px-4 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Before & After
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full" />
                  <div className="absolute inset-0 bg-green-500 -bottom-4 -right-4 rounded-lg" />
                </div>
              </div>
              <p className="text-center mt-4 text-gray-500 dark:text-gray-400">Original</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full shadow-lg" />
              </div>
              <p className="text-center mt-4 text-gray-500 dark:text-gray-400">Background Removed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2026 ImageBG. All rights reserved. Made with 🦐</p>
      </footer>
    </main>
  );
}
