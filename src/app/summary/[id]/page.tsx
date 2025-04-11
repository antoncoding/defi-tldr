import { supabase } from '@/lib/supabase';
import { TagSummary, NewsItem } from '@/types/database';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

async function getTagSummary(id: string) {
  const { data, error } = await supabase
    .from('tag_summaries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tag summary:', error);
    return null;
  }

  return data as TagSummary;
}

async function getNewsItems(newsIds: string[]) {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .in('id', newsIds);

  if (error) {
    console.error('Error fetching news items:', error);
    return [];
  }

  return data as NewsItem[];
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SummaryPage({ params, searchParams }: PageProps) {
  const summary = await getTagSummary(params.id);
  if (!summary) {
    return <div>Summary not found</div>;
  }

  const newsItems = await getNewsItems(summary.news_ids);

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
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-3.5 h-3.5 flex-shrink-0"
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