import { ChatAnthropic } from "@langchain/anthropic";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";

// You'll need to set your Anthropic API key in your environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

async function initChroma(collectionName: string) {
  return await Chroma.fromExistingCollection(embeddings, { collectionName });
}

async function getAllDocumentsFromCollection(
  query: string,
  store: Chroma,
): Promise<[Document, number][]> {
  const result = await store.similaritySearchWithScore(query, 100000);
  console.log(result);
  return result;
}

async function setupChain(query: string) {
  const collections = ["paul_graham_essays"];
  const vectorStores = await Promise.all(
    collections.map((collectionName) => initChroma(collectionName)),
  );
  let allDocumentswithScores: [Document, number][] = [];
  for (const store of vectorStores) {
    const docsWithScores = await getAllDocumentsFromCollection(query, store);
    allDocumentswithScores = allDocumentswithScores.concat(docsWithScores);
  }

  allDocumentswithScores.sort((a, b) => b[1] - a[1]);

  console.log("All documents with scores (sorted):", allDocumentswithScores);

  const topDocuments = allDocumentswithScores.slice(0, 10).map(([doc]) => doc);

  const combinedCollectionName = `combined_collection_${Date.now()}`;

  const combinedVectorStore = await Chroma.fromDocuments(
    topDocuments,
    embeddings,
    { collectionName: combinedCollectionName },
  );

  // Initialize Claude 3.5 Sonnet model
  const model = new ChatAnthropic({
    modelName: "claude-3-sonnet-20240229",
    anthropicApiKey: ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Create a custom prompt template
  const prompt = ChatPromptTemplate.fromTemplate(`
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Context: {context}
Question: {question}
Please provide a detailed and comprehensive answer:
  `);

  // Create the combine documents chain
  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });

  // Create the retriever
  const retriever = combinedVectorStore.asRetriever();

  // Create the retrieval chain
  const retrievalChain = await createRetrievalChain({
    combineDocsChain,
    retriever,
  });

  return retrievalChain;
}

export async function queryClaudeChain(query: string) {
  const chain = await setupChain(query);
  const response = await chain.invoke({ input: query, question: query });
  return {
    text: response.answer,
    sourceDocuments: response.context,
  };
}
