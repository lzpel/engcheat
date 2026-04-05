import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { ArticleReader, ArticleData } from '../../../components/ArticleReader';

export function generateStaticParams() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) return [];

  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  const articles = entries
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => a.localeCompare(b)); // Sort oldest first

  return articles.map((id) => ({
    id: id,
  }));
}

export default async function ArticlePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const publicDir = path.join(process.cwd(), 'public');
  const jsonPath = path.join(publicDir, id, 'out.json');
  
  let jsonContent: any[][][] = [];
  try {
    const fileContents = fs.readFileSync(jsonPath, 'utf8');
    jsonContent = JSON.parse(fileContents);
  } catch (err) {
    console.error(`Failed to read data for ${id}:`, err);
  }

  // Build full sorted article list
  let allArticleIds: string[] = [];
  let currentIndex = 0;
  try {
    const entries = fs.readdirSync(publicDir, { withFileTypes: true });
    allArticleIds = entries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort((a, b) => a.localeCompare(b));
    currentIndex = allArticleIds.indexOf(id);
  } catch(e) {
    // Ignore
  }

  const nextArticleId = currentIndex !== -1 && currentIndex < allArticleIds.length - 1
    ? allArticleIds[currentIndex + 1]
    : null;

  const data: ArticleData = {
    id,
    json: jsonContent,
    nextArticleId,
    allArticleIds,
    currentIndex,
  };

  return (
    <Suspense>
      <ArticleReader data={data} />
    </Suspense>
  );
}
