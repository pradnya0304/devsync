#  DevSync — Real-Time Collaborative Code Review Platform

![DevSync Banner](https://img.shields.io/badge/DevSync-Real--Time%20Code%20Review-b347ea?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

> **Code together. Review faster. Ship better.**

DevSync is a full-stack real-time collaborative code review platform built for modern development teams. It allows multiple developers to write, review, and comment on code simultaneously — directly in the browser, no installation required.

🔗 **Live Demo:** [https://devsync-swart.vercel.app](https://devsync-swart.vercel.app)

---

##  Features

-  **Real-Time Code Editor** — Monaco Editor (same as VS Code) with live multi-user sync via Socket.io
-  **Inline Review Comments** — Click any line, leave a comment, persisted in MongoDB
-  **Live Presence** — See who's online in the session in real time
-  **Session Sharing** — Share a session link with anyone, they join instantly in browser
-  **Dashboard Analytics** — Track total sessions, active sessions, and languages used
-  **JWT Authentication** — Secure register/login with bcrypt password hashing
-  **Auto-Save** — Code auto-saves to MongoDB 2 seconds after typing stops
-  **Stunning UI** — Glassmorphism dark theme with violet & pink gradients
-  **Fully Responsive** — Works on mobile, tablet, and desktop

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI framework |
| React Router | Client-side routing |
| Socket.io Client | Real-time communication |
| Monaco Editor | VS Code-like code editor |
| Axios | HTTP requests |
| CSS3 | Glassmorphism styling |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| Socket.io | WebSocket real-time engine |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

##  Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/pradnya0304/devsync.git
cd devsync
```

2. **Setup Backend**
```bash
cd server
npm install
```

3. **Create `.env` file in server folder**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. **Setup Frontend**
```bash
cd ../client
npm install
```

5. **Run the app**

In one terminal:
```bash
cd server
npm run dev
```

In another terminal:
```bash
cd client
npm start
```

6. **Open** `http://localhost:3000`

---

##  Project Structure
devsync/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Editor.jsx
│   │   └── App.js
│   └── public/
│
└── server/                    # Node.js Backend
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── sessionController.js
│   └── commentController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   ├── Session.js
│   └── Comment.js
├── routes/
│   ├── auth.js
│   ├── sessions.js
│   └── comments.js
├── socket/
│   └── socketHandler.js
└── server.js
