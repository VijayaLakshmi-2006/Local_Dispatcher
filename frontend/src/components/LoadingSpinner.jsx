import React from 'react';

export default function LoadingSpinner({ fullPage, message }) {
  const content = (
    <div class="flex flex-col items-center justify-center">
      <div class="w-10 h-10 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      {message && (
        <p class="mt-3 text-xs font-semibold text-gray-500 animate-pulse uppercase tracking-wider">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div class="py-12 flex justify-center w-full">{content}</div>;
}
