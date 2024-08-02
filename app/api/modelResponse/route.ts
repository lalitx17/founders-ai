import { NextResponse } from "next/server";
import { queryChain } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    console.log("Received query:", query);

    const response = await queryChain(query);

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
