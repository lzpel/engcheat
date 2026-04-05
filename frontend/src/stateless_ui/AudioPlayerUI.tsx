"use client";
import React from 'react';
import { Play, Pause, Repeat, Repeat1, SkipForward, SkipBack, ArrowLeft } from 'lucide-react';

export interface AudioPlayerUIProps {
  onBack?: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkip: () => void;
  onSkipBack?: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  progress: number;
  duration: number;
  onSeek: (newTime: number) => void;
  playbackRate?: number;
  onSpeedChange?: (rate: number) => void;
}

const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(time: number): string {
  if (isNaN(time)) return "0:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayerUI(props: AudioPlayerUIProps) {
  return (
    <div className="h-full bg-background-paper rounded-2xl shadow border border-gray-100 flex flex-col items-center py-6 px-3 gap-6">
      {/* Navigation / Top */}
      {props.onBack && (
        <div className="flex flex-col items-center border-b border-gray-100 pb-4 w-full">
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (props.onBack) props.onBack();
            }}
            title="Back to Lessons" 
            className="p-2 text-primary-main hover:bg-primary-main/10 rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      )}

      {/* Controls Section */}
      <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-6 w-full">
        {props.onSkipBack && (
          <button
            onClick={props.onSkipBack}
            className="p-2 text-gray-500 hover:text-primary-main hover:bg-primary-main/10 rounded-full transition"
            title="Skip to previous"
          >
            <SkipBack size={20} />
          </button>
        )}

        <button
          onClick={props.onTogglePlay}
          className="p-3 bg-primary-main text-white rounded-full hover:bg-primary-dark transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          {props.isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>

        <button
          onClick={props.onSkip}
          className="p-2 text-gray-500 hover:text-primary-main hover:bg-primary-main/10 rounded-full transition"
          title="Skip to next"
        >
          <SkipForward size={20} />
        </button>

        <button
          onClick={props.onToggleRepeat}
          className={`p-2 rounded-full transition ${props.isRepeat ? 'bg-primary-main/10 text-primary-main' : 'text-gray-400 hover:bg-gray-100'}`}
          title={props.isRepeat ? 'Repeat On' : 'Repeat Off'}
        >
          {props.isRepeat ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>

        {props.onSpeedChange && (
          <button
            onClick={() => {
              const current = props.playbackRate ?? 1;
              const idx = SPEED_PRESETS.findIndex(s => s >= current + 0.01);
              const next = SPEED_PRESETS[idx === -1 ? 0 : idx];
              props.onSpeedChange!(next);
            }}
            className="px-1 py-1 text-xs font-bold text-gray-500 hover:text-primary-main hover:bg-primary-main/10 rounded-lg transition"
            title="Playback speed"
          >
            {(props.playbackRate ?? 1)}x
          </button>
        )}
      </div>

      {/* Progress Bar Section (Vertical) */}
      <div className="flex flex-col flex-1 items-center gap-2 w-full">
        <span className="text-xs text-text-secondary font-medium tracking-tighter">
          {formatTime(props.progress)}
        </span>
        
        <div 
          className="flex-1 w-2 bg-gray-200 rounded-lg cursor-pointer relative overflow-hidden my-1"
          onClick={(e) => {
            if (!props.duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const newTime = (clickY / rect.height) * props.duration;
            props.onSeek(newTime);
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full bg-primary-main rounded-lg pointer-events-none transition-all duration-100 ease-linear"
            style={{ height: props.duration ? `${(props.progress / props.duration) * 100}%` : '0%' }}
          ></div>
        </div>

        <span className="text-xs text-text-secondary font-medium tracking-tighter">
          {formatTime(props.duration)}
        </span>
      </div>
    </div>
  );
}

export function Sandbox() {
  return (
    <div className="p-8 bg-gray-50 h-screen flex gap-8">
      <div className="w-20 h-[600px] flex-shrink-0">
        <AudioPlayerUI
          isPlaying={true}
          progress={45}
          duration={120}
          isRepeat={false}
          onTogglePlay={() => console.log('toggle play')}
          onSkip={() => console.log('skip')}
          onSkipBack={() => console.log('skip back')}
          onToggleRepeat={() => console.log('toggle repeat')}
          onSeek={(newTime) => console.log('seek to', newTime)}
          onBack={() => console.log('back clicked')}
          playbackRate={1}
          onSpeedChange={(rate) => console.log('speed', rate)}
        />
      </div>
      <div className="w-20 h-[600px] flex-shrink-0">
        <AudioPlayerUI
          isPlaying={false}
          progress={115}
          duration={120}
          isRepeat={true}
          onTogglePlay={() => console.log('toggle play')}
          onSkip={() => console.log('skip')}
          onSkipBack={() => console.log('skip back')}
          onToggleRepeat={() => console.log('toggle repeat')}
          onSeek={(newTime) => console.log('seek to', newTime)}
          playbackRate={1.5}
          onSpeedChange={(rate) => console.log('speed', rate)}
        />
      </div>
    </div>
  );
}
