# eliteleads.pro - AI-Powered B2B Lead Generation Platform

## Overview

eliteleads.pro is a comprehensive B2B lead generation and cold email marketing platform that leverages AI to automate the entire sales prospecting workflow. The application helps businesses discover high-quality leads, generate company intelligence, and create personalized cold email campaigns with advanced tracking and analytics capabilities.

The platform integrates multiple data sources for lead discovery, uses OpenAI's GPT-5 model for intelligent research and email personalization, and provides a complete credit-based billing system with PayPal integration. Built as a full-stack TypeScript application, it offers a modern, responsive interface for sales teams to streamline their outreach efforts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
The application follows a monorepo architecture with clear separation between client, server, and shared components:
- **Client**: React-based frontend with TypeScript, built using Vite
- **Server**: Express.js backend with TypeScript, handling API endpoints and business logic
- **Shared**: Common schemas and types shared between client and server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

### Frontend Architecture
**Technology Stack**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation for type-safe form handling

**Component Organization**: 
- Modular component structure with reusable UI components
- Page-based routing with protected routes for authenticated users
- Custom hooks for authentication and data fetching
- Responsive design with mobile-first approach

### Backend Architecture
**Technology Stack**: Express.js, TypeScript, Node.js
- **Database ORM**: Drizzle with PostgreSQL (Neon serverless)
- **Authentication**: Replit OIDC integration with session management
- **API Design**: RESTful endpoints with consistent error handling
- **File Structure**: Organized by feature with shared utilities

**Key Services**:
- **Lead Generation Service**: Orchestrates the lead discovery and qualification process
- **OpenAI Integration**: Handles AI-powered company research and email generation
- **Storage Service**: Database abstraction layer for all CRUD operations
- **Authentication Service**: Manages user sessions and authorization

### Database Design
**PostgreSQL Schema** managed by Drizzle ORM with the following core entities:
- **Users**: Authentication and profile information with credit balance tracking
- **Leads**: Contact information, company details, and qualification scores
- **Email Campaigns**: Generated emails with tracking status and templates
- **Lead Generation Jobs**: Async job tracking for lead discovery processes
- **Credit Transactions**: Billing history and credit usage tracking
- **Sessions**: Session storage for authentication (required for Replit Auth)

**Relationships**: 
- Users have many leads, campaigns, and transactions
- Leads can have multiple associated email campaigns
- All entities include audit trails with timestamps

### Authentication & Authorization
**Replit OIDC Integration**: Leverages Replit's built-in authentication system
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **User Profile**: Automatic user creation/updates from OIDC claims
- **Route Protection**: Middleware-based authentication for API endpoints
- **Client-side Auth**: React Query integration for user state management

### AI Integration Architecture
**OpenAI GPT-5 Integration** for intelligent content generation:
- **Company Intelligence**: Generates business insights, pain points, and buying triggers
- **Email Personalization**: Creates customized cold emails based on lead data and company research
- **Lead Qualification**: AI-powered scoring system for lead prioritization
- **Template System**: Multiple email templates (problem-solution, social proof, news hook)

**Error Handling**: Comprehensive error management with fallback mechanisms and user-friendly error messages

### Payment Processing
**PayPal Integration**: Complete payment flow for credit purchases
- **Order Creation**: Server-side PayPal order generation
- **Payment Capture**: Secure payment processing with webhook validation
- **Credit Management**: Automatic credit allocation upon successful payment
- **Transaction Tracking**: Complete audit trail for all financial transactions

### Credit System Architecture
**Usage-Based Billing Model**:
- Lead generation operations consume credits based on complexity
- Email generation requires credits per personalized email created
- Real-time credit balance tracking and insufficient credit protection
- Transaction history with detailed usage analytics

## External Dependencies

### Database & Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Express Sessions**: PostgreSQL session storage via connect-pg-simple

### AI & Machine Learning
- **OpenAI API**: GPT-5 model for company intelligence and email generation
- **Custom Prompts**: Specialized prompts for B2B sales intelligence and personalization

### Payment Processing
- **PayPal Server SDK**: Complete payment processing integration
- **PayPal Sandbox/Production**: Environment-based payment processing

### Authentication
- **Replit OIDC**: Built-in authentication system for Replit deployments
- **OpenID Connect**: Industry-standard authentication protocol
- **Passport.js**: Authentication middleware for Express.js

### Frontend Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and submission
- **Zod**: Runtime type validation and schema definition
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Monitoring & Development
- **Replit Integration**: Development environment with live reloading
- **Runtime Error Overlay**: Development error handling and debugging
- **Custom Logging**: Request/response logging with performance metrics