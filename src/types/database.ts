export type Entry = {
  id: string
  created_at: string
  title: string
  content: string
  // Add more fields as needed
}

export interface TagSummary {
  id: string;
  tag_name: string;
  title: string;
  summary: string;
  detail: string;
  news_count: number;
  start_time: string;
  end_time: string;
  news_ids: string[];
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  content: string;
  summary: string;
  published_at: string;
  source: string;
  topics: string[];
  created_at: string;
} 