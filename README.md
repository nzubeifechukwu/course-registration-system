# Course Registration System

A web-based, full-stack course registration application built with Node.js (Express framework) and PostgreSQL (Prisma ORM), with EJS (Embedded JavaScript) templates serving the frontend. The application features dual-role workflows tailored to student and admin requirements.

**Live deployment URL:**

## Features

### Admin Workflow

- Create courses (e.g., "Physics 101", etc.).
- Assign courses to specific student academic levels (e.g., 100 level, 200 level, etc.).
- View all students and the courses they registered for.

### Student Workflow

- Create an account on the student portal by entering your name, email, password, and academic level.
- View only the courses available for their level.
- Select and submit their course choices (register for a course or drop a course).

## Tech Stack

- **Backend Runtime:** Node.js & Express
- **Database & ORM:** PostgreSQL managed via Prisma ORM
- **Templating Engine:** EJS (Embedded JavaScript)
- **Styling Framework:** Tailwind CSS
- **Authentication:** Passport (Local Strategy) & bcryptjs (for password hashing)
- **Input Validation:** express-validator

## Local Setup Instructions

Follow these steps to run this project locally on your machine:

### 1. Clone the Repository

```bash
git clone https://github.com/nzubeifechukwu/course-registration-system.git
cd course-registration-system
```

### Database & Deployment

● Store data in a database
● Deploy on GitHub Pages, Netlify, Render, or similar Submission Instructions
● Upload your complete code to GitHub
● Share the GitHub repository link with us
● Include a short README explaining how to run your project
