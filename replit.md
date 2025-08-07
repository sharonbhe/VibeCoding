# Recipe Finder Application

## Overview

This is a React-based recipe discovery application that allows users to find recipes based on available ingredients. The application uses a full-stack architecture with Express.js backend and React frontend, featuring recipe scraping capabilities and intelligent ingredient matching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for development and production builds
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark mode)
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **Session Management**: Express sessions with PostgreSQL session storage
- **Recipe Scraping**: Custom scraping service that aggregates recipes from multiple sources
- **Storage Layer**: Abstracted storage interface with in-memory fallback for development

### Data Storage Solutions
- **Primary Database**: PostgreSQL with two main tables:
  - `recipes`: Stores recipe data including ingredients, instructions, prep time, difficulty, and rating
  - `searches`: Logs user searches with ingredients and results for analytics
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Type Safety**: Drizzle-Zod integration for runtime validation of database operations

### Authentication and Authorization
- Session-based authentication with express-session middleware
- Production requires SESSION_SECRET environment variable for security
- Sessions configured with secure cookie settings and proper session management
- 24-hour session duration with HTTP-only cookies for XSS protection

### Recipe Discovery System
- **Ingredient Matching**: Smart algorithm that matches user ingredients with recipe requirements
- **Sorting Options**: Multiple sorting criteria (ingredient match percentage, cooking time, difficulty level, rating)
- **Recipe Scraping**: Automated system that fetches recipes from external sources and normalizes data
- **Caching Strategy**: In-memory caching for scrapped recipes with TTL to reduce external API calls

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: TypeScript ORM for database operations and migrations

### UI and Styling
- **Radix UI**: Headless UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool and dev server with hot module replacement
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production builds

### Frontend Libraries
- **React Query**: Server state management, caching, and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema validation
- **Wouter**: Lightweight routing solution for React

### Recipe Data Sources
- The application is designed to scrape recipes from multiple cooking websites
- Currently implements mock data but architected to easily integrate with real recipe APIs
- Built-in rate limiting and caching to respect external service limits

## Deployment Configuration

### Production Requirements
- **SESSION_SECRET environment variable**: Required for secure session management in production
- **Static file serving**: Production builds require `deploy-prep.js` script to copy files from `dist/public` to `server/public`
- **Environment validation**: Application validates required environment variables on startup

### Deployment Process
1. Build application: `npm run build`
2. Prepare deployment files: `node deploy-prep.js`
3. Set SESSION_SECRET environment variable
4. Start production server: `npm start`

### Recent Changes (January 2025)
- ✓ Added SESSION_SECRET environment variable validation and configuration
- ✓ Implemented comprehensive session middleware with secure settings
- ✓ Created deployment preparation script to handle static file path mismatch
- ✓ Added detailed error handling with helpful deployment instructions
- ✓ Enhanced production environment checks and validation