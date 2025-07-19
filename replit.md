# Escanix - Custom Business Pages Platform

## Overview

Escanix is a full-stack web application that enables vendors to create customized mini-pages for their businesses, accessible via QR codes. The platform is specifically designed for small business owners, particularly those selling beverages in stand pouch packaging, allowing them to create professional digital presences that customers can access by scanning QR codes.

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Portuguese (Brazilian) - All user-facing content should be in Portuguese.
Authentication: Replit Auth integration (privacy consent pages may appear in English as provided by Replit).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema**: Well-defined tables for users, vendors, ratings, and sessions
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Route-level authentication middleware
- **User Management**: Automatic user creation and profile management

### Vendor Management
- **Business Profiles**: Comprehensive vendor information including business details, contact info, and social media links
- **File Uploads**: Logo and menu file upload system with multer
- **QR Code Generation**: Dynamic QR code creation for vendor pages
- **Public Pages**: Client-accessible vendor pages without authentication

### Rating System
- **Customer Ratings**: Star-based rating system (1-5 stars) with optional comments
- **Rate Limiting**: One rating per day per customer per vendor
- **Aggregation**: Average rating calculations and display

### File Management
- **Upload Handling**: Multer-based file upload with size and type restrictions
- **Storage**: Local file storage with static serving
- **Validation**: File type and size validation (5MB limit, images and PDFs only)

## Data Flow

### User Journey
1. **Vendor Registration**: Business owners authenticate via Replit Auth
2. **Profile Setup**: Vendors complete business information, upload logos/menus
3. **QR Generation**: System generates unique QR codes linking to vendor pages
4. **Customer Access**: End customers scan QR codes to access vendor information
5. **Interaction**: Customers can view business details, contact info, and leave ratings

### API Structure
- `/api/auth/*` - Authentication endpoints
- `/api/vendor/*` - Vendor management (authenticated)
- `/api/client/:vendorId/*` - Public client endpoints
- Static file serving for uploads

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Client-side data fetching and caching
- **@radix-ui/***: Accessible UI component primitives
- **express**: Web server framework
- **multer**: File upload middleware
- **qrcode**: QR code generation
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Frontend development with hot module replacement
- **Express Server**: Backend API serving
- **Database**: Neon PostgreSQL serverless instance
- **File Storage**: Local uploads directory

### Production Build
- **Frontend**: Vite production build to `dist/public` (moved to `dist/` via build script)
- **Backend**: ESBuild bundling to `dist/index.js`
- **Build Script**: Custom `build-deploy.js` for deployment directory alignment
- **Static Assets**: Express static file serving from `dist/`
- **Environment**: Node.js production mode with optimizations

### Deployment Configuration
- **Issue Resolved**: Build output directory mismatch between Vite config and deployment expectations
- **Solution**: Custom build script (`build-deploy.js`) that reorganizes files for proper deployment
- **Recommended**: Use Autoscale deployment type for full-stack functionality

### Key Features
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized queries, image handling, and caching strategies
- **Security**: Input validation, file upload restrictions, and authentication middleware