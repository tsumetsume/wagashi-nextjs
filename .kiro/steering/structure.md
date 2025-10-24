# Project Structure

## Root Directory Layout

```
wagashi-simulator/
├── app/                    # Next.js App Router (pages & API routes)
├── components/             # React components
├── lib/                    # Utilities & configurations
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema & migrations
├── public/                 # Static assets
├── hooks/                  # Custom React hooks
├── services/               # API service layer
├── data/                   # Static data files
└── documents/              # Documentation & guides
```

## App Directory (Next.js App Router)

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home page (redirects to store-selection)
├── globals.css             # Global styles
├── admin/                  # Admin dashboard pages
│   ├── layout.tsx          # Admin layout with sidebar
│   ├── page.tsx            # Admin dashboard
│   ├── accounts/           # User management
│   ├── categories/         # Category management
│   ├── products/           # Product management
│   ├── stock/              # Inventory management
│   └── stores/             # Store management
├── api/                    # API routes
│   ├── admin/              # Admin API endpoints
│   ├── auth/               # Authentication endpoints
│   ├── box-types/          # Box type management
│   ├── stores/             # Store operations
│   └── sweets/             # Product operations
├── customer-code/          # Customer code lookup
├── login/                  # Authentication pages
├── simulator/              # Main simulator interface
└── store-selection/        # Store selection page
```

## Components Organization

```
components/
├── ui/                     # Reusable UI components (shadcn/ui)
├── admin/                  # Admin-specific components
├── providers.tsx           # Context providers wrapper
├── theme-provider.tsx      # Theme management
├── wagashi-simulator-content.tsx  # Main simulator logic
├── box-area.tsx            # Drag-and-drop box interface
├── selection-area.tsx      # Product selection panel
├── placed-item.tsx         # Individual placed items
├── sweet-item.tsx          # Draggable product items
└── [feature]-modal.tsx     # Various modal components
```

## Database Schema (Prisma)

```
prisma/
├── schema.prisma           # Database schema definition
├── seed.ts                 # Initial data seeding
└── migrations/             # Database migration files
```

### Key Models
- **AdminUser**: Admin authentication & roles
- **Store**: Multi-location store management
- **Category**: Product categorization
- **Product**: Wagashi items with images & details
- **Stock**: Store-specific inventory tracking
- **BoxType**: Available box sizes & pricing
- **SavedLayout**: Customer layout persistence

## Library Structure

```
lib/
├── prisma.ts               # Prisma client configuration
├── supabase.ts             # Supabase client setup
├── supabase-helpers.ts     # Supabase utility functions
├── database.types.ts       # Generated Supabase types
└── utils.ts                # General utilities (cn, etc.)
```

## Type Definitions

```
types/
├── types.ts                # Core application types
└── next-auth.d.ts          # NextAuth type extensions
```

## Naming Conventions

- **Files**: kebab-case (`box-selection-modal.tsx`)
- **Components**: PascalCase (`BoxSelectionModal`)
- **Variables/Functions**: camelCase (`handleSaveLayout`)
- **Database**: snake_case (`admin_users`, `box_types`)
- **API Routes**: kebab-case (`/api/box-types`)

## Import Patterns

- Use `@/` path alias for all internal imports
- Group imports: external libraries first, then internal modules
- Prefer named exports over default exports for utilities
- Use `type` imports for TypeScript-only imports

## File Organization Principles

- **Feature-based grouping**: Related functionality stays together
- **Separation of concerns**: UI components separate from business logic
- **Reusable components**: Generic UI components in `components/ui/`
- **Domain-specific components**: Feature components at component root level