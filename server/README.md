# 🌍 ReliefConnect Server  
> Backend service for the **Disaster Relief System**, handling product management, inventory synchronization with Chroma Vector DB, and AI-driven product recommendations.


## 🚀 Overview

The **ReliefConnect Server** is the Node.js backend that powers the entire system.  
It manages:
- 🧱 Product CRUD operations (MongoDB)
- 🔄 Real-time sync with **Chroma Vector DB**
- 🧠 AI service integration (via FastAPI)
- 🛒 Order creation and tracking endpoints
- ⚙️ RESTful APIs for the React frontend

# 🧱 Tech Stack
| **Layer** | **Technology** | **Description** |
|------------|----------------|-----------------|
| **Backend Framework** | ⚡ **Express.js (Node.js)** | RESTful server for products, orders, and chat requests |
| **Database** | 🍃 **MongoDB** | Primary storage for products and orders |
| **Vector DB** | 🧠 **ChromaDB (Docker)** | Stores embeddings for semantic product search |
| **AI Integration** | 🧩 **FastAPI Service** | Handles classification, summarization, and vector queries |
| **Language Model** | 🤖 **OpenAI GPT-4o-mini** | Powers recommendations through FastAPI |
| **Data Exchange** | 🌐 **JSON over HTTP** | Communication between frontend, backend, and AI service |

# ⚙️ Project Setup

## 1️⃣ Clone Repository
git clone https://github.com/<your-username>/ReliefConnect.git
cd ReliefConnect/server

## 2️⃣ Install Dependencies
npm install

## 3️⃣ Environment Variables (.env)

Create a .env file in the /server directory:

PORT=5000

MONGO_URI=mongodb://localhost:27017/reliefconnect

CHROMA_URL=http://localhost:8000

AI_SERVICE_URL=http://localhost:8001

OPENAI_API_KEY=your_openai_api_key_here

# 🧠 Chroma Vector DB Setup (Docker)

To run a local ChromaDB instance with persistent storage:

docker run -d --name chroma \
  -p 8000:8000 \
  -v ./chroma-data:/chroma/chroma \
  chromadb/chroma:latest


🗂️ Data will persist inside ./chroma-data/

🧩 Accessible at: http://localhost:8000

# ▶️ Running the Server

Start the Node.js development server with auto-reload:

npm run dev

The server will start at:

👉 http://localhost:5000

# 🔌 API Endpoints

🛒 Products
| **Method** | **Endpoint** | **Description** |
|-------------|--------------|-----------------|
| **POST** | `/api/products` | Create a new product |
| **GET** | `/api/products` | Fetch all products |
| **GET** | `/api/products/:id` | Get product by ID |
| **PUT** | `/api/products/:id` | Update product |
| **DELETE** | `/api/products/:id` | Delete product |

Each product automatically syncs with ChromaDB after creation, update, or deletion.

# 🤖 AI Recommendation
Method	Endpoint	Description
POST	/api/products/recommend	Sends user query to AI Service (FastAPI) for intelligent recommendations

# 📦 Orders
Method	Endpoint	Description
POST	/api/orders	Save user order (with offline fallback support)
GET	/api/orders/:id	Retrieve a specific order

Sample Payload:
```json
{
  "name": "John Doe",
  "address": "123 Relief Street",
  "phone": "555-1234",
  "email": "john@example.com",
  "urgency": "high",
  "payment": {
    "cardLast4": "4321",
    "type": "demo-card"
  },
  "items": [
    { "name": "Emergency Food Kit", "quantity": 1, "price": 35 }
  ],
  "isPackage": true,
  "timestamp": "2025-10-22T18:00:00Z"
}
```

Mock Response (Offline Mode):

```json
{
  "orderId": "offline-0001",
  "status": "created",
  "message": "This is a mock offline order response used when the network is unavailable."
}
```

# 🔄 Real-Time Vector Sync

Chroma updates automatically using Mongoose hooks:

```js
productSchema.post("save", async function(doc) {
  await updateSingleProductIntoChroma(doc);
});

productSchema.post("findOneAndUpdate", async function(doc) {
  await updateSingleProductIntoChroma(doc);
});


productSchema.post("deleteOne", { document: true, query: false }, async function(doc) {
  await deleteProductFromChroma(doc._id.toString());
});

```

This ensures every product stays synced in vector storage for semantic search.

```
📁 Directory Structure
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── product.controller.js
│   └── order.controller.js
├── models/
│   ├── product.js
│   └── order.js
├── routes/
│   ├── product.route.js
│   └── order.route.js
├── services/
│   └── product.service.js
├── vector/
│   ├── chromaClient.js       # Connects to ChromaDB
│   └── realtimeSync.js       # Keeps products synced
├── index.js                  # Entry point
└── package.json
```

# 🧩 Integration Summary
| **Component** | **Port** | **Purpose** |
|----------------|----------|-------------|
| **Node.js Server** | `5000` | API gateway for products & orders |
| **ChromaDB (Docker)** | `8000` | Vector database for semantic search |
| **AI Service (FastAPI)** | `8001` | LLM-powered product recommendation |

# 🧰 Useful Commands
| **Task** | **Command** |
|-----------|-------------|
| **Run Chroma in Docker** | `docker run -d --name chroma -p 8000:8000 -v ./chroma-data:/chroma/chroma chromadb/chroma:latest` |
| **Run Server (Dev Mode)** | `npm run dev` |
| **Install Dependencies** | `npm install` |
| **Check Chroma Health** | Visit [http://localhost:8000/api/v1/heartbeat](http://localhost:8000/api/v1/heartbeat) |



# 🧔 Author
Sanjay Sakthivel
🎓 M.S. Computer Science — Illinois Institute of Technology | 💻 AI-Driven Full Stack Developer

# 📜 License
This project is licensed under the MIT License — see the LICENSE file for details.