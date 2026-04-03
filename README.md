# Expense Tracker 💰

A beautiful, sleek, and robust Expense Tracker application built with the **MERN Stack** (MongoDB, Express, React-style vanilla JS, Node.js). 

This project allows users to securely create an account, log in, and track their daily expenses across multiple categories.

## ✨ Features
- **Secure Authentication**: Strict email validation and secure JSON Web Tokens (JWT) mapped uniquely to each user.
- **Data Persistence**: All added, updated, and deleted expenses are permanently saved to a MongoDB cloud database.
- **Dynamic Dashboard**: Live summary of total expenses and total spent this month.
- **Search & Filter**: Search locally through your expenses by name or filter down by specific categories.
- **Modern UI**: Smooth animations, robust state handling, and a cohesive design system using rich aesthetics.

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript
- **Backend / API**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## 🚀 Running Locally

Want to run this project on your own machine? Follow these steps:

### 1. Backend Setup
Navigate into the backend directory:
```bash
cd backend
```

Install the required dependencies:
```bash
npm install
```

Create a `.env` file in the `backend/` directory, and add your MongoDB connection string and a random JWT Secret:
```env
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster.mongodb.net/?retryWrites=true&w=majority
PORT=8000
JWT_SECRET=super_secret_key
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
In the main directory, edit `script.js` to point to your `localhost` API:
```javascript
// Change this line back to localhost when testing locally!
const API = "http://localhost:8000/api";
```

Finally, open the `index.html` file in your preferred web browser or use a Live Server extension in VS Code.

## 🌐 Deployment
The backend for this project is configured to automatically deploy on **Render.com** directly out of the GitHub repository.

Enjoy tracking your expenses! 🚀
