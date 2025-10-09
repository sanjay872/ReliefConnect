# ReliefConnect
ReliefConnect is a Disaster Relief System built with React.js (frontend) and Node.js + Express + MongoDB (backend). It provides an AI-powered virtual customer service to recommend relief resources, manage orders, track shipping status, and report fraud in disaster relief operations.

---
```bash
git clone https://github.com/your-username/reliefconnect.git
cd reliefconnect
```


### 2. Backend Setup
```bash
cd server
npm install
```


Create a `.env` file in `server/` with:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```


Run the backend:
```bash
npm start
```


### 3. Frontend Setup
```bash
cd ../web
npm install
```


Run the frontend:
```bash
npm start
```


Frontend will run on `http://localhost:3000` and backend on `http://localhost:5000`.


---


## 🌐 API Endpoints


| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recommend` | POST | Get AI-powered disaster relief recommendation |
| `/api/order` | POST | Place an order (request) |
| `/api/order/:id` | GET | Fetch order details by ID |
| `/api/status` | POST | Upload image, get refund/replace/escalate decision |
| `/api/fraud` | POST | Report fraudulent transaction |


---


## 📊 Demo Flow


1. User visits **Recommend Page** and enters needs (e.g., “food”, “shelter”).
2. Backend AI Agent suggests the best service.
3. User confirms and completes an order form.
4. System stores the request and generates an **Order ID**.
5. Later, user can **track status** or **report fraud** with supporting images.


---


## 👥 Team Roles


- **Backend Developer (AI & DB)**: Node.js APIs, MongoDB models, AI service integration.
- **Frontend Developer (UI/UX)**: React pages, API integration, form validation, styling.


---


## ✅ Future Enhancements
- Real AI integration with OpenAI/Hugging Face.
- JWT authentication for users and admins.
- Cloud deployment (Vercel + Render/Heroku).
- File storage with AWS S3 for uploaded images.
- Role-based access control (admin vs. customer).


---


## 📜 License
This project is for educational purposes only (CSP584 Final Project).
