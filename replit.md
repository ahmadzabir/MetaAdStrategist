# IntelliTarget - AI-Powered Meta Ads Strategist

## Overview

IntelliTarget is a smart advertising application that simplifies Meta's complex targeting system. The platform provides two core features: an intuitive targeting explorer for browsing Meta's advertising categories, and an AI-powered strategist that analyzes natural language descriptions to recommend optimal targeting options. The application aims to democratize effective Meta advertising by making complex targeting decisions accessible to users of all experience levels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and build tooling
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query for server state management and caching, React Hook Form for form handling
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with separate UI components, page components, and business logic components

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript throughout the entire stack for type safety
- **API Design**: RESTful endpoints for targeting categories, AI recommendations, and user data
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Setup**: Vite integration for hot module replacement in development

### Data Storage Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Hierarchical targeting categories with parent-child relationships, user management, and recommendation storage
- **Data Layer**: Abstract storage interface allowing for different implementations (currently in-memory for development)
- **Migrations**: Drizzle Kit for database schema migrations and management

### AI Integration
- **Provider**: Google Gemini (gemini-2.5-pro) for natural language processing and recommendation generation
- **Strategy**: Contextual prompting with comprehensive targeting category data to generate strategic recommendations
- **Response Format**: Structured JSON responses with targeting IDs and strategic justifications using schema-based response formatting
- **Error Handling**: Graceful fallback and error reporting for AI service failures

### Authentication & Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **User Management**: Basic username/password authentication with secure password handling
- **Security**: Environment-based configuration for sensitive credentials

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting via @neondatabase/serverless
- **Connection Management**: Environment variable-based database URL configuration

### AI Services
- **Google Gemini API**: gemini-2.5-pro model for natural language processing and recommendation generation
- **API Key Management**: Environment variable-based API key configuration

### Firebase Integration
- **Firebase Firestore**: NoSQL cloud database for scalable targeting category storage
- **Bulk Upload**: Support for JSON data import from Meta targeting database
- **Real-time Sync**: Automatic data synchronization across application instances
- **Configuration**: Environment variable-based Firebase project configuration

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled React components including dialogs, dropdowns, forms, navigation, and data display components
- **Lucide React**: Icon library for consistent iconography throughout the application

### Development Tools
- **Vite**: Fast development server and build tool with React plugin support
- **TypeScript**: Static type checking across the entire application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **ESBuild**: Fast JavaScript bundler for production builds

### Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for API requests and responses
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

### Hosting & Deployment
- **Replit**: Development and hosting platform with integrated tooling support
- **Replit Plugins**: Development banner and cartographer integration for enhanced development experience