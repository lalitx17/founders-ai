import { ChromaClient, Collection, IEmbeddingFunction, Metadata } from "chromadb";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

let client: ChromaClient | null = null;
let collection: Collection | null = null;

const customEmbeddingFunction = {
  generate: async (texts: any[]) => {
    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddings = await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
    return embeddings.map(embedding => Array.from(embedding.data)); // Convert Tensor to number[]
  }
};

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function initChroma() {
  if (!client) {
    client = new ChromaClient();
  }

  if (!collection) {
    const collections = await client.listCollections();
    if (!collections.find(c => c.name === 'paul_graham_essays')) {
      collection = await client.createCollection({
        name: 'paul_graham_essays',
        embeddingFunction: customEmbeddingFunction,
      });
    } else {
      collection = await client.getCollection({
        name: 'paul_graham_essays',
        embeddingFunction: customEmbeddingFunction,
      });
    }
  }
  return { client, collection };
}

export async function addToChroma(texts: string[], metadatas: { [key: string]: string }[] = []) {
    const { collection } = await initChroma();
  
    const chunkedTexts = await textSplitter.splitDocuments(
      texts.map(text => new Document({ pageContent: text, metadata: {} }))
    );
  
    const ids = chunkedTexts.map((_, i) => `id${i}`);
    const documents = chunkedTexts.map(chunk => chunk.pageContent);
    const expandedMetadatas = chunkedTexts.map((_, index) => ({
      ...metadatas[0], 
      chunkIndex: index.toString()  
    }));
  
    await collection.add({
      ids: ids,
      documents: documents,
      metadatas: expandedMetadatas,
    });
  }
  

export async function queryChroma(queryText: string, numResults = 5) {
  const { collection } = await initChroma();

  const results = await collection.query({
    queryTexts: [queryText],
    nResults: numResults,
  });
  return results;
}
