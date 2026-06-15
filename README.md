# Campusly

Campusly is a full-stack campus management system designed to centralize academic, administrative, and social services for university stakeholders. 

The application provides dedicated portals for students, faculty, alumni, and administrators, consolidating functions that are typically spread across multiple standalone systems into a single web application.

## Overview

The core objective of Campusly is to streamline campus operations and improve accessibility to university resources. By integrating academic tracking, service requests, and community features, the platform reduces administrative overhead and provides a unified interface for daily campus activities.

## Core Features

### Access and Portals
*   **Role-Based Access Control**: Distinct interfaces and permission sets tailored for Students, Faculty, Administrators, and Alumni.
*   **Centralized Dashboard**: Personalized overview of upcoming classes, pending assignments, and recent notifications.

### Academic Management
*   **Attendance & Grades**: Systems for tracking daily attendance records and analyzing academic performance.
*   **Scheduling**: Interactive timetables for lectures, labs, and exams.
*   **Library Integration**: Catalog management, resource availability tracking, and issue/return logging.
*   **Fee Tracking**: Visibility into tuition payments, outstanding dues, and transaction histories.

### Campus Services
*   **Transit Tracking**: Real-time geospatial tracking of campus buses using interactive map integrations.
*   **Helpdesk & Requests**: A ticketing system for submitting and monitoring IT, maintenance, and administrative requests.

### Community and Networking
*   **Event Management**: A directory for discovering, registering for, and managing university events.
*   **Student Marketplace**: A platform for students to buy, sell, or exchange academic materials and supplies.
*   **Alumni Network**: Tools for connecting current students with alumni for career guidance and networking.

## Architecture and Technology Stack

Campusly is built as a Single Page Application (SPA) communicating with a REST API backend. The stack prioritizes type safety and modular design.

### Frontend
*   **Core**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **State Management**: TanStack React Query for server state synchronization
*   **Mapping & Visualization**: Leaflet / React-Leaflet for transit tracking, Three.js / React Three Fiber for 3D UI elements
*   **Animations**: Framer Motion
*   **Schema Validation**: Zod

### Backend
*   **Runtime**: Node.js, Express.js
*   **Language**: TypeScript
*   **Database access**: Prisma ORM
*   **Authentication & Security**: 
    *   Stateless authentication using JWT (JSON Web Tokens)
    *   Password hashing via Bcrypt
    *   Express Rate Limiting to mitigate brute-force attempts
    *   Configured CORS policies for origin management

## Design Principles
*   **Type Safety**: Utilizing TypeScript across both the frontend and backend to enforce contracts and reduce runtime errors.
*   **Modularity**: Decoupling the client application from the API to allow independent scaling and maintenance.
*   **Responsive UI**: Utilizing modern CSS practices to ensure the platform is accessible across desktop and mobile devices.
