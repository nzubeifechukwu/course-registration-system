# Course Registration System

A web-based, full-stack course registration application built with Node.js (Express framework) and PostgreSQL (Prisma ORM), with EJS (Embedded JavaScript) templates serving the frontend. The application features dual-role workflows tailored to student and admin requirements.

Open this **live deployment url: ** to interact with the application.

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

> PLEASE CONSIDER TESTING AND INTERACTING WITH THE APPLICATION ON THE LIVE DEPLOYMENT LINK ABOVE IF YOU ENCOUNTER SOME ISSUES WHILE TRYING TO SET UP PRISMA.
> `./generated/prisma` folder is untracked, which is why I think setting up Prisma may give some issues.
> Proceed with the setup instructions below if you'd still want to go ahead and run the project locally; I've provided a link at the right point below to guide you with setting up Prisma. I hope your set up goes seamlessly.

Follow these steps to run this project locally on your machine:

### 1. Clone the Repository

```bash
git clone https://github.com/nzubeifechukwu/course-registration-system.git
cd course-registration-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Prisma

Follow this link to set up Prisma to work with JavaScript: https://www.theodinproject.com/lessons/nodejs-prisma-orm#assignment

### 4. Environment Configuration

Modify the `.env` file generated in step 3 above in the root directory of your project to reflect your PostgreSQL database details (change only the parts in uppercase: USER, PASSWORD, HOST, PORT, DATABASE):

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 5. Initialize Database Schema and Seed Data

Run the Prisma migration pipeline to map out the schema. Next, run the seed script (`./prisma/seed.js`) to instantly populate your database with a default Admin account, initial courses, and a few student accounts.

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Launch the Application

Start the Tailwind CSS compilation watcher and run the local development server:

- **Terminal 1 (CSS Compiler):**

```bash
npm run watch:css
```

- **Terminal 2 (Application Server):**

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:10000` to interact with the application.
