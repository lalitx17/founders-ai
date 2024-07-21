// lib/customRetriever.ts
import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { queryChroma } from "./chroma-client";

export class CustomChromaRetriever extends BaseRetriever {
  lc_namespace = ["custom", "retriever"];

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const results = await queryChroma(query);
    const documents = results.documents[0].filter((doc: string | null): doc is string => doc !== null);
    return documents.map((doc: string, index: number) => 
      new Document({
        pageContent: doc,
        metadata: results.metadatas[0][index] || {}
      })
    );
  }
}
