import Link from 'next/link';
import { TagSummary } from '@/types/database';
import moment from 'moment';

interface TagSummaryCardProps {
  summary: TagSummary;
}

export default function TagSummaryCard({ summary }: TagSummaryCardProps) {
  return (
    <Link href={`/summary/${summary.id}`} className="block py-4 hover:bg-gray-50">
      <div className="flex flex-col">
        <h2 className="text-lg font-medium text-gray-900">{summary.title}</h2>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>{summary.tag_name}</span>
          <span>{moment(summary.created_at).fromNow()}</span>
        </div>
      </div>
    </Link>
  );
} 