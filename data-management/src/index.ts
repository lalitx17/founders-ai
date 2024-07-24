import { initChroma,addToChroma, queryChroma, deleteAllFromChroma } from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";


const google = paulEssays[5].content;



async function main(){
    const {client, collection} = await initChroma();
    console.log('Chroma initialized:', {client, collection});

    const content = [paulEssays[5].title+paulEssays[5].content];

    const metadatas = [];
    const metadataObject = {
        title: paulEssays[5].title,
        url: paulEssays[5].url
    };
    metadatas.push(metadataObject);
    

    await addToChroma(content, metadatas);
    console.log('Text added to Chroma collection');

    const queryText = "what advantage does apple had?";
    const results = await queryChroma(queryText);
    console.log('Query results:', results);
    console.log(results.metadatas);

    // await deleteAllFromChroma();

}

main().catch(console.error);