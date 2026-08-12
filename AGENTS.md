# Pickleball Project — AI Agent Guidelines

## 1. Project Overview

This is a Next.js web application for managing a Pickleball platform, including:

* Tournament management
* Player and team registration
* Tournament categories
* Pool/group-stage matches
* Knockout brackets
* Referee (`wasit`) functionality
* Admin dashboard
* Authentication and authorization
* Articles, categories, and comments
* Organization structure
* File/image uploads

The project is a production-oriented application. Preserve existing behavior and architecture unless a change is explicitly requested.

---

## 2. Technology Stack

Use the versions and technologies already defined by `package.json`.

### Core

* Next.js 16.1.6
* React 19
* TypeScript 5
* Tailwind CSS 4
* ESLint 9

### Database

* MariaDB / MySQL
* Prisma ORM 5.x
* `@prisma/client`
* `@prisma/adapter-mariadb`

### Authentication

* NextAuth 4
* Admin authorization is handled through `proxy.js`

### Important dependencies

* `@g-loot/react-tournament-brackets`
* `react-svg-pan-zoom`
* `styled-components`
* `sweetalert2`
* `bcryptjs`

---

## 3. Project Structure

Follow the existing structure.

```text
app/
├── admin/       # Admin interface
├── api/         # API route handlers
├── wasit/       # Referee interface
├── layout.tsx
└── globals.css

components/      # Reusable UI components
lib/             # Shared utilities and business logic
prisma/          # Prisma schema, migrations, generated client
public/          # Static assets
```

Do not create new top-level directories unless there is a clear architectural reason.

Before creating a new component or utility, check whether an existing implementation can be reused.

---

## 4. Next.js Conventions

This project uses the Next.js App Router.

Prefer the existing App Router structure and conventions.

Use server-side code for database access and sensitive operations.

Do not expose database credentials, authentication secrets, or other server-only values to client components.

When creating or modifying components, determine whether the component should be a Server Component or Client Component.

Use `"use client"` only when client-side functionality is actually required, such as:

* React state
* React effects
* browser APIs
* event handlers requiring client execution
* interactive UI

Avoid unnecessarily converting Server Components into Client Components.

---

## 5. TypeScript

TypeScript strict mode is enabled.

Prefer strong typing over `any`.

Avoid:

```ts
any
```

unless there is a specific and justified reason.

Use explicit types/interfaces for complex data structures.

Follow existing naming and typing conventions in neighboring files.

The project uses the `@/*` path alias:

```text
@/* → project root
```

Prefer the existing alias when appropriate instead of unnecessarily using long relative paths.

---

## 6. Database and Prisma

The database uses MariaDB/MySQL through Prisma.

The Prisma schema is located at:

```text
prisma/schema.prisma
```

Never modify the production database directly when a schema change is required.

When changing the database structure:

1. Inspect the existing Prisma schema.
2. Check existing migrations.
3. Make the smallest required schema change.
4. Generate/create the appropriate Prisma migration using the project's existing workflow.
5. Regenerate Prisma Client if required.
6. Verify affected application code.

Do not reset, drop, or wipe the database unless explicitly requested.

Do not run destructive Prisma commands against the database without explicit approval.

Never expose `DATABASE_URL`.

---

## 7. Tournament Domain

The tournament system is an important part of this application.

Current concepts include:

* Tournament
* Player
* Team
* Pool
* PoolMember
* PoolMatch
* KnockoutMatch

Tournament statuses:

```text
DRAFT
UPCOMING
ONGOING
COMPLETED
CANCELED
```

Match statuses:

```text
SCHEDULED
ONGOING
DONE
```

Match types:

```text
SINGLE
DOUBLE
MIXED
```

Grades (Tingkat):

```text
SD, SMP, SMA (Default)
OPEN, U11, U13, U15, U17, U19, U21 (Configurable per tournament via gradeOptions)
```

Gender:

```text
MALE
FEMALE
```

Pool statuses:

```text
OPEN
FULL
COMPLETED
```

Payment Methods:

```text
TRANSFER
QRIS
EWALLET
VENUE
```

Payment Statuses:

```text
UNPAID
PAID
```

Preserve these domain concepts and enum values unless the user explicitly requests a domain change.

---

## 8. Tournament Category Rules

The application uses category keys such as:

```text
SMA_MALE_SINGLE
SMP_FEMALE_DOUBLE
SMA_MIXED
OPEN_MALE_SINGLE
U19_MIXED
```

Category-related logic should be centralized where possible.

Check existing utilities such as:

* `lib/tournamentCategory.ts` (category generation & logic)
* `lib/categoryLabel.ts` (human-readable label formatting)
* `lib/tournamentGrades.ts` (grade normalization & parsing)

before implementing new category-generation or label logic.

Do not duplicate category rules across multiple API routes or components.

---

## 9. Tournament Bracket Logic

Existing tournament/bracket utilities include:

```text
lib/bracketGenerator.ts
lib/buildTree.ts
```

Before implementing new bracket-generation logic, inspect and reuse these utilities.

Do not create a second bracket algorithm if an existing implementation already provides the required behavior.

Be especially careful when modifying:

* match ordering
* winner propagation
* round generation
* player/team assignment
* knockout progression

Tournament bracket changes should be tested carefully because incorrect logic can affect tournament results.

---

## 10. Legacy Tournament System

The Prisma schema contains legacy group-stage models:

```text
TournamentGroup
GroupMember
GroupMatch
```

The newer pool-based system uses:

```text
Pool
PoolMember
PoolMatch
```

Do not automatically replace, delete, migrate, or merge the legacy system with the pool system.

Before modifying either system, determine which part of the application currently uses it.

---

## 11. Authentication and Authorization

Admin routes are protected by `proxy.js`.

Current behavior:

```text
/admin/*
```

requires authentication.

The user must have:

```text
token.role === "ADMIN"
```

Unauthenticated or unauthorized users are redirected to:

```text
/admin/login
```

Do not weaken or bypass admin authorization.

Never trust client-provided role information for security-sensitive authorization.

Authorization must be enforced server-side where appropriate.

The `/wasit` area intentionally does NOT require authentication/login because match links are shared directly to each referee. Do not add authentication or login requirements to `/wasit` routes.

Inspect existing authentication code before changing authorization behavior.

---

## 12. API Routes

API routes currently exist under:

```text
app/api/
```

including:

```text
auth/
setup/
struktur/
tournaments/
upload/
wasit/
```

Before creating a new endpoint:

1. Check whether an existing endpoint already provides the required functionality.
2. Follow the existing response format.
3. Reuse shared helpers from `lib/apiResponse.ts`:
   * `successResponse(message, data, status, pagination)`
   * `errorResponse(message, status, code, details)`
4. Validate incoming data.
5. Enforce authentication/authorization where required.
6. Handle database errors safely.
7. Do not expose sensitive information in API responses.

---

## 13. File Uploads

The project contains:

```text
app/api/upload/
```

and image/file fields exist in the database.

Payment proof uploads are handled via `lib/paymentProof.ts` (`savePaymentProofFile`) and stored under `public/uploads/payments/`.

Inspect existing upload implementations before adding another upload mechanism.

Do not expose filesystem paths or sensitive server information to clients.

Validate uploaded files appropriately (file type, size limits).

---

## 14. UI and Styling

The project uses Tailwind CSS 4.

Follow existing UI patterns and styling conventions.

Before creating a new UI pattern, check existing components.

Do not introduce another CSS framework unless explicitly requested.

Avoid unnecessary global CSS changes.

The project also uses:

```text
styled-components
```

and this should not be replaced globally without a specific reason.

---

## 15. SweetAlert and UI Feedback

The project contains:

```text
lib/swal.ts
```

Reuse the helper functions in `lib/swal.ts` for all user feedback and popups:

* `showSuccess(message, title)`
* `showError(message, title)`
* `showWarning(message, title)`
* `showInfo(message, title)`
* `showConfirm(message, title, confirmText, cancelText)`
* `showDeleteConfirm(message, title)`

Never use native browser popups like `alert()` or `confirm()`.

Avoid introducing multiple competing notification systems.

---

## 16. Error Handling

Use the existing application response/error-handling conventions.

For API routes:

* Return appropriate HTTP status codes.
* Do not expose stack traces or secrets.
* Return useful but safe error messages.

Do not silently swallow errors.

When fixing a bug, identify the underlying cause instead of hiding the error.

---

## 17. Environment Variables

Never commit or expose `.env` contents.

Do not modify environment variables unless explicitly requested.

Never print secrets such as:

* database passwords
* authentication secrets
* API keys
* tokens

When debugging environment issues, inspect variable names and configuration without exposing their values.

---

## 18. Development Commands

Development:

```bash
npm run dev
```

(runs `next dev --webpack`)

Build:

```bash
npm run build
```

Production start:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

Do not replace the existing development command without a specific reason.

---

## 19. Verification

After making changes:

1. Run the smallest relevant verification first.
2. Run ESLint when appropriate:

```bash
npm run lint
```

3. Run the production build for changes that could affect compilation or routing:

```bash
npm run build
```

4. Verify affected functionality manually when necessary.

Do not claim that a change is working without performing appropriate verification.

If a command fails because of the local environment, report the failure instead of pretending it passed.

---

## 20. Code Change Rules

Before modifying code:

1. Read the relevant existing files.
2. Check sibling components/routes for conventions.
3. Reuse existing utilities and components.
4. Make the smallest change that solves the problem.
5. Avoid unrelated refactoring.
6. Preserve existing functionality.

Do not rewrite large parts of the application unless explicitly requested.

Do not change dependencies without approval.

Do not modify database schema or migrations for a UI-only request.

Do not modify authentication/authorization for an unrelated feature.

---

## 21. Important Safety Rules

Never automatically:

* delete database data
* reset the database
* delete migrations
* remove authentication
* weaken authorization
* expose `.env`
* commit secrets
* remove existing features
* replace working architecture with a new framework/library
* rewrite unrelated files

When a destructive or architectural change appears necessary, explain the reason and ask for approval first.

---

## 22. Working Style

When solving a task:

```text
Understand
    ↓
Inspect existing implementation
    ↓
Identify the smallest correct change
    ↓
Implement
    ↓
Verify
    ↓
Report what changed
```

Keep explanations concise.

Do not create documentation files unless explicitly requested.

Do not create temporary scripts when existing project commands or tests can verify the behavior.

---

## 23. Priority

When instructions conflict, use this priority:

1. Explicit user request
2. Existing project behavior and architecture
3. Security and data integrity
4. This AGENTS.md
5. General coding preferences

Do not override explicit user requirements unless doing so would create a security, data-loss, or serious correctness problem.

