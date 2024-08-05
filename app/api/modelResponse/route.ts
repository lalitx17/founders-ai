import { NextResponse } from "next/server";
import { queryClaudeChain } from "@/lib/claude";
import { queryLlamaChain } from "@/lib/llama";

export async function POST(request: Request) {
  try {
    const { query, model, embeddings } = await request.json();
    console.log("Received query:", query);
    console.log("Selected model:", model);
    console.log("Selected embedding:", embeddings);

    let response;
    if (model === "claude") {
      response = await queryClaudeChain(query);
    } else {
      response = await queryLlamaChain(query, embeddings);
    }

    const pageContentArray = response.sourceDocuments.map(
      (doc) => doc.pageContent,
    );
    const metadataArray = response.sourceDocuments.map((doc) => doc.metadata);

    const aiResponse = {
      message: "Query processed successfully",
      query: query,
      modelResponse: response.text,
      content: pageContentArray,
      metadata: metadataArray,
    };

    console.log("Sending response:", aiResponse);
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 },
    );
  }
}
