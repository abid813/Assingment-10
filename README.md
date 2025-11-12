# My website name: Clean City Report Portal

A web application that allows users to report and track local cleanliness and public-safety issues (garbage, illegal construction, broken public property, road damage, waterlogging, etc.). The system supports reporting with images, viewing issue details, and contributing to cleanup efforts.

## Live website
Replace the URL below with your deployed client site URL.
Live site URL: https://your-live-site-link.com

## Key features
- Location-based issue reporting with title, category, description, image, suggested budget, and reporter email.
- Recent issues preview on the home page showing the latest six reports.
- Issue detail pages with contribution modal to collect cleanup funds.
- User authentication (email/password and Google) for protected routes.
- My Issues and My Contribution pages for user-specific data.
- Responsive UI built with Tailwind CSS.
- Backend API with Node.js and Express, data stored in MongoDB Atlas.
- Toast or SweetAlert notifications for all CRUD actions.
- Loading indicators and 404 Not Found page.

## Project structure (recommended)
- client/         - React (Vite) frontend
  - src/
    - pages/
      - Home.jsx
      - Issues.jsx
      - IssueDetail.jsx
      - AddIssue.jsx
      - MyIssues.jsx
      - MyContribution.jsx
    - components/
    - services/
    - App.jsx
  - package.json
- server/         - Express backend
  - index.js
  - migration.js (optional)
  - package.json
  - .env
- README.md

## Environment variables
Server (.env)
