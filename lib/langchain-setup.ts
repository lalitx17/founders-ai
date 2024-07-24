// langchain-setup.ts

import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";

const llamaPath = "/home/lalit/models/llama-2-7b.Q6_K.gguf";

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

async function initChroma(collectionName: string) {
  return await Chroma.fromExistingCollection(embeddings, { collectionName });
}

async function getAllDocumentsFromCollection(store: Chroma): Promise<Document[]> {
  // This function attempts to retrieve all documents from a collection
  // We use a large number for k to try and get all documents
  // You may need to adjust this based on your collection size
  const result = await store.similaritySearch("", 10000);
  return result;
}

async function setupChain() {
  // Initialize Chroma client for all collections
  const collections = ["paul_graham_essays"]; // Add more collection names as needed
  const vectorStores = await Promise.all(
    collections.map(collectionName => initChroma(collectionName))
  );

  // Combine all documents from different collections
  let allDocuments: Document[] = [];
  for (const store of vectorStores) {
    const docs = await getAllDocumentsFromCollection(store);
    allDocuments = allDocuments.concat(docs);
  }

  // Create a new combined vector store
  const combinedVectorStore = await Chroma.fromDocuments(
    allDocuments,
    embeddings,
    { collectionName: "combined_collection" }
  );

  // Initialize LLaMa model
  const model = new LlamaCpp({
    modelPath: llamaPath,
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    contextSize: 4096,
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

export async function queryChain(query: string) {
  const chain = await setupChain();
  const response = await chain.invoke({ input: query, question: query });
  
  return {
    text: response.answer,
    sourceDocuments: response.context,
  };
}