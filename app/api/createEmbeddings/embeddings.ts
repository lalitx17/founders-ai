import { paulEssays } from "@/data/paul_graham_essays";

import { pipeline } from "@xenova/transformers";

export async function createEmbeddings(){
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const texts = ["Hello world", "This is a simple embedding example"];

    try{
        const embeddings = await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
        return embeddings;

    }catch(error){
        console.log(error);
    }
}
