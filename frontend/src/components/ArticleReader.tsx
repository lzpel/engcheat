"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AudioPlayer } from './AudioPlayer';

export interface ArticleData {
  id: string;
  json: any[][][]; // From out.json structure
  nextArticleId?: string | null;
}

export function ArticleReader(props: { data: ArticleData }) {
  const router = useRouter();
  const sentences = props.data.json[0] || []; // Section 0: the article body
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate character accumulation for approximate timing
  const { totalChars, charAccumulators } = useMemo(() => {
    let total = 0;
    const accumulators: number[] = [];
    sentences.forEach((s) => {
      accumulators.push(total);
      const enTextLength = String(s[0]).length;
      total += enTextLength;
    });
    // push final bound
    accumulators.push(total);
    return { totalChars: total, charAccumulators: accumulators };
  }, [sentences]);

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (!duration || duration === 0 || totalChars === 0) return;
    
    const estimatedCharPosition = (currentTime / duration) * totalChars;
    
    // Find active index
    let newIndex = 0;
    for (let i = 0; i < charAccumulators.length - 1; i++) {
        if (estimatedCharPosition >= charAccumulators[i]) {
            newIndex = i;
        } else {
            break; // We found the upper bound
        }
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      // Auto-scroll
      const targetElement = sentenceRefs.current[newIndex];
      if (targetElement && scrollContainerRef.current) {
        // smooth scroll into view, centering the item relative to the container
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
      }
    }
  };

  const handleAudioEnded = () => {
    if (props.data.nextArticleId) {
      router.push(`/article/${props.data.nextArticleId}`);
    }
  };

  // Determine standard title from ID
  const titleStr = props.data.id.replace(/^[0-9]+_/, '').replace(/-/g, ' ');

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col h-dvh">
      <div className="flex-1 min-h-0 flex flex-row gap-4 py-4">
        
        {/* Left Sidebar Fixed Player */}
        <div className="w-20 flex-shrink-0">
          <AudioPlayer 
            src={`${process.env.NEXT_PUBLIC_PREFIX || ''}/${props.data.id}/out.mp3`}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            onBack={() => router.push('/')}
            autoPlay={true}
          />
        </div>

        {/* Right Side Scrollable text content */}
        <div className="flex-1 min-w-0 flex flex-col bg-background-paper rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 capitalize leading-tight">
              {titleStr}
            </h1>
            <p className="text-sm text-gray-500 mt-2">{props.data.id.split('_')[0]}</p>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth" 
            ref={scrollContainerRef}
          >
            <div className="space-y-6 pb-32">
              {sentences.map((pair, idx) => {
                const enText = pair[0];
                const jaText = pair[1];
                if (!enText?.trim() && !jaText?.trim()) return null; // skip empty lines

                const isActive = idx === activeIndex;
                return (
                  <div 
                    key={idx}
                    ref={(el) => { sentenceRefs.current[idx] = el; }}
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      isActive ? "bg-primary-main/10 border-l-4 border-primary-main" : "border-l-4 border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <p className={`text-lg font-medium leading-relaxed ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                      {enText}
                    </p>
                    {jaText && (
                      <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                        {jaText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
