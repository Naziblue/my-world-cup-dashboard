'use client';

import React, { useState, useEffect } from 'react';
import { getFlagUrl } from '@/utils/flags';

interface FlagCrestProps {
  code: string;
  fallbackEmoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  muted?: boolean;
}

const SIZES = {
  sm: { outer: 28, inner: 22, ring: 1, imgW: 160 },
  md: { outer: 40, inner: 32, ring: 1.5, imgW: 320 },
  lg: { outer: 56, inner: 46, ring: 2, imgW: 320 },
  xl: { outer: 72, inner: 60, ring: 2.5, imgW: 640 },
  xxl: { outer: 108, inner: 92, ring: 3, imgW: 640 },
};

export default function FlagCrest({ code, fallbackEmoji, size = 'md', muted = false }: FlagCrestProps) {
  const s = SIZES[size];
  const flagUrl = getFlagUrl(code, s.imgW);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [flagUrl]);

  return (
    <div
      className="relative shrink-0"
      style={{
        width: s.outer,
        height: s.outer,
        filter: muted
          ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.3)) saturate(0.3) brightness(0.7)'
          : 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: muted
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))',
          padding: s.ring,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            padding: s.ring,
            background: muted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
          }}
        >
          {!hasError && flagUrl ? (
            <img
              src={flagUrl}
              alt={code}
              onError={() => setHasError(true)}
              className="w-full h-full rounded-full object-cover"
              style={{
                backgroundColor: '#334155',
              }}
            />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center select-none"
              style={{
                backgroundColor: '#334155',
                fontSize: s.inner * 0.65,
                lineHeight: 1,
                opacity: muted ? 0.6 : 1,
              }}
            >
              {fallbackEmoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
