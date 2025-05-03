'use client';

import TagSummaryCard from './components/TagSummaryCard';
import { TagSummary } from '@/types/database';
import { useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const PAGE_SIZE = 20;

async function getTagSummaries(page: number, limit: number): Promise<{ data: TagSummary[]; count: number | null }> {
  const res = await fetch(`${baseUrl}/api/summaries?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Error fetching tag summaries');
    return { data: [], count: null };
  }

  const result = await res.json();
  return { data: result.data || [], count: result.count };
}

export default function Home() {
  const [summaries, setSummaries] = useState<TagSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchDataForPage = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, count } = await getTagSummaries(page, PAGE_SIZE);
      setSummaries(data);
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / PAGE_SIZE));
      } else {
        setTotalCount(0);
        setTotalPages(0);
        setError('Failed to retrieve total count');
      }
      setCurrentPage(page);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
      setSummaries([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataForPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !loading) {
      fetchDataForPage(newPage);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage - halfMaxPages < 1) {
        endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfMaxPages > totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        items.push(
            <PaginationItem key="1">
                <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
                    1
                </PaginationLink>
            </PaginationItem>
        );
        if (startPage > 2) {
            items.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            items.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
        }
        items.push(
            <PaginationItem key={totalPages}>
                <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>
                    {totalPages}
                </PaginationLink>
            </PaginationItem>
        );
    }

    return items;
  };

  if (loading && summaries.length === 0) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <ScaleLoader color="#4A90E2" />
      </main>
    );
  }

  if (error && summaries.length === 0) {
    return <div className="max-w-3xl mx-auto px-4 py-8">Error: {error}</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-medium mb-6">DeFi TLDR</h1>
      
      <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <div className="divide-y divide-gray-200">
            {summaries.map((summary) => (
              <TagSummaryCard key={summary.id} summary={summary} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-disabled={currentPage === 1 || loading}
                    className={(currentPage === 1 || loading) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-disabled={currentPage === totalPages || loading}
                    className={(currentPage === totalPages || loading) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {error && <div className="text-red-500 text-center py-4">Error loading page: {error}</div>}

          {!loading && summaries.length === 0 && totalCount === 0 && (
             <p className="text-center text-gray-500 mt-6">No summaries found.</p>
          )}
      </div>
    </main>
  );
}
