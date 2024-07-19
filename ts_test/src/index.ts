import { initChroma,addToChroma, queryChroma } from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";


const google = paulEssays[5].content;



async function main(){
    const {client, collection} = await initChroma();
    console.log('Chroma initialized:', {client, collection});


    // const content = paulEssays[5].content.split('/n');
    
    

    const content = [paulEssays[5].content];

    const metadatas = [];
    const metadataObject = {
        title: paulEssays[5].title,
        url: paulEssays[5].url
    };
    metadatas.push(metadataObject);
    

    await addToChroma(content, metadatas);
    console.log('Text added to Chroma collection');

    const queryText = "What does Paul Graham write about?";
    const results = await queryChroma(queryText);
    console.log('Query results:', results);

}

main().catch(console.error);