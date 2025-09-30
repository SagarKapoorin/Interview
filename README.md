 # AI Interviewer

 AI Interviewer is a web application that generates tailored interview questions based on a candidate's resume, allows candidates to answer questions with timers, scores answers using AI, and provides interviewers with detailed feedback and summaries.

 ## Features

 - Resume Upload & Parsing: Upload a resume (PDF or text) to extract text.
 - AI-Powered Question Generation: Generate 6 interview questions (2 Easy, 2 Medium, 2 Hard) based on the resume.
 - Candidate Interface: Answer questions with real-time timers.
 - AI Scoring: Score each answer on a scale of 0-100 with personalized feedback.
 - Interviewer Dashboard: View candidate answers, AI feedback, and a final summary with overall score.
 - Persistent State: Automatically pause and resume interviews across sessions.

 ## Tech Stack

 - React
 - TypeScript
 - Redux Toolkit & Redux Persist
 - Vite
 - Tailwind CSS

 ## Prerequisites

 - Node.js (v14 or higher)
 - npm or yarn

 ## Installation

 ```bash
 cd checkitout
 npm install
 ```

 ## Running Locally

 Start the development server:

 ```bash
 npm run dev
 ```

 Open http://localhost:5173 in your browser.

 ## Building for Production

 ```bash
 npm run build
 npm run preview
 ```

 ## Available Scripts

 - `npm run dev`: Start the development server.
 - `npm run build`: Build the app for production.
 - `npm run preview`: Preview the production build.
 - `npm run lint`: Run ESLint.
 - `npm run prettier`: Format code with Prettier.
 - `npm run typecheck`: Run TypeScript type checking.
## Code Style

This project uses **ESLint** and **Prettier** for consistent code style.

- Run `npm run lint` to check for lint errors.
- Run `npm run prettier` to auto-format code.

### Error Handling

- Resume upload shows user-friendly error banners for invalid file types, sizes, parsing failures, and file read errors.
- Profile form fields (email/phone) have inline validation and error messages.
