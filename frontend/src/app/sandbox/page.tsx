"use client";
import React from 'react';
import { Sandbox as AudioPlayerSandbox } from '../../stateless_ui/AudioPlayerUI';
import { Sandbox as ArticleReaderSandbox } from '../../stateless_ui/ArticleReaderUI';

export default function SandboxPage() {
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">UI Sandbox</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2">AudioPlayerUI Sandbox</h2>
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm overflow-auto h-[650px]">
          <AudioPlayerSandbox />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2">ArticleReaderUI Sandbox</h2>
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm overflow-auto h-[650px]">
          <ArticleReaderSandbox />
        </div>
      </section>
    </div>
  );
}
