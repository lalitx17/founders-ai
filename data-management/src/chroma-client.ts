import { ChromaClient, Collection, IEmbeddingFunction, IncludeEnum, Metadata } from "chromadb";
import { Document } from "langchain/document";

let client: ChromaClient | null = null;
let collection: Collection | null = null;

const customEmbeddingFunction = {
  generate: async (texts: any[]) => {
    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddings = await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
    return embeddings.map((embedding: { data: Iterable<unknown> | ArrayLike<unknown>; }) => Array.from(embedding.data));
  }
};

// Simple word tokenizer function
function wordTokenizer(text: string, maxWords: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += maxWords - overlap) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

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
  const maxWords = 250;
  const overlapWords = 50;
  
  let globalChunkIndex = 0;
  for (let textIndex = 0; textIndex < texts.length; textIndex++) {
    const text = texts[textIndex];
    const chunks = wordTokenizer(text, maxWords, overlapWords);
    console.log(`Essay ${textIndex + 1} split into ${chunks.length} chunks`);

    const ids = chunks.map((_, i) => `essay${textIndex}_chunk${i}`);
    const documents = chunks;
    const expandedMetadatas = chunks.map((_, index) => ({
      ...metadatas[textIndex],
      chunkIndex: (globalChunkIndex + index).toString(),
      totalChunks: chunks.length.toString()
    }));

    await collection.add({
      ids: ids,
      documents: documents,
      metadatas: expandedMetadatas,
    });

    globalChunkIndex += chunks.length;
  }
  
  console.log(`Total chunks added: ${globalChunkIndex}`);
}

export async function queryChroma(queryText: string, numResults = 10) {
  const { collection } = await initChroma();
  const results = await collection.query({
    queryTexts: [queryText],
    nResults: numResults,
  });
  return results;
}

export async function deleteAllFromChroma() {
  const { client } = await initChroma();
  try {
    const collections = await client.listCollections();
    for (const collectionInfo of collections) {
      await client.deleteCollection({
        name: collectionInfo.name,
      });
      console.log(`Deleted collection: ${collectionInfo.name}`);
    }
    console.log("All collections have been deleted from the Chroma server.");
    collection = null;
  } catch (error) {
    console.error("Error deleting collections:", error);
    throw error;
  }
}

export async function getAllFromChroma() {
  const { collection } = await initChroma();
  if (!collection) {
    throw new Error("Collection not initialized");
  }
  try {
    const count = await collection.count();
    console.log(`Total documents in collection: ${count}`);
    const allDocs = await collection.get({
      limit: count,
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Embeddings]
    });
    return {
      ids: allDocs.ids,
      documents: allDocs.documents,
      metadatas: allDocs.metadatas,
      embeddings: allDocs.embeddings
    };
  } catch (error) {
    console.error('Error getting all documents from Chroma:', error);
    throw error;
  }
}
