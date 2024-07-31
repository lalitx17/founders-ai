import { initChroma, addToChroma, getAllFromChroma } from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";
async function main() {
    const { client, collection } = await initChroma();
    console.log('Chroma initialized:', { client, collection });
    for (let i = 0; i < paulEssays.length; i++) {
        const content = [paulEssays[i].content];
        const metadatas = [];
        const metadataObject = {
            title: paulEssays[i].title,
            url: paulEssays[i].url
        };
        metadatas.push(metadataObject);
        await addToChroma(content, metadatas);
    }
    const allDocs = await getAllFromChroma();
    console.log('Total documents:', allDocs.ids.length);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map