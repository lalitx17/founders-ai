import { initChroma, addToChroma } from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";
const google = paulEssays[5].content;
async function main() {
    const { client, collection } = await initChroma();
    console.log('Chroma initialized:', { client, collection });
    for (let i = 0; i < 225; i++) {
        const content = [paulEssays[i].title + paulEssays[i].content];
        const metadatas = [];
        const metadataObject = {
            title: paulEssays[i].title,
            url: paulEssays[i].url
        };
        metadatas.push(metadataObject);
        await addToChroma(content, metadatas);
        console.log(i + " essays added.");
    }
}
main().catch(console.error);
//# sourceMappingURL=index.js.map