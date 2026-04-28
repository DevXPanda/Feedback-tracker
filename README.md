# Feedback Tracking Web App

A modern, real-time feedback tracking system built with Next.js 14 (App Router) and Convex.

## Features

- **Premium UI**: Built with Tailwind CSS, using Poppins for headers and Inter for body text.
- **Real-time Backend**: Powered by Convex for instantaneous updates and database management.
- **Admin Dashboard**: Manage teams, create team members, and view live click statistics.
- **Team Panel**: Simple mobile-first interface for team members to record feedback with a single tap.
- **Automatic Redirection**: Seamlessly redirects users to the central feedback portal after tracking.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Sonner (Toasts)
- **Backend**: Convex
- **Fonts**: Poppins & Inter

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- A Convex account (free tier works great)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Convex Setup
Initialize Convex in your project:
```bash
npx convex dev
```
This will:
- Ask you to log in to Convex.
- Create a new project.
- Provision your database.
- Create a `.env.local` file with your Convex URL.

### 4. Running the App
Start the development server:
```bash
npm run dev
```
Visit `http://localhost:3000` to see the app.

## How to Use

1. **Admin Setup**:
   - Log in to your Convex dashboard.
   - Manually create an admin user in the `users` table or use the `createUser` mutation.
   - Example user: `{ name: "Admin", email: "admin@example.com", password: "password", role: "admin" }`

2. **Managing Teams**:
   - Navigate to `/dashboard` (Login as admin).
   - Use the "Add New Team & Member" form.
   - This creates both a team and a login for the team member.

3. **Collecting Feedback**:
   - Team members log in at `/login`.
   - They see their assigned team and a big "Take Feedback" button.
   - Clicking the button increments the team's count and redirects them to the external portal.
