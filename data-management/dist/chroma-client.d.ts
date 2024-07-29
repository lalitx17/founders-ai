import { ChromaClient, Collection, Metadata } from "chromadb";
export declare function initChroma(): Promise<{
    client: ChromaClient;
    collection: Collection;
}>;
export declare function addToChroma(texts: string[], metadatas?: {
    [key: string]: string;
}[]): Promise<void>;
export declare function queryChroma(queryText: string, numResults?: number): Promise<import("chromadb").QueryResponse>;
export declare function deleteAllFromChroma(): Promise<void>;
export declare function getAllFromChroma(): Promise<{
    ids: import("chromadb").IDs;
    documents: (string | null)[];
    metadatas: (Metadata | null)[];
    embeddings: import("chromadb").Embeddings | null;
}>;
