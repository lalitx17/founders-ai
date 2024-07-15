import { ChromaClient, Collection, IEmbeddingFunction, Metadata } from "chromadb";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";


let client: ChromaClient | null = null;
let collection: Collection | null = null;


const customEmbeddingFunction: IEmbeddingFunction = {
    generate: async (texts: string[]) => {
      const { pipeline } = await import('@xenova/transformers');
      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      return await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
    }
  };


  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, 
    chunkOverlap: 200,
  })


export async function initChroma(){
    if (!client){
        client = new ChromaClient();
    }

    if (!collection){
        const collections = await client.listCollections();
        if (!collections.find(c => c.name === 'paul_graham_essays')){
            collection = await client.createCollection({
                name: 'paul_graham_essays',
                embeddingFunction: customEmbeddingFunction,
            })
        }else{
            collection = await client.getCollection({
                name: 'paul_graham_essays',
                embeddingFunction: customEmbeddingFunction,
            })
        }
    }
    return { client, collection };
}

export async function addToChroma(texts: string[], metadatas: Metadata[] = []){
    const {collection} = await initChroma();

    const chunkedTexts = await textSplitter.splitDocuments(
        texts.map(text => new Document({ pageContent: text, metadata: {} }))
      );


    await collection.add({
        ids: chunkedTexts.map((_, i) => `id${i}`),
        documents: chunkedTexts.map(chunk => chunk.pageContent),
        metadatas: metadatas.length? metadatas : chunkedTexts.map(chunk => chunk.metadata),
    })

}

export async function queryChroma(queryText: string, numResults: number = 5){
    const { collection }  = await initChroma();

    const results = await collection.query({
        queryTexts: [queryText], 
        nResults: numResults,
    }); 
    return results;
}