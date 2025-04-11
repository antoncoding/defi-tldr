import TagSummaryCard from './components/TagSummaryCard';
import { TagSummary } from '@/types/database';

async function getTagSummaries() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/summaries`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Error fetching tag summaries');
    return [];
  }

  return res.json() as Promise<TagSummary[]>;
}

export default async function Home() {
  const summaries = await getTagSummaries();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-6">DeFi TLDR</h1>
      <div className="divide-y divide-gray-200">
        {summaries.map((summary) => (
          <TagSummaryCard key={summary.id} summary={summary} />
        ))}
      </div>
    </main>
  );
}
