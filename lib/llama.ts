import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";

const llamaPath = "/home/lalit/models/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf";

function getEmbeddingType(embeddingType: string) {
  if (embeddingType === "ada") {
    return new OpenAIEmbeddings({
      modelName: "text-embeddings-ada-002",
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    return new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    });
  }
}

async function initChroma(collectionName: string, embeddings: any) {
  return await Chroma.fromExistingCollection(embeddings, { collectionName });
}

async function getAllDocumentsFromCollection(
  query: string,
  store: Chroma,
  embeddings: any,
): Promise<[Document, number][]> {
  const queryVector = await embeddings.embedQuery(query);
  const result = await store.similaritySearchVectorWithScore(
    queryVector,
    100000,
  );
  console.log(result);
  return result;
}

async function setupChain(query: string, embeddingType: string) {
  const embeddings = getEmbeddingType(embeddingType);
  const collections = ["paul_graham_essays"];
  const vectorStores = await Promise.all(
    collections.map((collectionName) => initChroma(collectionName, embeddings)),
  );

  let allDocumentsWithScores: [Document, number][] = [];
  for (const store of vectorStores) {
    const docsWithScores = await getAllDocumentsFromCollection(
      query,
      store,
      embeddings,
    );
    allDocumentsWithScores = allDocumentsWithScores.concat(docsWithScores);
  }

  // Sort all documents by similarity score in descending order
  allDocumentsWithScores.sort((a, b) => b[1] - a[1]);

  console.log(
    "All documents with scores (sorted):",
    allDocumentsWithScores.slice(0, 10),
  );

  // Take top 10 documents
  const topDocuments = allDocumentsWithScores.slice(0, 10).map(([doc]) => doc);

  const combinedCollectionName = `combined_collection_${Date.now()}`;

  // Create a new combined vector store with top 10 documents
  const combinedVectorStore = await Chroma.fromDocuments(
    topDocuments,
    embeddings,
    { collectionName: combinedCollectionName },
  );

  // Initialize LLaMa model
  const model = new LlamaCpp({
    modelPath: llamaPath,
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.3,
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

export async function queryLlamaChain(query: string, embeddingType: string) {
  const chain = await setupChain(query, embeddingType);
  const response = await chain.invoke({ input: query, question: query });
  return {
    text: response.answer,
    sourceDocuments: response.context,
  };
}
