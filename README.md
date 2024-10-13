# Social Media App

A modern social media app built with Next.js, Prisma, Clerk for authentication, and Tailwind CSS for styling.
![Website Screenshot](./public/project.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)

## Features

- User Authentication with Clerk
- Follow/unfollow functionality
- Post stories and feed display
- Profile pages for each user
- Visitor tracking (who visited the profile)
- Responsive design with Tailwind CSS

## Tech Stack

- **Next.js** – React-based framework for server-side rendering and static site generation
- **Prisma** – ORM for database access
- **Clerk** – User authentication and management
- **Docker** – Containerization for easy setup and scalability
- **Tailwind CSS** – Utility-first CSS framework
- **MySQL** – Database for storing user and post data
- **ngrok** – For exposing local development environments to the internet

## Installation

    1. Clone the repository:

        ```bash
        git clone https://github.com/ZIEDSAGGUEM/social-media-app.git
        cd social-media-app
        ```

    2.Install the dependencies:

        npm install

## Docker Setup

    To run this project in a Docker container:

        1. Create a Dockerfile

        2. Create a docker-compose.yml file to manage both the app and MySQL services

        3. Build and run the Docker containers

            docker-compose up --build

        4. To stop the containers:

            docker-compose down

## Environment Variables

    To run this project, you will need to set up the following environment variables in a .env file:

        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_public_key>
        CLERK_SECRET_KEY=<your_clerk_key_secret>
        NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
        NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
        NEXT_PUBLIC_CLOUDINARY_API_KEY=<your_cloudinary_api_secret>
        DATABASE_URL="mysql://username:password@localhost:3306/dbname"
        WEBHOOK_SECRET=<your_webhook_secret>

    Ensure to replace these placeholders with your actual credentials.

## Running the Application

    1. Run database migrations using Prisma:

        npx prisma migrate

    2. Start the development server:

        npm run dev

    3. Use ngrok to expose your local server for database and authentication access. Ensure your ngrok tunnel is active:

        ngrok http 3000

## Folder Structure

    .
    ├── components # Reusable UI components (Navbar, Feed, etc.)
    ├── lib # Prisma client, utility functions, and Clerk configuration
    ├── pages # Next.js pages (e.g., /profile, /feed)
    ├── prisma # Prisma schema and migrations
    ├── public # Static assets (images, etc.)
    ├── styles # Global and component-specific CSS
    └── .env # Environment variables
