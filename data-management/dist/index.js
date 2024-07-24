import express from 'express';
import cors from 'cors';
import { initChroma, addToChroma, queryChroma, deleteAllFromChroma } from './chroma-client.js';
const PORT = process.env.PORT || 3005;
const app = express();
app.use(cors());
app.use(express.json());
initChroma().catch(console.error);
app.post('/api/embeddings', async (req, res) => {
    try {
        const { query } = req.body;
        const results = await queryChroma(query, 5);
        res.json({ results });
    }
    catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Failed to process query' });
    }
});
app.post('/api/add-documents', async (req, res) => {
    try {
        const { texts, metadatas } = req.body;
        await addToChroma(texts, metadatas);
        res.json({ message: 'Documents added successfully' });
    }
    catch (error) {
        console.error('Error adding documents:', error);
        res.status(500).json({ error: 'Failed to add documents' });
    }
});
app.delete('/api/delete-all', async (req, res) => {
    try {
        await deleteAllFromChroma();
        res.json({ message: 'All collections deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting collections:', error);
        res.status(500).json({ error: 'Failed to delete collections' });
    }
});
app.listen(PORT, (err) => {
    if (err)
        throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map