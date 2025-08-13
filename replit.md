# IntelliTarget - AI-Powered Meta Ads Strategist

## Overview

IntelliTarget is a clean, focused AI-powered Meta ads strategist designed for end-user deployment. The application features a structured questionnaire approach where users answer pre-built questions with 1-3 word responses instead of writing lengthy descriptions. The AI generates 5-8 optimal targeting recommendations with hierarchical breadcrumb navigation (Demographics > Family > etc.) and strategic explanations. After viewing recommendations, users can optionally start a chat with the AI strategist for continued conversation and refinement. The system maintains access to 653 authentic Meta targeting categories (97% of complete dataset) with 85% authentic audience size coverage. Features professional glassmorphism design with blue/purple gradients and beginner-friendly, consultant-style AI guidance.

## Recent Changes (January 2025)

- **MAJOR UI ARCHITECTURE OVERHAUL COMPLETE**: Completely redesigned user interface from free-form input to structured questionnaire approach
- **Structured Questionnaire System**: Replaced text input with pre-built questions requiring 1-3 word answers (business type, product/service, target age, budget, goal)
- **AI Recommendations with Breadcrumbs**: AI now generates targeting recommendations with hierarchical breadcrumb navigation (Demographics > Family > etc.) and strategic explanations
- **Chat Interface Integration**: Added optional "Start Chat" feature for continued AI conversation after viewing recommendations
- **Enhanced AI Prompt System**: Updated IntelliTarget AI with professional consultant-style prompting for beginner-friendly, actionable advice
- **Improved Backend Integration**: Modified Gemini service to handle structured questionnaire data alongside legacy text input format
- **Component Architecture**: Created modular components (StructuredQuestionnaire, AIRecommendations, AIChat) for better maintainability
- **Error Handling & Type Safety**: Fixed LSP errors, improved TypeScript interfaces, and enhanced error messaging
- **AI Model Optimization**: Switched from gemini-2.5-pro to gemini-2.5-flash for better performance and reduced timeout issues
- **Database Restoration Complete**: Successfully restored 653/673 authentic Meta targeting categories from HTML source with 85% audience size coverage
- **Authentic Data Verification**: Confirmed audience size data is 100% authentic Meta data (558/653 categories have real audience numbers)
- **Hierarchical Structure**: Proper 5-level hierarchy established (L1:3, L2:26, L3:234, L4:359, L5:14)

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