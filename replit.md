# TrackIt Now - Device Tracking Application

## Overview

TrackIt Now is a web-based device tracking application that simulates device location tracking functionality. The application provides a multi-step workflow for users to select their device platform (Android/iOS), choose a device model, enter credentials, and view a simulated tracking dashboard with interactive maps and device controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React useState/useEffect with TanStack Query for server state
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development Server**: Custom Vite integration for SSR and HMR
- **API Structure**: RESTful endpoints with `/api` prefix
- **Database Layer**: Drizzle ORM configured for PostgreSQL

### Data Storage Solutions
- **Database**: PostgreSQL (configured via Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage implementation for rapid prototyping

## Key Components

### Multi-Step Workflow
1. **Platform Selection**: Choose between Android and iOS with visual feedback
2. **Device Selection**: Dynamic device model dropdown based on platform
3. **User Authentication**: Platform-specific credential collection (Gmail/iCloud)
4. **Authentication Process**: Animated multi-step verification simulation
5. **IMEI Generation**: Realistic device identifier generation
6. **Payment Processing**: Cryptocurrency payment simulation (USDT TRC-20)
7. **Main Dashboard**: Interactive tracking interface with map integration

### UI Components
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Theme**: System-wide theme provider with local storage persistence
- **Interactive Maps**: Leaflet.js integration for location visualization
- **Toast Notifications**: User feedback system for actions and status updates
- **Form Handling**: React Hook Form with Zod validation

### Device Simulation Features
- **IMEI Generation**: Algorithmic generation of realistic device identifiers
- **Location Mocking**: Predefined locations with realistic coordinates
- **Device Controls**: Simulated remote actions (ring, lock, wipe)
- **Activity Tracking**: Real-time activity log with timestamp tracking

## Data Flow

### Frontend to Backend Communication
- RESTful API calls using fetch with credential support
- TanStack Query for caching and synchronization
- Error handling with custom response parsing
- Type-safe API requests using shared TypeScript types

### State Management
- Component-level state for UI interactions
- Global theme state via React Context
- Toast state management for notifications
- Multi-step form state persistence across navigation

### Data Persistence
- Database schema defined in shared TypeScript files
- User authentication data (development: in-memory storage)
- Session management using Express sessions
- Environment-based configuration for database connections

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Framework**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, Class Variance Authority, CLSX
- **Forms**: React Hook Form, Hookform Resolvers
- **State Management**: TanStack React Query
- **Date Utilities**: date-fns for timestamp formatting

### Development Tools
- **Build Tools**: Vite, ESBuild for production builds
- **Type Checking**: TypeScript with strict configuration
- **Database Tools**: Drizzle ORM, Drizzle Kit, Drizzle Zod
- **Validation**: Zod for runtime type validation

### External Services
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Database**: Neon PostgreSQL serverless
- **Development**: Replit-specific plugins and error handling

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend proxy
- **Hot Module Replacement**: Full-stack HMR with Vite middleware
- **Environment Variables**: Database URL and other configuration via `.env`
- **Error Handling**: Custom error overlays and logging

### Production Build
- **Frontend**: Vite build to static assets in `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js` for Node.js execution
- **Asset Serving**: Express static file serving for production builds
- **Database**: PostgreSQL with connection pooling via Neon

### Architecture Benefits
- **Monorepo Structure**: Shared types and utilities between frontend/backend
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Development Experience**: Fast refresh, error overlays, and integrated tooling
- **Scalability**: Modular component architecture with lazy loading support
- **User Experience**: Progressive enhancement with smooth animations and feedback

### Security Considerations
- **Environment Variables**: Sensitive data stored in environment configuration
- **Session Management**: Express sessions with secure cookie configuration
- **Input Validation**: Zod schemas for runtime validation of user inputs
- **CORS Protection**: Configured for development and production environments