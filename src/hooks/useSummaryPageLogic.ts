'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { TagSummary, NewsItem } from '@/types/database';
import { generateSlug } from '@/lib/utils'; // Assuming generateSlug is moved to utils

interface Heading {
  id: string;
  level: number;
  text: string;
}

interface SummaryData {
  summary: TagSummary;
  newsItems: NewsItem[];
}

async function getSummaryData(id: string): Promise<SummaryData> {
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

  return res.json();
}

function getFaviconUrl(url: string): string | null {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

export function useSummaryPageLogic(id: string | undefined) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const newsItems = useMemo(() => data?.newsItems || [], [data?.newsItems]);

  // Fetch Data Effect
  useEffect(() => {
    if (!id) {
      setLoading(false);
      // Instead of calling notFound directly, maybe return an error state?
      // Or let the page component handle notFound based on loading/error/data state.
      setError("No ID provided"); 
      return;
    }

    let isMounted = true; // Flag to prevent state update on unmounted component
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getSummaryData(id);
        if (isMounted) {
          setData(response);
        }
      } catch (err) {
         if (isMounted) {
             if (err instanceof Error && err.message.includes('Not Found') || (err && typeof err === 'object' && 'status' in err && err.status === 404)) {
                 // Let page handle notFound() based on error message or status
                 setError('Summary not found'); 
             } else {
                 setError(err instanceof Error ? err.message : 'Failed to fetch summary');
             }
         }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
        isMounted = false; // Cleanup function to set the flag
    };
  }, [id]);

  // Group and Sort Sources Memo
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

  // Heading Extraction Effect
  useEffect(() => {
    if (!data || !data.summary) return; // Ensure data and summary exist

    const articleElement = document.getElementById('article-content');
    if (!articleElement) return;

    const headingNodes = articleElement.querySelectorAll('h1, h2, h3');
    const foundHeadings: Heading[] = [];
    const slugCounts = new Map<string, number>();

    headingNodes.forEach(node => {
      const level = parseInt(node.tagName.substring(1), 10);
      const text = node.textContent?.trim() || '';
      if (!text) return;

      const originalSlug = generateSlug(text);
      let finalId = originalSlug;
      const count = slugCounts.get(originalSlug) || 0;
      if (count > 0) {
        finalId = `${originalSlug}-${count}`;
      }
      slugCounts.set(originalSlug, count + 1);

      node.id = finalId;
      foundHeadings.push({ id: finalId, level, text });
    });

    // Add fixed IDs/headings
    const finalHeadings: Heading[] = [
        // We include introduction here as it's a heading *in* the content
        { id: 'introduction', level: 1, text: data.summary.title }, 
        ...foundHeadings,
    ];

    if (newsItems.length > 0) {
      finalHeadings.push({ id: 'sources', level: 2, text: 'Sources' });
    }

    setHeadings(prevHeadings => {
      // Simple comparison for now, might need deep comparison if structure is complex
      if (JSON.stringify(prevHeadings) !== JSON.stringify(finalHeadings)) {
        // Initialize active ID based on hash or first heading
         const initialHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : null;
         const currentActiveIsValid = finalHeadings.some(h => h.id === activeHeadingId);
         let nextActiveId = activeHeadingId;

         if (initialHash && finalHeadings.some(h => h.id === initialHash)) {
            nextActiveId = initialHash;
          // If current active is no longer valid OR it was never set, find a default
         } else if (!currentActiveIsValid || activeHeadingId === null) { 
            // Default to 'introduction' if available, otherwise the first real heading, or null
            const introExists = finalHeadings.some(h => h.id === 'introduction');
            nextActiveId = introExists ? 'introduction' : (finalHeadings.length > 0 ? finalHeadings[0].id : null);
         }
         // Only update if the active ID actually changes
         if(activeHeadingId !== nextActiveId) setActiveHeadingId(nextActiveId);

        return finalHeadings;
      }
      return prevHeadings;
    });

  // Depend on the elements that contribute to headings
  }, [data, activeHeadingId, newsItems.length]);


  // Intersection Observer Effect
  useEffect(() => {
      // Filter out the placeholder 'summary-content' heading for the observer
      const observableHeadings = headings.filter(h => h.id !== 'summary-content');
      if (observableHeadings.length === 0) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const intersectingHeadings: { id: string; top: number }[] = [];
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id !== 'summary-content') { // Ignore summary-content div
          intersectingHeadings.push({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
          });
        }
      });

      if (intersectingHeadings.length > 0) {
        intersectingHeadings.sort((a, b) => a.top - b.top);
        // Check if the new topmost intersecting heading is different from the current active one
        if (activeHeadingId !== intersectingHeadings[0].id) {
          setActiveHeadingId(intersectingHeadings[0].id);
        }
      } else {
        // Fallback logic if nothing is intersecting in the top part of the viewport
        let lastVisibleId = activeHeadingId; // Default to current if no better option found
        let foundVisible = false;
        for (let i = observableHeadings.length - 1; i >= 0; i--) {
            const element = document.getElementById(observableHeadings[i].id);
            if (element) {
                // Check if the element's top is above the viewport's top edge (approx) + offset
                if (element.getBoundingClientRect().top < 80) { // 80px offset matching scroll
                    lastVisibleId = observableHeadings[i].id;
                    foundVisible = true;
                    break;
                }
            }
        }
         // Only update if the determined lastVisibleId is different
        if (foundVisible && activeHeadingId !== lastVisibleId) {
           setActiveHeadingId(lastVisibleId);
        } else if (!foundVisible && activeHeadingId !== null) {
            // Optional: If nothing is visible above the threshold and nothing intersects,
            // maybe clear the active ID or keep the last one? Keeping last one for now.
            // setActiveHeadingId(null); 
        }
      }
    };

    const observerOptions = {
      rootMargin: '-80px 0px -40% 0px', // Top: 80px offset, Bottom: trigger 40% from bottom
      threshold: 0, // Trigger as soon as any part enters/leaves the rootMargin
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    observableHeadings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observableHeadings.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  // Depend only on the actual list of headings being observed
  }, [headings, activeHeadingId]); // Added activeHeadingId dependency

  return {
    data,
    loading,
    error,
    headings,
    activeHeadingId,
    setActiveHeadingId, // Expose setter for direct manipulation (like in ToC clicks)
    groupedSources,
    sortedDomains,
    expandedDomain,
    setExpandedDomain,
  };
}