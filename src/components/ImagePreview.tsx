'use client';

import { useState, useRef, useEffect } from 'react';

interface ImagePreviewProps {
  originalUrl: string;
  resultUrl: string;
  originalFileName: string;
}

export default function ImagePreview({
  originalUrl,
  resultUrl,
  originalFileName,
}: ImagePreviewProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  const downloadResult = () => {
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `${originalFileName.replace(/\.[^/.]+$/, '')}_no_bg.png`;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      alert('已复制到剪贴板！');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请尝试下载');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Comparison View */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden select-none cursor-ew-resize"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Original Image (Background) */}
        <div className="absolute inset-0">
          <img
            src={originalUrl}
            alt="Original"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Result Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={resultUrl}
            alt="Result"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white dark:bg-gray-200 shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-200 rounded-full shadow-lg flex items-center justify-center text-xl">
            ↔️
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
          原图
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
          无背景
        </div>
      </div>

      {/* Slider Hint */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        👆 拖动滑块对比原图和结果
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={downloadResult}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>⬇️</span>
          <span>下载 PNG</span>
        </button>
        <button
          onClick={copyToClipboard}
          className="w-full sm:w-auto px-8 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>📋</span>
          <span>复制图片</span>
        </button>
      </div>

      <p className="text-center text-green-600 dark:text-green-400 font-medium">
        ✨ 图片已处理完成！直接下载使用
      </p>
    </div>
  );
}
