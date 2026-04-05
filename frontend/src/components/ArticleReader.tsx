"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsInteger, parseAsBoolean } from 'nuqs';
import { AudioPlayer } from './AudioPlayer';
import { ArticleReaderUI } from '../stateless_ui/ArticleReaderUI';

export interface ArticleData {
  id: string;
  json: any[][][]; // From out.json structure
  nextArticleId?: string | null;
  allArticleIds: string[];
  currentIndex: number;
}

function computeAutoRepeat(totalLessons: number): number[] {
  if (totalLessons === 0) return [];
  const dayIndex = Math.floor(Date.now() / 86400000);
  const start = dayIndex % totalLessons;
  const count = Math.min(3, totalLessons);
  return Array.from({ length: count }, (_, i) => (start + i) % totalLessons);
}

export function ArticleReader(props: { data: ArticleData }) {
  const router = useRouter();
  const [auto] = useQueryState('auto', parseAsBoolean);
  const [speed, setSpeed] = useQueryState('speed', parseAsInteger.withDefault(100));
  const sentences = props.data.json[0] || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isAuto = auto === true;
  const total = props.data.allArticleIds.length;
  const [repeat, setRepeat] = useState<number[]>(() =>
    isAuto ? computeAutoRepeat(total) : []
  );

  const { totalChars, charAccumulators } = useMemo(() => {
    let total = 0;
    const accumulators: number[] = [];
    sentences.forEach((s) => {
      accumulators.push(total);
      const enTextLength = String(s[0]).length;
      total += enTextLength;
    });
    accumulators.push(total);
    return { totalChars: total, charAccumulators: accumulators };
  }, [sentences]);

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (!duration || duration === 0 || totalChars === 0) return;

    const estimatedCharPosition = (currentTime / duration) * totalChars;

    let newIndex = 0;
    for (let i = 0; i < charAccumulators.length - 1; i++) {
      if (estimatedCharPosition >= charAccumulators[i]) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      const targetElement = sentenceRefs.current[newIndex];
      if (targetElement && scrollContainerRef.current) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (isAuto) params.set('auto', 'true');
    if (speed !== 100) params.set('speed', String(speed));
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const handleAudioEnded = () => {
    if (repeat.length > 0) {
      const currentPos = repeat.indexOf(props.data.currentIndex);
      const nextPos = (currentPos + 1) % repeat.length;
      const nextLessonIndex = repeat[nextPos];
      const nextId = props.data.allArticleIds[nextLessonIndex];
      if (nextId) {
        router.push(`/article/${nextId}${buildQuery()}`);
      }
    } else if (props.data.nextArticleId) {
      router.push(`/article/${props.data.nextArticleId}${buildQuery()}`);
    }
  };

  const handleSkipBack = () => {
    if (repeat.length > 0) {
      const currentPos = repeat.indexOf(props.data.currentIndex);
      const prevPos = (currentPos - 1 + repeat.length) % repeat.length;
      const prevLessonIndex = repeat[prevPos];
      const prevId = props.data.allArticleIds[prevLessonIndex];
      if (prevId) {
        router.push(`/article/${prevId}${buildQuery()}`);
      }
    } else if (props.data.currentIndex > 0) {
      const prevId = props.data.allArticleIds[props.data.currentIndex - 1];
      router.push(`/article/${prevId}${buildQuery()}`);
    }
  };

  const handleToggleRepeat = () => {
    if (repeat.length > 0) {
      setRepeat([]);
    } else {
      setRepeat([props.data.currentIndex]);
    }
  };

  const handleSpeedChange = (rate: number) => {
    setSpeed(Math.round(rate * 100));
  };

  const titleStr = props.data.id.replace(/^[0-9]+_/, '').replace(/-/g, ' ');

  return (
    <ArticleReaderUI
      titleStr={titleStr}
      dateStr={props.data.id.split('_')[0]}
      sentences={sentences}
      activeIndex={activeIndex}
      containerRef={scrollContainerRef}
      registerSentenceRef={(idx, el) => { sentenceRefs.current[idx] = el; }}
      audioPlayerSlot={
        <AudioPlayer
          src={`${process.env.NEXT_PUBLIC_PREFIX || ''}/${props.data.id}/out.mp3`}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onSkipBack={handleSkipBack}
          onBack={() => router.push('/')}
          autoPlay={true}
          isRepeat={repeat.length > 0}
          onToggleRepeat={handleToggleRepeat}
          playbackRate={speed / 100}
          onSpeedChange={handleSpeedChange}
        />
      }
    />
  );
}
