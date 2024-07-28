import { deleteAllFromChroma } from "./chroma-client.js";
import { paulEssays } from "./data/paul_graham_essays.js";
const google = paulEssays[5].content;
async function main() {
    await deleteAllFromChroma();
}
main().catch(console.error);
//# sourceMappingURL=index.js.map