'use client';

import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown, { Components as MarkdownComponents } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound, useParams } from 'next/navigation';
import { useEffect } from 'react'; // Keep useEffect for notFound check
import moment from 'moment';
import { ScaleLoader } from 'react-spinners';
import TableOfContents from '@/components/TableOfContents';
import { useSummaryPageLogic } from '@/hooks/useSummaryPageLogic';

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

  const {
    data,
    loading,
    error,
    headings,
    activeHeadingId,
    setActiveHeadingId, // Get setter from hook
    groupedSources,
    sortedDomains,
    expandedDomain,
    setExpandedDomain,
  } = useSummaryPageLogic(id);

  // Handle notFound based on error state from hook
  useEffect(() => {
    if (!loading && error === 'Summary not found') {
      notFound();
    }
  }, [loading, error]);

  if (loading && !data) { // Show loader only on initial load
    return (
      <main className="flex items-center justify-center min-h-screen">
        <ScaleLoader color="#14B8A6" />
      </main>
    );
  }

  if (error && error !== 'Summary not found') { // Show other errors
    return <div className="max-w-3xl mx-auto px-4 py-8">Error: {error}</div>;
  }

  if (!data) {
     // If not loading, no data, and not a 'not found' error, something else is wrong.
     // Or could have already triggered notFound(). Render null or a generic error.
    return null; 
  }

  // Destructure after data check
  const { summary, newsItems } = data;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 min-h-screen relative">
      <Link href="/" className="text-blue-600 hover:underline mb-8 block">
        ← Back 
      </Link>
      
      {/* Pass setActiveId to ToC */}
      <TableOfContents 
        headings={headings} 
        activeId={activeHeadingId} 
        setActiveId={setActiveHeadingId} 
      />

      <article className="prose prose-lg max-w-none">
        {/* Title uses id='introduction' */}
        <h1 id="introduction" className="text-3xl font-medium scroll-mt-20">{summary.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 not-prose mb-8">
          <span>{summary.tag_name}</span>
          <span>{moment(summary.created_at).fromNow()}</span>
        </div>

        <div id="article-content">
          {/* Summary uses id='summary-content' */}
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

        {/* Sources Section uses id='sources' */} 
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