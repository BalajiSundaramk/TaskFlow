# TaskFlow — Personal Productivity Capture Tool

TaskFlow is a full-stack web application that helps users capture and organize
tasks, notes, and reminders through natural language input. The goal was to
remove friction from the capture process — instead of picking categories from
dropdowns, you just type naturally and the app figures out what you mean.

## Solution Approach

The core of the app is an intent detection engine that classifies every input
as a task, note, or reminder based on keyword patterns. From there, chrono-node
parses any dates mentioned in the text so reminders automatically get a due
time. Tags are extracted from hashtags and topic keywords in the content.

The frontend is a single-page React app with client-side filtering for instant
search. The backend is a REST API built with Express and SQLite. Authentication
uses JWT tokens with bcrypt password hashing. An admin panel handles user
management with role-based access control.

## Features

- Natural language capture with automatic intent detection
- Voice input via Web Speech API
- Chat-style capture interface
- Quick-add modal with Ctrl+K shortcut
- Semantic tag extraction from content
- Reminder scheduling with natural date parsing
- Browser notifications with snooze options
- Separate views for tasks, notes, and reminders
- Summary dashboard with charts and smart text summary
- User authentication with JWT and bcrypt
- Admin panel with user management and platform statistics
- Dark mode with localStorage persistence
- Responsive layout for mobile and desktop

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios
- Backend: Node.js, Express
- Database: SQLite with better-sqlite3
- Authentication: JWT, bcryptjs
- Date parsing: chrono-node

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git

## Setup Instructions

Clone the repository:

```bash
git clone https://github.com/BalajiSundaramk/TaskFlow
cd TaskFlow
```

Install and run the backend:

```bash
cd server
npm install
node db/init.js
node index.js
```

Server runs on http://localhost:5000

Open a new terminal and run the frontend:

```bash
cd client
npm install
npm run dev
```

App runs on http://localhost:5173

## Default Admin Account

Email: admin@taskflow.com  
Password: Admin@1234

## Dependencies

**Server**
- express
- cors
- better-sqlite3
- bcryptjs
- jsonwebtoken
- chrono-node
- dotenv

**Client**
- react
- react-dom
- react-router-dom
- axios
- date-fns
- vite

## Project Structure

TaskFlow/

├── client/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── utils/

│   │   └── App.jsx

│   └── vite.config.js

├── server/

│   ├── db/

│   ├── middleware/

│   ├── routes/

│   └── index.js

└── README.md

 ## Website is Live on -- https://taskflow-mn89.onrender.com/login

## Demo Video

