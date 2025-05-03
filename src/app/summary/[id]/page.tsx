'use client';

import { TagSummary, NewsItem } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown, { Components as MarkdownComponents } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import { ScaleLoader } from 'react-spinners';
import TableOfContents from '@/components/TableOfContents';
import { throttle } from 'lodash';

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

// Helper to generate slugs
const generateSlug = (text: string) => {
  if (!text) return 'heading-' + Math.random().toString(36).substring(7);
  return text
    .toLowerCase()
    .trim()
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links, keep text
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
};

interface Heading {
  id: string;
  level: number;
  text: string;
}

// Base components just for styling (no collection/ID logic)
const baseMarkdownComponents: MarkdownComponents = {
  h1: ({ children }) => <h1 className="text-4xl font-bold mb-4 scroll-mt-20">{children}</h1>,
  h2: ({ children }) => <h2 className="text-3xl font-semibold mb-3 scroll-mt-20">{children}</h2>,
  h3: ({ children }) => <h3 className="text-2xl font-semibold mb-2 scroll-mt-20">{children}</h3>, 
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
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  
  // --- Moved Hooks (groupedSources, sortedDomains) --- 
  const newsItems = data?.newsItems || []; 
  const groupedSources = useMemo(() => {
    return newsItems.reduce((acc, item) => {
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
  }, [newsItems]); 
  const sortedDomains = useMemo(() => {
    return Object.entries(groupedSources)
    .sort(([, a], [, b]) => b.items.length - a.items.length)
    .map(([domain, data]) => ({ domain, ...data }));
  }, [groupedSources]); 

  useEffect(() => {
    if (!data) return;

    const articleElement = document.getElementById('article-content');
    if (!articleElement) return;

    const headingNodes = articleElement.querySelectorAll('h1, h2, h3');
    const foundHeadings: Heading[] = [];
    const slugCounts = new Map<string, number>();

    headingNodes.forEach(node => {
      const level = parseInt(node.tagName.substring(1), 10);
      // Use textContent, trim whitespace
      const text = node.textContent?.trim() || ''; 
      if (!text) return; // Skip empty headings

      let originalSlug = generateSlug(text);
      let finalId = originalSlug;
      const count = slugCounts.get(originalSlug) || 0;
      if (count > 0) {
        finalId = `${originalSlug}-${count}`;
      }
      slugCounts.set(originalSlug, count + 1);

      // Set the ID directly on the DOM element
      node.id = finalId; 

      foundHeadings.push({ id: finalId, level, text });
    });

    // --- Build final list --- 
    const introId = 'introduction'; // ID for the main title H1
    const finalHeadings: Heading[] = [
      { id: introId, level: 1, text: data.summary.title },
      ...foundHeadings,
    ];

    if (newsItems.length > 0) {
      finalHeadings.push({ id: 'sources', level: 2, text: 'Sources' });
    }

    // Update state only if headings changed
    setHeadings(prevHeadings => {
      if (JSON.stringify(prevHeadings) !== JSON.stringify(finalHeadings)) {
         // Set initial active ID only when headings *actually* change
         const initialHash = window.location.hash.substring(1);
         const currentActiveIsValid = finalHeadings.some(h => h.id === activeHeadingId);
         let nextActiveId = activeHeadingId;
         if (initialHash && finalHeadings.some(h => h.id === initialHash)) {
            nextActiveId = initialHash;
         } else if (!currentActiveIsValid || activeHeadingId === null) { // Explicitly check null
            nextActiveId = finalHeadings.length > 0 ? finalHeadings[0].id : null;
         }
         if(activeHeadingId !== nextActiveId) setActiveHeadingId(nextActiveId);

         return finalHeadings;
      }
      return prevHeadings;
    });

  // Depend on the markdown content fields 
  }, [data?.summary?.summary, data?.summary?.detail, data?.summary?.title, newsItems]); 

  // --- IntersectionObserver Logic (Unchanged, uses `headings`) --- 
  useEffect(() => {
    if (headings.length === 0) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Keep track of headings currently intersecting above the threshold
      const intersectingHeadings: { id: string; top: number }[] = [];
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add intersecting elements to our list
          intersectingHeadings.push({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
          });
        }
      });

      if (intersectingHeadings.length > 0) {
        // Sort by position on screen (topmost first)
        intersectingHeadings.sort((a, b) => a.top - b.top);
        // Set the topmost intersecting heading as active
        setActiveHeadingId(intersectingHeadings[0].id);
      } else {
        // Optional: If nothing is intersecting within the top margin,
        // check which was the *last* active heading based on scroll position.
        // Find the last heading whose top is above the root margin threshold.
        let lastVisibleId = null;
        for (let i = headings.length - 1; i >= 0; i--) {
            const element = document.getElementById(headings[i].id);
            if (element) {
                // The observer's rootMargin is '-80px 0px -40% 0px', so we check if the element is above the -80px top margin.
                if (element.getBoundingClientRect().top < 80) { 
                    lastVisibleId = headings[i].id;
                    break;
                }
            }
        }
        if (lastVisibleId) {
            setActiveHeadingId(lastVisibleId);
        }
      }
    };

    const observerOptions = {
      rootMargin: '-80px 0px -40% 0px', // Top: 80px offset, Bottom: trigger 40% from bottom
      threshold: 0.1 // Trigger when 10% is visible - adjust if needed
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all heading elements
    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup function
    return () => {
      headings.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]); 

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
        <ScaleLoader color="#14B8A6" />
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

  const { summary } = data;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 min-h-screen relative">
      <Link href="/" className="text-blue-600 hover:underline mb-8 block">
        ← Back 
      </Link>
      
      <TableOfContents headings={headings} activeId={activeHeadingId} />

      <article className="prose prose-lg max-w-none">
        <h1 id="introduction" className="text-3xl font-medium scroll-mt-20">{summary.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 not-prose mb-8">
          <span>{summary.tag_name}</span>
          <span>{moment(summary.created_at).fromNow()}</span>
        </div>

        <div id="article-content">
          <div id="summary-content" className="prose prose-lg">
            <ReactMarkdown 
              key={`summary-${id}`} 
              remarkPlugins={[remarkGfm]}
              components={baseMarkdownComponents} 
            >
              {summary.summary}
            </ReactMarkdown>
          </div>

          <div className="border-t border-gray-200 my-8"></div>

          <div className="prose prose-lg">
            <ReactMarkdown 
              key={`detail-${id}`} 
              remarkPlugins={[remarkGfm]}
              components={baseMarkdownComponents} 
            >
              {summary.detail}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sources Section */}
        {newsItems.length > 0 && (
          <>
            <div className="border-t border-gray-200 my-8"></div>

            <h2 id="sources" className="text-2xl font-semibold mb-4 scroll-mt-20">Sources</h2>
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
          </>
        )}
      </article>
    </main>
  );
} 