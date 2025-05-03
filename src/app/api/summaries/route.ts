import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate page and limit
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, Math.min(100, limit)); // Add a max limit for safety

    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // Fetch data and count simultaneously
    const { data, error, count } = await supabase
      .from('tag_summaries')
      .select('*', { count: 'exact' }) // Request count
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Return data and count
    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    );
  }
} 