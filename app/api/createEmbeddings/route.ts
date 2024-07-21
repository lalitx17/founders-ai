import { NextResponse } from 'next/server';
import { initChroma, queryChroma } from '@/lib/chroma-client';

export async function POST(request: Request) {
  try {
    await initChroma();

    const { query } = await request.json();
    console.log('Received query:', query);

    const results = await queryChroma(query);

    const response = {
      message: 'Query processed successfully',
      query: query,
      results: results
    };

    console.log("Sending response:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}