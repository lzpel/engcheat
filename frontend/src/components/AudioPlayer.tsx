"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { AudioPlayerUI } from '../stateless_ui/AudioPlayerUI';

export interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onSkipBack?: () => void;
  onBack?: () => void;
  autoPlay?: boolean;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  playbackRate: number;
  onSpeedChange: (rate: number) => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  isRepeatEnabled: boolean;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  (props, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(props.autoPlay || false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
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
      isRepeatEnabled: props.isRepeat,
    }));

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => {
        setProgress(audio.currentTime);
        if (props.onTimeUpdate) {
          props.onTimeUpdate(audio.currentTime, audio.duration);
        }
      };

      const handleDurationChange = () => {
        setDuration(audio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (props.onEnded) {
          props.onEnded();
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
    }, [props]);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.playbackRate = props.playbackRate;
      }
    }, [props.playbackRate]);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error("Playback failed:", e));
      }
    };

    const handleSeek = (newTime: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = newTime;
      setProgress(newTime);
    };

    const handleSkip = () => {
      if (props.onEnded) props.onEnded();
    };

    return (
      <>
        <audio ref={audioRef} src={props.src} autoPlay={props.autoPlay} preload="metadata" />
        <AudioPlayerUI 
          onBack={props.onBack}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          isRepeat={props.isRepeat}
          onTogglePlay={togglePlay}
          onSkip={handleSkip}
          onSkipBack={props.onSkipBack}
          onToggleRepeat={props.onToggleRepeat}
          onSeek={handleSeek}
          playbackRate={props.playbackRate}
          onSpeedChange={props.onSpeedChange}
        />
      </>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";
