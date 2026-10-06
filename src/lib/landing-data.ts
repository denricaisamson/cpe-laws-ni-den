import { createClient } from './supabase/server';
import {
  mockWorkshops,
  mockVideos,
  mockNewsEvents,
  mockProducts,
} from './mock-data';
import type { Workshop, Video, NewsEvent, Product } from '@/types/database';

export interface LandingData {
  workshops: Workshop[];
  videos: Video[];
  news: NewsEvent[];
  products: Product[];
}

/**
 * Fetches data for the landing page with graceful fallback to mock data
 * when Supabase is unreachable or unconfigured.
 */
export async function getLandingData(): Promise<LandingData> {
  try {
    const supabase = createClient();

    const [
      { data: workshops },
      { data: videos },
      { data: news },
      { data: products },
    ] = await Promise.all([
      supabase.from('workshops').select('*').order('level', { ascending: true }),
      supabase.from('videos').select('*').limit(6),
      supabase.from('news_events').select('*').order('date', { ascending: false }).limit(4),
      supabase.from('products').select('*').limit(4),
    ]);

    return {
      workshops: (workshops && workshops.length > 0) ? (workshops as Workshop[]) : mockWorkshops,
      videos: (videos && videos.length > 0) ? (videos as Video[]) : mockVideos,
      news: (news && news.length > 0) ? (news as NewsEvent[]) : mockNewsEvents,
      products: (products && products.length > 0) ? (products as Product[]) : mockProducts,
    };
  } catch (error) {
    console.warn('[Landing Data] Using fallback mock data:', error);
    return {
      workshops: mockWorkshops,
      videos: mockVideos,
      news: mockNewsEvents,
      products: mockProducts,
    };
  }
}
