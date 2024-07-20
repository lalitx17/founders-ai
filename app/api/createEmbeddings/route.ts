import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    console.log('Received query:', query);

    // Make a request to the Express server
    const response = await fetch('http://localhost:3005/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    console.log('Express server response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch from Express server: ${response.status}`);
    }

    const data = await response.json();

    console.log("Data received from Express server:", data.results.documents);

    if (!data || !data.results) {
      console.error("Unexpected data structure from Express server:", data);
      throw new Error('Unexpected data structure from Express server');
    }

    const result = { 
      message: 'Query processed',    
      query: query,
      results: data.results
    };

    console.log("Sending response:", result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}
