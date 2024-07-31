"use client"

import { useState } from "react";
import ReactMarkdown from 'react-markdown';

interface MetaDataType {
  chunkIndex: string;
  title: string;
  url: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<MetaDataType[]>([]);
  const [AIresponse, setAIresponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/modelResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setContent(data.content);
      setMetadata(data.metadata);
      setAIresponse(data.modelResponse);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateContent = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mt-14 mb-4 text-black">Founders-AI</h1>
      <p className="mb-6 text-gray-700">AI-powered search & chat for Startup Founders.</p>
      
      <div className="flex w-full max-w-md">
        <input
          type="text"
          className="flex-grow p-2 border text-black border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="mt-6 w-full max-w-2xl">
        {isLoading ? (
          <p className="text-gray-500 text-center">Loading results...</p>
        ) : (
          <>
            {AIresponse && (
              <div className="bg-white shadow-md rounded-md p-4 mb-6">
                <h2 className="text-xl font-semibold mb-2 text-black">AI Response</h2>
                <div className="text-gray-600 prose">
                  <ReactMarkdown>{AIresponse}</ReactMarkdown>
                </div>
              </div>
            )}
            
            {content.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4 text-black">Related Documents</h2>
                {content.map((item, index) => (
                  <div key={index} className="bg-white shadow-md rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-2 text-black">{metadata[index].title}</h3>
                    <p className="text-gray-600 mb-2">{truncateContent(item, 100)}</p>
                    <a
                      href={metadata[index].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Read more
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && <p className="text-gray-500 text-center">No results found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
