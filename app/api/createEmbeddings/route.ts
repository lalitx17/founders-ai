import { NextResponse } from 'next/server';
import { initChroma, queryChroma } from '@/lib/chroma-client';
import { LlamaCpp } from "@langchain/community/llms/llama_cpp";

const llamaPath = "/home/lalit/models/llama-2-7b.Q6_K.gguf";

export async function POST(request: Request) {
  try {
    await initChroma();

    const { query } = await request.json();
    console.log('Received query:', query);

    const results = await queryChroma(query);

    const model = new LlamaCpp({
      modelPath: llamaPath,
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
    });


    console.log(`You: ${query}`);
    const AI = await model.invoke(query);
    console.log(`AI: ${AI}`)


    const response = {
      message: 'Query processed successfully',
      query: query,
      results: results, 
      modelResponse: AI
    };

    console.log("Sending response:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}