import { ChromaClient } from "chromadb";
import { Document } from "langchain/document";
let client = null;
let collection = null;
const customEmbeddingFunction = {
    generate: async (texts) => {
        const { pipeline } = await import('@xenova/transformers');
        const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const embeddings = await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
        return embeddings.map((embedding) => Array.from(embedding.data));
    }
};
function wordTokenizer(text, maxWords, overlap) {
    const words = text.split(/\s+/);
    const chunks = [];
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
        }
        else {
            collection = await client.getCollection({
                name: 'paul_graham_essays',
                embeddingFunction: customEmbeddingFunction,
            });
        }
    }
    return { client, collection };
}
export async function addToChroma(texts, metadatas = []) {
    const { collection } = await initChroma();
    const maxWords = 250;
    const overlapWords = 50;
    const chunkedTexts = texts.flatMap(text => wordTokenizer(text, maxWords, overlapWords).map(chunk => new Document({ pageContent: chunk, metadata: {} })));
    const ids = chunkedTexts.map((_, i) => `id${i}`);
    const documents = chunkedTexts.map(chunk => chunk.pageContent);
    const expandedMetadatas = chunkedTexts.map((_, index) => ({
        ...metadatas[0],
        chunkIndex: index.toString()
    }));
    console.log(documents);
    await collection.add({
        ids: ids,
        documents: documents,
        metadatas: expandedMetadatas,
    });
}
export async function queryChroma(queryText, numResults = 10) {
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
    }
    catch (error) {
        console.error("Error deleting collections:", error);
        throw error;
    }
}
//# sourceMappingURL=chroma-client.js.map