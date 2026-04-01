'use client';

import { useEffect, useState } from 'react';

interface ProcessingStateProps {
  onCancel: () => void;
}

export default function ProcessingState({ onCancel }: ProcessingStateProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6 py-8">
      <div className="text-6xl animate-bounce">⚡</div>

      <div className="space-y-2">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-200">
          正在移除背景{dots}
        </p>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        预计剩余 {Math.max(1, Math.ceil((100 - progress) / 30))} 秒
      </p>

      <button
        onClick={onCancel}
        className="px-6 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        取消
      </button>
    </div>
  );
}
