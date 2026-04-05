"use client";
import React from 'react';

export interface ArticleReaderUIProps {
  titleStr: string;
  dateStr: string;
  sentences: any[][]; // array of [enText, jaText]
  activeIndex: number;
  containerRef?: React.Ref<HTMLDivElement>;
  registerSentenceRef?: (idx: number, el: HTMLDivElement | null) => void;
  audioPlayerSlot?: React.ReactNode;
}

export function ArticleReaderUI(props: ArticleReaderUIProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col h-dvh">
      <div className="flex-1 min-h-0 flex flex-row gap-4 py-4">
        
        {/* Left Sidebar Fixed Player Slot */}
        <div className="w-20 flex-shrink-0">
          {props.audioPlayerSlot}
        </div>

        {/* Right Side Scrollable text content */}
        <div className="flex-1 min-w-0 flex flex-col bg-background-paper rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 capitalize leading-tight">
              {props.titleStr}
            </h1>
            <p className="text-sm text-gray-500 mt-2">{props.dateStr}</p>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth" 
            ref={props.containerRef}
          >
            <div className="space-y-6 pb-32">
              {props.sentences.map((pair, idx) => {
                const enText = pair[0];
                const jaText = pair[1];
                if (!enText?.trim() && !jaText?.trim()) return null; // skip empty lines

                const isActive = idx === props.activeIndex;
                return (
                  <div 
                    key={idx}
                    ref={(el) => {
                      if (props.registerSentenceRef) {
                        props.registerSentenceRef(idx, el);
                      }
                    }}
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

export function Sandbox() {
  const sampleSentences = [
    ["This is the first sentence.", "これは最初の文です。"],
    ["Here is the second one, which is currently active and highlighted.", "これが2番目の文で、現在アクティブでハイライトされています。"],
    ["And a third sentence to show how scrolling would look.", "そしてスクロールがどう見えるかを示す3番目の文です。"]
  ];

  return (
    <div className="bg-gray-50 h-screen w-full">
      <ArticleReaderUI 
        titleStr="Sandbox Title Sample"
        dateStr="20251231"
        sentences={sampleSentences}
        activeIndex={1}
        audioPlayerSlot={
          <div className="h-full w-full bg-blue-100 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center text-xs text-blue-500 font-bold p-2 text-center">
            AudioPlayer Slot
          </div>
        }
      />
    </div>
  );
}
