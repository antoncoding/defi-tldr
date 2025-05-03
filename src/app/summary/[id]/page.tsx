'use client';

import { TagSummary, NewsItem } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Components } from 'react-markdown';
import { ScaleLoader } from 'react-spinners';

function getFaviconUrl(url: string): string | null {
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

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-4xl font-bold mb-4">{children}</h1>,
  h2: ({ children }) => <h2 className="text-3xl font-semibold mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-2xl font-semibold mb-2">{children}</h3>,
  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
  li: ({ children }) => <li className="mb-2">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export default function SummaryPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{ summary: TagSummary; newsItems: NewsItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      notFound();
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getSummaryData(id);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <ScaleLoader color="#4A90E2" />
      </main>
    );
  }

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 py-8">Error: {error}</div>;
  }

  if (!data) {
    notFound();
    return null;
  }

  const { summary, newsItems } = data;

  const groupedSources = newsItems.reduce((acc, item) => {
    try {
      const domain = new URL(item.url).hostname;
      if (!acc[domain]) {
        acc[domain] = { items: [], favicon: getFaviconUrl(item.url) };
      }
      acc[domain].items.push(item);
    } catch (e) {
      console.error("Invalid URL:", item.url, e);
    }
    return acc;
  }, {} as Record<string, { items: NewsItem[]; favicon: string | null }>);

  const sortedDomains = Object.entries(groupedSources)
    .sort(([, a], [, b]) => b.items.length - a.items.length)
    .map(([domain, data]) => ({ domain, ...data }));

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      <Link href="/" className="text-blue-600 hover:underline mb-8 block">
        ← Back to summaries
      </Link>
      
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-medium">{summary.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 not-prose mb-8">
          <span>{summary.tag_name}</span>
          <span>{moment(summary.created_at).fromNow()}</span>
        </div>

        <div className="prose prose-lg">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {summary.summary}
          </ReactMarkdown>
        </div>

        <div className="border-t border-gray-200 my-8"></div>

        <div className="prose prose-lg">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {summary.detail}
          </ReactMarkdown>
        </div>

        <div className="border-t border-gray-200 my-8"></div>

        <div className="not-prose mb-8">
          <div className="flex flex-wrap gap-2 justify-end mb-4">
            {sortedDomains.map(({ domain, items, favicon }) => (
              <button
                key={domain}
                onClick={() => setExpandedDomain(expandedDomain === domain ? null : domain)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors duration-150 ${
                  expandedDomain === domain
                    ? 'bg-gray-200 border-gray-400'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {favicon && (
                  <Image
                    src={favicon}
                    alt={`${domain} favicon`}
                    width={12}
                    height={12}
                  />
                )}
                <span className="font-medium">{domain}</span>
                <span className="text-gray-600">({items.length})</span>
              </button>
            ))}
          </div>

          {expandedDomain && groupedSources[expandedDomain] && (
            <div className="mt-6 space-y-1 border-t pt-4">
              <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                {groupedSources[expandedDomain].favicon && (
                  <Image
                    src={groupedSources[expandedDomain].favicon!}
                    alt={`${expandedDomain} favicon`}
                    width={16}
                    height={16}
                  />
                )}
                Sources from {expandedDomain}
              </h3>
              {groupedSources[expandedDomain].items.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 hover:bg-gray-50 group pl-2"
                >
                  <span className="text-sm text-gray-900 truncate group-hover:underline flex-grow">
                    {item.title}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(item.published_at).toLocaleDateString()}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  );
} 