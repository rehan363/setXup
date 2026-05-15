# Research: Phase II Full-Stack Web Application

## Decision: Better Auth for Frontend Authentication

**Choice**: Better Auth with JWT adapter

**Rationale**:
- Native Next.js integration with App Router support
- Built-in JWT adapter for token-based auth
- Handles session management automatically
- Compatible with constitution requirement for JWT pattern

**Alternatives Considered**:
- NextAuth.js: More complex setup, less aligned with spec
- Clerk: Third-party dependency, external hosting
- Auth.js: Alternative but Better Auth chosen for simplicity

---

## Decision: Shared Secret JWT Pattern

**Choice**: `BETTER_AUTH_SECRET` shared between frontend and backend

**Rationale**:
- Stateless verification on backend
- No need for public/private key infrastructure
- Fast token validation without network calls
- Aligns with constitution requirement (Principle IX)

**Alternatives Considered**:
- Public/private key (RS256): More complex, slower verification
- OAuth2/OIDC: Overkill for single-app authentication
- Session cookies: Less portable, backend stateful

---

## Decision: FastAPI JWT Middleware

**Choice**: Custom middleware for Bearer token verification

**Rationale**:
- Non-invasive to route handlers
- Reusable across all protected endpoints
- Clean dependency injection with `Depends`
- Standard Python patterns

**Alternatives Considered**:
- Decorator-based auth: Less flexible
- Dependency per route: More boilerplate
- Third-party lib (python-jose): Built-in PyJWT sufficient

---

## Decision: Neon Serverless Postgres Connection

**Choice**: Direct connection string from `DATABASE_URL`

**Rationale**:
- Serverless-native from Neon
- SQLModel handles connection pooling
- Environment variable keeps secrets out of code
- Simple setup for development

**Alternatives Considered**:
- Connection pooling middleware: Premature optimization
- Prisma: Not Python, breaks tech stack
- Supabase client: Alternative but Neon already chosen

---

## Decision: Next.js App Router with Server Components

**Choice**: App Router with client components only where needed

**Rationale**:
- Next.js 16+ standard approach
- Better performance with server rendering
- Streaming support for loading states
- Aligns with modern React patterns

**Alternatives Considered**:
- Pages Router: Legacy, being phased out
- Pure client components: Slower initial load

---

## Decision: CORS Configuration

**Choice**: Environment-based allowed origins

**Rationale**:
- Dev: `http://localhost:3000`
- Prod: Specific production domain
- Explicit allowlist, not wildcard
- Handled in FastAPI app-level middleware

**Alternatives Considered**:
- Wildcard (*): Security risk
- Proxy layer: Adds complexity
- Credentials in requests: Requires preflight handling