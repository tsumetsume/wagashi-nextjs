# Technology Stack

## Core Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Node.js** runtime

## Database & ORM
- **Supabase PostgreSQL** (primary database)
- **Prisma ORM** for database operations
- **Supabase Storage** for image/file storage

## Authentication & Security
- **NextAuth.js** for authentication
- **bcryptjs** for password hashing
- **Supabase RLS** (Row Level Security) for data access control

## UI & Styling
- **Tailwind CSS** for styling
- **Radix UI** components library
- **Lucide React** for icons
- **next-themes** for theme management
- **Japanese fonts**: Noto Sans JP, Noto Serif JP

## Key Libraries
- **react-dnd** for drag-and-drop functionality
- **react-hook-form** + **zod** for form validation
- **file-saver** for file downloads
- **recharts** for data visualization
- **sonner** for toast notifications

## Development Tools
- **TypeScript** for type safety
- **pnpm** as package manager
- **Docker** for containerization
- **tsx** for TypeScript execution

## Common Commands

### Development
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Database Operations
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database with initial data
pnpm db:studio        # Open Prisma Studio
```

### Supabase Integration
```bash
pnpm types:generate   # Generate Supabase TypeScript types
pnpm migrate:supabase # Migrate data to Supabase
pnpm db:test          # Test database connection
```

## Build Configuration
- **ESLint/TypeScript errors ignored during builds** for rapid development
- **Image optimization disabled** for compatibility
- **Path aliases**: `@/*` maps to project root