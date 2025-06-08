import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import { searchFood } from '@/lib/fatsecret';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return new Response('Query parameter is required', { status: 400 });
    }

    const searchResults = await searchFood(query);
    return Response.json(searchResults.results);
  } catch (error) {
    console.error('Search food error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
