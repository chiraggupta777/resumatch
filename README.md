# ResuMatch — AI-Powered Resume Analyzer

> Match your resume to a job description and get AI-powered insights on your match score, ATS keywords, strengths, gaps, and improvements.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Groq AI](https://img.shields.io/badge/Groq-AI-orange)

---

## What is ResuMatch?

ResuMatch is a full-stack AI-powered resume analysis platform designed to help job seekers understand how well their resume matches a specific job description.

Users can upload a resume in PDF format, paste a target job description, and receive structured feedback including a match score, ATS keyword analysis, strengths, gaps, and actionable improvement suggestions.

The application combines a React frontend, Node.js and Express backend, MongoDB persistence, authentication, PDF processing, and AI-powered analysis.

---

## Features

### Core Features

- **Resume vs Job Description Matcher** — Upload a PDF resume, paste a job description, and receive a match score from 0–100.
- **ATS Keyword Analysis** — Identify relevant keywords found in the resume and important keywords that are missing.
- **Strengths Analysis** — Understand which areas of the resume align well with the target role.
- **Gap Detection** — Identify missing skills, experience areas, and other weaknesses relative to the job description.
- **Improvement Suggestions** — Receive actionable recommendations for improving the resume.
- **Resume Strength Scoring** — Analyze the overall quality and strength of a resume.
- **Analysis History** — Access previously completed analyses from the user account.
- **History Management** — Review and delete saved analysis history.
- **Loading and Analysis States** — Clear visual feedback while the resume is being processed and analyzed.

### Application Features

- Email and password authentication
- JWT-based protected routes
- User-specific analysis history
- MongoDB persistence
- PDF resume upload
- Structured analysis results
- Responsive user interface
- Landing page with smooth navigation
- Protected dashboard and history pages

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Groq AI API

---

## Project Structure

```text
resumatch/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Analysis.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   └── analysis.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── project/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## How It Works

1. The user creates an account or signs in.
2. The user uploads a resume in PDF format.
3. The user enters the target job title and job description.
4. The backend processes the uploaded resume.
5. Resume content and job requirements are analyzed.
6. The application generates structured analysis results.
7. The frontend displays:
   - Match score
   - ATS keywords found
   - ATS keywords missing
   - Resume strengths
   - Resume gaps
   - Improvement suggestions
8. The completed analysis is saved to the user's history.
9. Previous analyses can be viewed and managed from the History page.

---

## Getting Started

### Prerequisites

Make sure you have the following installed or available:

- Node.js 18+
- npm
- MongoDB Atlas account or MongoDB connection
- Groq API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/chiraggupta777/resumatch.git
cd resumatch
```

---

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as a reference.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Do not commit real environment values or credentials.

Start the backend:

```bash
node server.js
```

---

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd project
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The development server will display the local frontend address in the terminal.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port | No |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret used for JWT authentication | Yes |
| `GROQ_API_KEY` | API key used for AI analysis | Yes |

Use `.env.example` as a reference for the required environment variable names.

Never commit:

- Database credentials
- API keys
- JWT secrets
- Authentication credentials
- Private environment configuration

---

## Application Flow

```text
Landing Page
      ↓
Sign Up / Login
      ↓
Dashboard
      ↓
Upload Resume + Enter Job Description
      ↓
Resume Processing
      ↓
AI Analysis
      ↓
Match Score + ATS Keywords
      ↓
Strengths + Gaps + Suggestions
      ↓
Save Analysis
      ↓
Analysis History
```

---

## Analysis Output

A completed resume match analysis contains structured information similar to:

```json
{
  "matchScore": 74,
  "atsKeywordsFound": [
    "React",
    "Node.js",
    "REST API"
  ],
  "atsKeywordsMissing": [
    "Docker",
    "TypeScript",
    "Cloud Platforms"
  ],
  "strengths": [
    "Strong programming fundamentals",
    "Experience with version control systems"
  ],
  "gaps": [
    "Limited cloud architecture experience"
  ],
  "suggestions": [
    "Highlight relevant deployment experience",
    "Add measurable impact to project descriptions"
  ]
}
```

---

## Current Status

ResuMatch V1 currently includes:

- Authentication
- Resume upload
- Resume and job description matching
- AI-powered structured analysis
- Match scoring
- ATS keyword analysis
- Strength and gap analysis
- Improvement suggestions
- Analysis history
- History management

The project is currently being prepared for production deployment.

---

## Future Improvements

Planned improvements include:

- More robust PDF parsing
- Improved scoring consistency
- Resume section-level analysis
- Downloadable analysis reports
- Better error handling for unsupported PDF files
- Improved mobile responsiveness
- More detailed recommendation explanations
- Production monitoring and logging
- Performance optimizations

---

## Local Development

Run the backend and frontend in separate terminals.

### Terminal 1 — Backend

```bash
cd backend
node server.js
```

### Terminal 2 — Frontend

```bash
cd project
npm run dev
```

---

## Security Notes

ResuMatch uses environment variables for sensitive configuration.

The real `.env` file must never be committed to version control.

Only `.env.example`, containing placeholder variable names and example formats, should be included in the repository.

Before deploying the application:

- Use strong production secrets
- Restrict allowed frontend origins
- Keep API keys server-side
- Verify production environment variables
- Test authentication and protected routes

---

## Contributing

Contributions and suggestions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

## Author

**Chirag Gupta**

GitHub: [@chiraggupta777](https://github.com/chiraggupta777)

---

## Acknowledgements

This project uses technologies and services from:

- Groq — AI inference
- MongoDB Atlas — Database hosting
- React and Vite — Frontend development
- Node.js and Express — Backend development

---

## Project Status

ResuMatch is under active development.

The current V1 focuses on delivering a complete resume-to-job-description analysis workflow with authentication, AI-powered insights, and analysis history.