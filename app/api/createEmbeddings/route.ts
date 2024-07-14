import { NextRequest, NextResponse } from 'next/server';
import { createEmbeddings } from '@/lib/embeddings';

export async function GET(req: NextRequest) {
  try {
    const embeddings = await createEmbeddings();
    return NextResponse.json(embeddings);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json({ error: 'Failed to generate embeddings' }, { status: 500 });
  }
}