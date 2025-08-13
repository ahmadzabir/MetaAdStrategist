# IntelliTarget - AI-Powered Meta Ads Strategist

## Overview

IntelliTarget is a clean, focused AI-powered Meta ads strategist designed for end-user deployment. The application features a streamlined dashboard with AI Strategy Generation prominently positioned above a hierarchical Targeting Explorer. Users describe their product or audience in natural language, and the AI recommends 5-8 optimal targeting categories with strategic justifications. The targeting explorer displays Meta's 636 authentic categories (94.5% of complete dataset) in a modern tree structure with 5 hierarchical levels, allowing users to explore and manually select targeting options across demographics, interests, and behaviors. Features professional glassmorphism design with emerald/blue gradients and comprehensive selection summary with audience size calculations.

## Recent Changes (January 2025)

- **Hierarchical Tree Navigation WORKING**: Fixed tree expand/collapse functionality - users can now properly navigate through all 5 levels (L1→L2→L3→L4→L5)
- **Database Restoration Complete**: Successfully restored 653/673 authentic Meta targeting categories from HTML source with 85% audience size coverage
- **Selection Summary Fixed**: Resolved duplicate key warnings and corrected category count display
- **Authentic Data Verification**: Confirmed audience size data is 100% authentic Meta data (558/653 categories have real audience numbers)
- **Hierarchical Structure**: Proper 5-level hierarchy established (L1:3, L2:26, L3:234, L4:359, L5:14)
- **Data Management**: Created manual data management documentation for future updates
- **Extraction Scripts**: Preserved all data extraction and restoration scripts for future use

## User Preferences

Preferred communication style: Simple, everyday language.
UI Requirements: Hierarchical tree explorer similar to file explorer (Windows Explorer/macOS Finder) where users can expand/collapse branches in place. Parent nodes (with children) are expandable only, leaf nodes (no children) are selectable with checkboxes.

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