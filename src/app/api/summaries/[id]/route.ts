import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Summary ID is required' }, { status: 400 });
    }

    const { data: summary, error: summaryError } = await supabase
      .from('tag_summaries')
      .select('*')
      .eq('id', id)
      .single();

    if (summaryError) throw summaryError;

    if (!summary) {
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    const { data: newsItems, error: newsError } = await supabase
      .from('news_items')
      .select('*')
      .in('id', summary.news_ids);

    if (newsError) throw newsError;

    return NextResponse.json({
      summary,
      newsItems: newsItems || []
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
} 