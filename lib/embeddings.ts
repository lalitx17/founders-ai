import { paulEssays } from "@/data/paul_graham_essays";
import { ChromaClient } from "chromadb";

export async function createEmbeddings() {
    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const texts = ["Hello world", "This is a simple embedding example"];
    try {
      const embeddings = await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
      console.log(embeddings);
      return embeddings;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
