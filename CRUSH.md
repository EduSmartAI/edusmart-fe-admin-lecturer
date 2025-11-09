# EduSmart Frontend - CRUSH.md

## Build & Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run get-openapi` - Fetch OpenAPI specs
- `npm run gen-*` - Generate API clients from Open specs

## Code Style Guidelines

### Imports & Organization
- Use `'use client'` for client components
- Import suppression utilities FIRST: `import "EduSmart/utils/earlyWarningSuppression";`
- Import order: suppression → external → internal → relative imports
- Use "EduSmart/" alias for all internal imports
- Group related imports by functionality

### TypeScript & Types
- Strict TypeScript enabled in tsconfig.json
- Use interfaces for object shapes, types for unions/primitives
- Explicit typing for all function parameters and returns
- Leverage Zod validation for API responses

### Naming Conventions
- PascalCase for components and interfaces
- camelCase for variables and functions
- kebab-case for file names and directories
- Use semantic names: `useCreateCourseStore`, `validateGoalName`

### Error Handling
- Try-catch blocks with proper error typing
- Use NextResponse.json for API error responses
- Provide user-friendly error messages in Vietnamese
- Include error details in development mode only

### Component Patterns
- Use FC (Function Component) type annotation
- Destructure props in function signature
- Ant Design components for forms and UI
- Zustand for client-side state management
- Use '@/*' imports from antd/nextjs-registry

### File Structure
- Follow Next.js 15 App Router conventions
- Client components in app/ directory with 'use client'
- Server components in api/ and lib/
- Stores in src/stores/ with Zustand
- Components in src/components/ by feature

### Formatting & Linting
- ESLint with Next.js config (extends: next/core-web-vitals, next/typescript)
- Prettier for code formatting
- Run `npm run lint` and `npm run format` before commits