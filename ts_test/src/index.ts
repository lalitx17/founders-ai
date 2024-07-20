// index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { initChroma, addToChroma, queryChroma, deleteAllFromChroma } from './chroma-client.js'; // Adjust the import path as necessary

const PORT = process.env.PORT || 3005;
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize Chroma when the server starts
initChroma().catch(console.error);

// Route to query embeddings
app.post('/api/embeddings', async (req: Request, res: Response) => {
  try {
    const { query } = req.body as { query: string };
    const results = await queryChroma(query, 5);
    res.json({ results });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// Route to add documents to Chroma
app.post('/api/add-documents', async (req: Request, res: Response) => {
  try {
    const { texts, metadatas } = req.body as { texts: string[], metadatas: { [key: string]: string }[] };
    await addToChroma(texts, metadatas);
    res.json({ message: 'Documents added successfully' });
  } catch (error) {
    console.error('Error adding documents:', error);
    res.status(500).json({ error: 'Failed to add documents' });
  }
});

// Route to delete all collections
app.delete('/api/delete-all', async (req: Request, res: Response) => {
  try {
    await deleteAllFromChroma();
    res.json({ message: 'All collections deleted successfully' });
  } catch (error) {
    console.error('Error deleting collections:', error);
    res.status(500).json({ error: 'Failed to delete collections' });
  }
});

// Start the Express server
app.listen(PORT, (err?: Error) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${PORT}`);
});
