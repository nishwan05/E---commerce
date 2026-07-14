# Everest - E-Commerce Project

## Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ⚠️ Important
- Copy your `UPI QR.jpeg` file into `frontend/src/assets/`
- Create `backend/.env` from `.env.example` and fill in your values

## Tech Stack
- **Frontend:** React, Redux Toolkit, Ant Design, AG Grid, Socket.IO Client, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs
