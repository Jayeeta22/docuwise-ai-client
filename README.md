# DocLens AI (client)
React application for DocLens AI—document scanning and intelligence. Planned: drag-and-drop PDF upload, extracted data viewer, chat with documents, and search. Built with React, React Router, Ant Design, and Redux Toolkit (RTK Query).

## Stage 1 (implemented)
- Routing shell with pages: home, dashboard, login, register
- RTK Query API layer wired to backend (cookie session)
- Auth form integration for register/login
- Backend health check on home page

## Run locally
1. Copy `.env.example` to `.env` and set `VITE_API_URL`.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
