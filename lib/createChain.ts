// lib/createChain.ts
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { CustomChromaRetriever } from "./customRetriever";

export async function createSummarizationChain(llm) {
  const retriever = new CustomChromaRetriever();

  const prompt = PromptTemplate.fromTemplate(`
    Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    
    Context: {context}
    
    Question: {question}
    
    Answer:
  `);

  const chain = RunnableSequence.from([
    {
      context: retriever.getRelevantDocuments,
      question: (input) => input.question,
    },
    {
      context: (previousOutput) => previousOutput.context.map((doc) => doc.pageContent).join("\n\n"),
      question: (previousOutput) => previousOutput.question,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  return chain;
}
