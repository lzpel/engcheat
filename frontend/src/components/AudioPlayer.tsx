"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Play, Pause, Repeat, Repeat1, SkipForward, ArrowLeft } from 'lucide-react';

export interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onBack?: () => void;
  autoPlay?: boolean;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  isRepeatEnabled: boolean;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ src, onTimeUpdate, onEnded, onBack, autoPlay = false }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isRepeat, setIsRepeat] = useState(false);

    useImperativeHandle(ref, () => ({
      play: () => {
        audioRef.current?.play();
      },
      pause: () => {
        audioRef.current?.pause();
      },
      seek: (time: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
        }
      },
      isRepeatEnabled: isRepeat,
    }));

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => {
        setProgress(audio.currentTime);
        if (onTimeUpdate) {
          onTimeUpdate(audio.currentTime, audio.duration);
        }
      };

      const handleDurationChange = () => {
        setDuration(audio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (isRepeat) {
          audio.currentTime = 0;
          audio.play();
        } else if (onEnded) {
          onEnded();
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('loadedmetadata', handleDurationChange);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('loadedmetadata', handleDurationChange);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }, [onTimeUpdate, onEnded, isRepeat]);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error("Playback failed:", e));
      }
    };

    const handleProgressScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio) return;
      const newTime = Number(e.target.value);
      audio.currentTime = newTime;
      setProgress(newTime);
    };

    const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const m = Math.floor(time / 60);
      const s = Math.floor(time % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

  return (
      <div className="h-full bg-background-paper rounded-2xl shadow border border-gray-100 flex flex-col items-center py-6 px-3 gap-6">
        <audio ref={audioRef} src={src} autoPlay={autoPlay} preload="metadata" />
        
        {/* Navigation / Top */}
        {onBack && (
          <div className="flex flex-col items-center border-b border-gray-100 pb-4 w-full">
            <button 
              onClick={(e) => {
                e.preventDefault();
                onBack();
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
          <button 
            onClick={togglePlay}
            className="p-3 bg-primary-main text-white rounded-full hover:bg-primary-dark transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          
          <button
            onClick={() => {
              if (onEnded) onEnded();
            }}
            className="p-2 text-gray-500 hover:text-primary-main hover:bg-primary-main/10 rounded-full transition"
            title="Skip to next"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 rounded-full transition ${isRepeat ? 'bg-primary-main/10 text-primary-main' : 'text-gray-400 hover:bg-gray-100'}`}
            title={isRepeat ? 'Repeat On' : 'Repeat Off'}
          >
            {isRepeat ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Progress Bar Section (Vertical) */}
        <div className="flex flex-col flex-1 items-center gap-2 w-full">
          <span className="text-xs text-text-secondary font-medium tracking-tighter">
            {formatTime(progress)}
          </span>
          
          <div 
            className="flex-1 w-2 bg-gray-200 rounded-lg cursor-pointer relative overflow-hidden my-1"
            onClick={(e) => {
              const audio = audioRef.current;
              if (!audio || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickY = e.clientY - rect.top;
              const newTime = (clickY / rect.height) * duration;
              audio.currentTime = newTime;
              setProgress(newTime);
            }}
          >
            <div 
              className="absolute top-0 left-0 w-full bg-primary-main rounded-lg pointer-events-none transition-all duration-100 ease-linear"
              style={{ height: duration ? `${(progress / duration) * 100}%` : '0%' }}
            ></div>
          </div>

          <span className="text-xs text-text-secondary font-medium tracking-tighter">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";
