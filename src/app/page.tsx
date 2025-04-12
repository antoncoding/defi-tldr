'use client';

import TagSummaryCard from './components/TagSummaryCard';
import { TagSummary } from '@/types/database';
import { useEffect, useState } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getTagSummaries() {
  const res = await fetch(`${baseUrl}/api/summaries`, {
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

export default function Home() {
  const [summaries, setSummaries] = useState<TagSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTagSummaries();
        setSummaries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 py-8">Error: {error}</div>;
  }

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
