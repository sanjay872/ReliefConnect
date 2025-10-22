# 🌍 ReliefConnect  
> **AI-Powered Disaster Relief Management System**  
> Built with **React.js**, **Node.js + Express + MongoDB**, and **FastAPI (AI Service)**

---

## 🧩 Overview

**ReliefConnect** is a full-stack disaster relief management system designed to assist victims and relief organizations through an intelligent AI-powered platform.  
It enables users to:
- 🧠 Get **AI-driven product recommendations** (food, shelter, medicine, etc.)
- 🛒 Place and track **relief orders**
- 🚚 Monitor **shipping status**
- ⚠️ Report **fraudulent activities**

---

## ⚙️ Tech Stack

| **Layer** | **Technology** | **Description** |
|------------|----------------|-----------------|
| **Frontend** | ⚛️ **React.js + Vite** | Interactive UI for users to request aid and track orders |
| **Backend** | ⚡ **Node.js + Express** | Handles products, orders, and integration with AI service |
| **Database** | 🍃 **MongoDB** | Stores user, product, and order data |
| **Vector DB** | 🧠 **ChromaDB (Docker)** | Enables semantic search for product recommendations |
| **AI Engine** | 🧩 **FastAPI + LangGraph + OpenAI GPT-4o-mini** | Powers intelligent intent classification and product suggestions |
| **Data Exchange** | 🌐 **JSON over HTTP** | Connects all services together |

---

## 🚀 Quick Start

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/reliefconnect.git
cd reliefconnect
```

### 2️⃣ Backend Server & AI-Service Setup

Refer to:

[📘 Server README](https://github.com/sanjay872/ReliefConnect/blob/dev/ai-service/README.md)

[🧠 AI-Service README](https://github.com/sanjay872/ReliefConnect/blob/dev/server/README.md)

### 3️⃣ Frontend Setup

Refer to:

[💻 Client README](https://github.com/sanjay872/ReliefConnect/blob/dev/web/README.md)

# 📊 Demo Flow

🧍 User visits the Recommend Page and enters a query (e.g., “I need food and shelter”).

🤖 The AI Service (FastAPI) classifies the intent and searches ChromaDB for matching kits.

🎯 The backend returns a ranked list of relevant relief products.

🛒 The user confirms and fills the Order Form.

📦 An Order ID is generated and stored in MongoDB.

🔍 The user can later track the order or report fraud via the UI.

# 👥 Team Roles
## 🧩 Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| 🧠 **Backend Developer (AI & DB)** | Node.js APIs, MongoDB models, real-time Chroma sync, FastAPI integration |
| 💻 **Frontend Developer (UI/UX)** | React components, chatbot interface, order forms, visual styling |

---

## ⚙️ Key Commands

| Task | Command |
|------|----------|
| 🐳 **Run Chroma in Docker** | `docker run -d --name chroma -p 8000:8000 -v ./chroma-data:/chroma/chroma chromadb/chroma:latest` |
| 🚀 **Run Node.js Server (Dev Mode)** | `npm run dev` |
| 🤖 **Run AI Service (FastAPI)** | `uvicorn app:app --host localhost --port 8001 --reload` |
| 📦 **Install All Dependencies** | `npm install` *(run in both `/server` and `/client` folders)* |
| ❤️ **Check Chroma Health** | Visit [http://localhost:8000/api/v1/heartbeat](http://localhost:8000/api/v1/heartbeat) |

# ✅ Future Enhancements

🤝 User Authentication with JWT (Admin/User roles)

☁️ Cloud Deployment via Render, AWS, or Vercel

🧾 Image Uploads to AWS S3 for fraud reports

📈 Advanced Analytics Dashboard for administrators

🧩 Multi-agent AI System for product matching, order prediction, and fraud detection

# 🧪 Tech Integration Summary
| Component | Port | Purpose |
|------------|------|----------|
| 🟢 **Node.js Server** | `5000` | API gateway for products & orders |
| 🧠 **ChromaDB (Docker)** | `8000` | Vector database for semantic search |
| 🤖 **AI Service (FastAPI)** | `8001` | LLM-powered product recommendation |

# 📜 License
This project was developed as part of CSP584: Enterprise Web Application Development (Final Project) at Illinois Institute of Technology.
It is intended for educational purposes only.

# 👨‍💻 Author

Sanjay Sakthivel
🎓 M.S. Computer Science — Illinois Institute of Technology

Ansh Kaushik
🎓 M.S. Computer Science — Illinois Institute of Technology