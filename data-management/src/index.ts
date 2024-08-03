import {
  initChroma,
  addToChroma,
  queryChroma,
  deleteAllFromChroma,
  getAllFromChroma,
} from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";

async function main() {
  const { client, collection } = await initChroma();
  console.log("Chroma initialized:", { client, collection });

  for (let i = 0; i < paulEssays.length; i++) {
    const content = [paulEssays[i].content];

    const metadatas = [];
    const metadataObject = {
      title: paulEssays[i].title,
      url: paulEssays[i].url,
    };
    metadatas.push(metadataObject);

    await addToChroma(content, metadatas);
  }

  // const queryText = "what advantage does apple had?";
  // const results = await queryChroma(queryText);
  // console.log('Query results:', results);
  // console.log(results.metadatas);

  // await deleteAllFromChroma();

  const allDocs = await getAllFromChroma();
  console.log("Total documents:", allDocs.ids.length);

  // Group chunks by their original essay

  // const essayGroups = allDocs.ids.reduce((groups, id, index) => {
  //   const metadata = allDocs.metadatas[index];
  //   const title = metadata?.title;
  //   //@ts-ignore
  //   if (!groups[title]) {
  //   //@ts-ignore
  //     groups[title] = [];
  //   }
  //   //@ts-ignore
  //   groups[title].push({
  //     id,
  //     metadata,
  //     content: allDocs.documents[index]
  //   });
  //   return groups;
  // }, {});

  // // Print information about each essay and its chunks
  // Object.entries(essayGroups).forEach(([title, chunks], essayIndex) => {
  //   console.log(`Essay ${essayIndex + 1}: ${title}`);
  //   //@ts-ignore
  //   console.log(`Number of chunks: ${chunks.length}`);
  //   //@ts-ignore
  //   // chunks.forEach((chunk, chunkIndex) => {
  //   //   console.log(`  Chunk ${chunkIndex + 1}:`);
  //   //   console.log(`    ID: ${chunk.id}`);
  //   //   console.log(`    Metadata: ${JSON.stringify(chunk.metadata, null, 2)}`);
  //   //   console.log(`    Content: ${chunk.content.substring(0, 100)}...`);
  //   // });
  //   // console.log('---');
  // });
}

main().catch(console.error);
