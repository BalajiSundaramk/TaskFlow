# TaskFlow

TaskFlow is a lightweight personal productivity capture tool for quickly recording tasks, notes, and reminders. It provides a minimal interface to capture thoughts, extract basic tags, and surface a simple summary dashboard.

Built for speed and clarity, TaskFlow uses React + Vite for the frontend, Node.js + Express for the backend, and a local SQLite database for persistence. The UI supports light and dark themes, mobile-friendly layout, and simple voice capture using the browser Speech API.

Features

- Fast capture textarea with intent detection (task/note/reminder)
- Hashtag and keyword tag extraction
- Server-backed persistence using SQLite (better-sqlite3)
- List, update (complete), and delete items
- Reminders support and overdue highlighting
- Summary dashboard with key metrics
- Light and dark themes and responsive layout

Folder structure

```
.
├─ client/               # Vite + React frontend
│  ├─ index.html
│  ├─ package.json
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ App.css
│     ├─ components/
│     └─ utils/
└─ server/
   ├─ index.js
   └─ db/
      ├─ schema.sql
      ├─ init.js
      └─ database.js
```

Setup

1. Initialize the database (from project root):

```bash
node server/db/init.js
```

2. Start the server:

```bash
node server/index.js
```

3. In a separate terminal, start the client (from `client/`):

```bash
cd client
npm install
npm run dev
```

Demo

Add a short video or GIF here demonstrating capture, tagging, and summary.
# TaskFlow