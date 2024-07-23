import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChromaClient } from "chromadb";

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

const allCollections = ["paul_graham_essays"]

async function initChroma(collectionName: string) {
  const vectorStore = await Chroma.fromExistingCollection(
    embeddings,
    { collectionName },
  );
  return vectorStore;
}

export async function addToChroma(
  collectionName: string,
  texts: string[],
  metadatas: { [key: string]: string }[] = []
) {
  const vectorStore = await initChroma(collectionName);
  
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const documents = await textSplitter.createDocuments(
    texts,
    metadatas.map((metadata, index) => ({ ...metadata, chunkIndex: index.toString() }))
  );

  await vectorStore.addDocuments(documents);
}

export async function querySomeCollections(
  collectionNames: string[],
  queryText: string,
  numResults = 5
) {
  const allResults = [];

  for (const collectionName of collectionNames) {
    const vectorStore = await initChroma(collectionName);
    const results = await vectorStore.similaritySearch(queryText, numResults);
    allResults.push(...results);
  }

  allResults.sort((a, b) => (b.metadata.score || 0) - (a.metadata.score || 0));

  return allResults.slice(0, numResults);
}


export async function queryAllCollections(queryText: string, numResults = 5) {
  const allResults = [];


  for (const collection of allCollections) {
    const vectorStore = await initChroma(collection);
    const results = await vectorStore.similaritySearch(queryText, numResults);
    
    results.forEach(result => {
      result.metadata.collectionName = collection;
    });
    
    allResults.push(...results);
  }
  allResults.sort((a, b) => (b.metadata.score || 0) - (a.metadata.score || 0));
  return allResults.slice(0, numResults);
}
