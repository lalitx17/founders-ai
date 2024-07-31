import { LlamaCpp } from "@langchain/community/llms/llama_cpp";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";

const llamaPath = "/home/lalit/models/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf";

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

async function initChroma(collectionName: string) {
  return await Chroma.fromExistingCollection(embeddings, { collectionName });
}


async function getAllDocumentsFromCollection(query: string, store: Chroma): Promise<Document[]> {
  const result = await store.similaritySearch(query, 10);
  console.log(result);
  return result;
}

async function setupChain(query: string) {
  const collections = ["paul_graham_essays"];
  const vectorStores = await Promise.all(
    collections.map(collectionName => initChroma(collectionName))
  );

  let allDocuments: Document[] = [];
  for (const store of vectorStores) {
    const docs = await getAllDocumentsFromCollection(query, store);
    allDocuments = allDocuments.concat(docs);
  }

  // Create a temporary Chroma instance with all documents
  const tempVectorStore = await Chroma.fromDocuments(
    allDocuments,
    embeddings,
    { collectionName: "temp_collection" }
  );

  // Perform similarity search on all documents
  const searchResults = await tempVectorStore.similaritySearchWithScore(query, allDocuments.length);


  const topDocuments = searchResults
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(item => item[0]);

  // Create a new combined vector store with top 50 documents
  const combinedVectorStore = await Chroma.fromDocuments(
    topDocuments,
    embeddings,
    { collectionName: "combined_collection" }
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



export async function queryChain(query: string) {
  const chain = await setupChain(query);
  const response = await chain.invoke({ input: query, question: query });
  
  return {
    text: response.answer,
    sourceDocuments: response.context,
  };
}