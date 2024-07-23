# Founders-AI

An AI-powered application that provides startup advice using Retrieval-Augmented Generation (RAG).

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Embedding Models**: 
  - Local: Xenova/all-MiniLM-L6-v2
  - Remote: OpenAI
- **Vector Databases**:
  - Local: Chroma
  - Remote: Pinecone
- **Language Model**: Yet to choose.(*prolly the cheapest one*)

## Features

- Provides tailored startup advice based on user queries
- Utilizes RAG for more accurate and context-aware responses
- Supports both local and remote operation

## Prerequisites

- Node.js (v14 or later)
- Docker
- npm or yarn

## Getting Started

1. Clone the repository:
```
git clone https://github.com/lalitx17/founders-ai.git
cd founders-ai
```

2. Install dependencies:
```
npm install
```

3. Start the Chroma server (local vector database):
```
sudo docker run -p 8000:8000 chromadb/chroma
```

3. Download a local llama Models(.gguf required)
```
huggingface-cli login
huggingface-cli download TheBloke/Llama-2-7B-GGUF llama-2-7b.Q6_K.gguf --local-dir ./models
```

4. Create a `.env` file in the root directory and add your API keys:
```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
```

5. Run the development server:
```
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure



## Contributing



## License

