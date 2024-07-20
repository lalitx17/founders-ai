

// export async function embeddingFunction(texts: string[]) {
//     const { pipeline } = await import('@xenova/transformers');
//     const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
//     try {
//       const embeddings = await Promise.all(texts.map(text => embedder(text, { pooling: 'mean', normalize: true })));
//       console.log(embeddings);
//       return embeddings;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }
