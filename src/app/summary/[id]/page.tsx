'use client';

import { TagSummary, NewsItem } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

async function getSummaryData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/summaries/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch summary');
  }

  return res.json() as Promise<{
    summary: TagSummary;
    newsItems: NewsItem[];
  }>;
}

export default function SummaryPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{ summary: TagSummary; newsItems: NewsItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      notFound();
      return;
    }

    const fetchData = async () => {
      try {
        const response = await getSummaryData(id);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 py-8">Error: {error}</div>;
  }

  if (!data) {
    return <div className="max-w-3xl mx-auto px-4 py-8">Loading...</div>;
  }

  const { summary, newsItems } = data;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:underline mb-8 block">
        ← Back to summaries
      </Link>
      
      <article className="prose lg:prose-lg max-w-none">
        <h1 className="text-4xl font-medium">{summary.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 not-prose mb-8">
          <span>{summary.tag_name}</span>
          <span>{new Date(summary.created_at).toLocaleDateString()}</span>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900">Summary</h2>
          <ReactMarkdown>{summary.summary}</ReactMarkdown>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900">Details</h2>
          <ReactMarkdown>{summary.detail}</ReactMarkdown>
        </div>

        <div className="not-prose">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sources ({newsItems.length})</h2>
          <div className="space-y-1">
            {newsItems.map((item) => {
              const faviconUrl = getFaviconUrl(item.url);
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 hover:bg-gray-50 group"
                >
                  {faviconUrl && (
                    <Image
                      src={faviconUrl}
                      alt=""
                      width={14}
                      height={14}
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="text-sm text-gray-900 truncate group-hover:underline flex-grow">
                    {item.title}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(item.published_at).toLocaleDateString()}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </article>
    </main>
  );
} 