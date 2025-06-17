# AI-Powered Intelligent Recruitment Platform

## 1. Project Overview & Core Values

This project is a modern, full-stack web application designed to revolutionize the hiring process for both applicants and HR professionals. It leverages the power of Large Language Models (LLMs) via the Google Gemini API to automate tedious tasks, provide deep insights, and create a more efficient and personalized recruitment workflow.

Our core values are centered around:

-   **🎯 Accuracy & Explainability:** Moving beyond simple keyword matching, our AI agents perform evidence-based analysis to provide nuanced, explainable match scores, ensuring HR professionals can trust the results.
-   **⚙️ Efficiency & Automation:** We automate the most time-consuming parts of the recruitment cycle, including resume parsing, skill matching, cover letter generation, and initial candidate communication.
-   **👤 Personalization:** The platform provides a tailored experience for all users. Applicants receive personalized feedback and AI-generated content, while HR professionals operate within their own secure, multi-tenant environment.
-   **🔒 Security & Control:** HR users maintain full control over their own resources. They provide their own Gemini API keys and scheduling links, ensuring their data and processes remain isolated and secure. The system never stores user passwords, relying on secure OAuth2 and Google App Passwords.

## 2. Key Functionalities

The application is split into two primary roles, each with a dedicated set of features.

### For Applicants (`applie`)
-   **Secure Authentication:** Simple and secure login via Google OAuth.
-   **One-Time Role Selection:** A clean onboarding flow to choose their role.
-   **Application Dashboard:** A centralized place to view the status and AI-generated match score of all their past applications.
-   **Public Job Board:** A public-facing page (`/jobs`) to browse and search for all open positions.
-   **Intelligent Application Flow:**
    -   Apply for a job by uploading a resume (PDF, DOCX, TXT).
    -   The system automatically triggers a chain of AI agents to:
        1.  Parse and understand the resume.
        2.  Rigorously match it against the job description.
        3.  Generate a tailored cover letter.
    -   Receive an instant, AI-generated match score and feedback upon submission.

### For HR Professionals (`hr`)
-   **Secure Multi-Tenant Environment:** Each HR user operates within their own context.
-   **Settings Management:** A dedicated settings page (`/hr/settings`) to securely provide their own:
    -   Google Gemini API Key for all AI operations.
    -   Personal scheduling link (e.g., Calendly) for meeting invitations.
-   **Job Description Management:**
    -   Create new job posts using a rich text editor or by uploading a PDF.
    -   All posted jobs are automatically given a public, shareable link (`/jd/:id`).
-   **Advanced Applicant Tracking System (ATS):**
    -   View all applications for a specific job, sorted by the AI-generated match score.
    -   An interactive dashboard allows for expanding each application to view:
        -   Detailed AI analysis: match percentage, reasoning, matched skills, and missing skills.
        -   The candidate's resume (secure download link).
        -   The AI-generated cover letter.
    -   Update application status (`shortlisted`, `rejected`, etc.).
-   **Actionable Workflow:**
    -   For shortlisted candidates, a "Send Invite" button appears.
    -   Clicking the button sends a professionally formatted meeting invitation email to the candidate, dynamically populated with the HR user's personal scheduling link.

## 3. Current Project Status

The project has a robust and feature-complete backend, with a functional front-end that is ready for further UI/UX enhancements.

-   ✅ **Backend:** **Largely Complete & Robust.**
    -   The multi-tenant architecture for HR users is fully implemented.
    -   The AI agent system (resume parser, high-accuracy matcher, cover letter generator) is functional and interconnected.
    -   The custom email service using Nodemailer and Google App Passwords is secure and operational.
    -   All database schemas and relationships are defined and working.
    -   File storage with Vercel Blob is integrated for both JDs and resumes.

-   ⏳ **Frontend:** **Functional, with Opportunities for Enhancement.**
    -   All core user flows are implemented and working.
    -   The UI is functional but could be enhanced with more sophisticated state management and visual polish.
    -   **Areas for Upgrade:**
        -   Adding more granular loading states (skeletons, spinners) during AI processing.
        -   Implementing more detailed front-end form validation.
        -   Refining the UI/UX of the HR and Applicant dashboards for better information density.
        -   Building out UI for the other defined (but not yet implemented) AI agent schemas.

## 4. Project Directory Structure

```
.
├── app
│   ├── actions/                  // Server Actions for form submissions
│   │   ├── applicationActions.js // - Update status, send meeting invites
│   │   ├── jobActions.js         // - Create new job descriptions
│   │   └── settingsActions.js      // - Update HR user settings
│   ├── api/
│   │   ├── agents/               // API routes for our AI agents
│   │   │   ├── cover-letter/route.js
│   │   │   ├── matcher/route.js
│   │   │   └── resume/route.js
│   │   ├── auth/[...nextauth]/   // NextAuth.js configuration
│   │   │   └── route.js
│   │   └── jds/[id]/route.js     // API route to fetch a single JD for the client
│   ├── dashboard/page.js         // Applicant's dashboard
│   ├── hr/
│   │   ├── applications/[jdId]/  // HR page to view applications for a job
│   │   │   └── page.js
│   │   ├── dashboard/page.js     // HR's main dashboard
│   │   └── settings/page.js      // HR's settings page (Server Component)
│   ├── jd/[id]/page.js           // Public page to view and apply for a single job
│   ├── jobs/page.js              // Public page listing all available jobs
│   ├── select-role/page.js       // One-time role selection page after first login
│   ├── layout.js                 // Root layout with theme, font, and providers
│   ├── page.js                   // Home page
│   └── globals.css
├── components/
│   ├── emails/                   // React components for email templates
│   │   ├── MeetingInvitationEmail.js
│   │   └── NextStepsEmail.js
│   ├── hr/                       // Components specific to the HR role
│   │   ├── ApplicationRow.js     // - Interactive row for an applicant
│   │   ├── HrSettingsForm.js     // - The form for HR settings (Client Component)
│   │   ├── JD_List.js            // - Displays list of created JDs
│   │   ├── JD_UploadForm.js      // - Form for creating a new JD
│   │   ├── ScheduleMeetingButton.js // - Button to send meeting invite
│   │   └── ApplicationStatusUpdater.js // - Buttons to change applicant status
│   ├── ui/                       // General-purpose UI components
│   │   ├── PdfViewer.js          // - Component to render PDF files
│   │   └── RichTextEditor.js     // - Tiptap rich text editor component
│   ├── AuthButton.js             // Combined Login/Logout button
│   └── Providers.js              // Client-side provider wrapper for NextAuth
├── lib/
│   ├── mongodb.js                // MongoDB native driver connection helper
│   └── mongoose.js               // Mongoose connection helper
├── models/                       // All Mongoose database schemas
│   ├── AgentLog.js
│   ├── Application.js
│   ├── JobDescription.js
│   ├── Resume.js
│   └── User.js
│   └── ... (and others)
├── public/                       // Static assets
│   └── pdf.worker.min.js         // Required worker for react-pdf
├── utils/                        // Utility functions
│   ├── gemini.js                 // Central utility for all Gemini API interactions
│   └── mailer.js                 // Nodemailer service for sending emails
├── .env.local                      // Secret keys and environment variables
├── middleware.js                 // Handles route protection and redirects
└── ... (config files: next.config.mjs, tailwind.config.js, etc.)
```