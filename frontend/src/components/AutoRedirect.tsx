"use client";

import { useRouter } from 'next/navigation';
import { useQueryState, parseAsBoolean, parseAsInteger } from 'nuqs';
import { useEffect } from 'react';

export function AutoRedirect(props: { allArticleIds: string[] }) {
  const router = useRouter();
  const [auto] = useQueryState('auto', parseAsBoolean);
  const [speed] = useQueryState('speed', parseAsInteger);

  useEffect(() => {
    if (auto !== true || props.allArticleIds.length === 0) return;
    const total = props.allArticleIds.length;
    const dayIndex = Math.floor(Date.now() / 86400000);
    const start = dayIndex % total;
    const firstId = props.allArticleIds[start];
    const params = new URLSearchParams();
    params.set('auto', 'true');
    if (speed) params.set('speed', String(speed));
    router.replace(`/article/${firstId}?${params.toString()}`);
  }, [auto, speed, props.allArticleIds, router]);

  return null;
}
