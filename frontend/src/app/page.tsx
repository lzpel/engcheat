import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Suspense } from 'react';
import { AutoRedirect } from '../components/AutoRedirect';

function getArticles() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) return [];
  
  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  const articles = entries
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => a.localeCompare(b)); // Sort by oldest first (assuming YYYYMMDD_ prefix)

  return articles;
}

export default function Home() {
  const articles = getArticles();

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <Suspense>
        <AutoRedirect allArticleIds={articles} />
      </Suspense>
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary-main mb-4">
          English Learning
        </h1>
        <p className="text-lg text-text-secondary">
          Improve your listening and reading skills with synchronized audio.
        </p>
        <div className="mt-4">
          <a
            href={`${process.env.NEXT_PUBLIC_PREFIX || ''}/paper.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-secondary-main text-white font-medium rounded-lg shadow hover:bg-secondary-dark transition-colors"
          >
            Download PDF Material
          </a>
        </div>
      </header>
      
      <div className="bg-background-paper shadow-xl sm:rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">
            Available Lessons
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {articles.map((id) => (
            <li key={id}>
              <Link 
                href={`/article/${id}`}
                className="block hover:bg-primary-main/5 transition-colors duration-150 ease-in-out"
              >
                <div className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-semibold text-text-primary capitalize">
                      {id.replace(/^[0-9]+_/, '').replace(/-/g, ' ')}
                    </h4>
                    <p className="text-sm text-text-secondary mt-1">
                      {id.split('_')[0]}
                    </p>
                  </div>
                  <span className="text-primary-main">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {articles.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">
              No lessons available. Please run `make generate`.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
