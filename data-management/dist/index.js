import { initChroma, getAllFromChroma } from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";
const google = paulEssays[5].content;
async function main() {
    const { client, collection } = await initChroma();
    console.log('Chroma initialized:', { client, collection });
    const allDocs = await getAllFromChroma();
    console.log('Total documents:', allDocs.ids.length);
    const essayGroups = allDocs.ids.reduce((groups, id, index) => {
        const metadata = allDocs.metadatas[index];
        const title = metadata?.title;
        if (!groups[title]) {
            groups[title] = [];
        }
        groups[title].push({
            id,
            metadata,
            content: allDocs.documents[index]
        });
        return groups;
    }, {});
    Object.entries(essayGroups).forEach(([title, chunks], essayIndex) => {
        console.log(`Essay ${essayIndex + 1}: ${title}`);
        console.log(`Number of chunks: ${chunks.length}`);
    });
}
main().catch(console.error);
//# sourceMappingURL=index.js.map