To run docker instance of chroma with volume attached.

docker run -d --name chroma  -p 8000:8000 -v ./chroma-data:/chroma/chroma chromadb/chroma:latest

Run server - npm run dev
