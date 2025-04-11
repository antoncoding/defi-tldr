import { supabase } from '@/lib/supabase';
import TagSummaryCard from './components/TagSummaryCard';
import { TagSummary } from '@/types/database';

async function getTagSummaries() {
  const { data, error } = await supabase
    .from('tag_summaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tag summaries:', error);
    return [];
  }

  return data as TagSummary[];
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
