'use client';

import React from 'react';

export default function TemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[320px] flex items-start justify-center">
      <div className="w-full">{children}</div>
    </div>
  );
}


