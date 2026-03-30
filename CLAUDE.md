# CLAUDE.md - Chase My Career Social Media Dashboard

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Theme**: Dark mode only (forced via next-themes)
- **State**: React hooks + Zustand (optional for complex state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for analytics visualizations
- **Calendar**: shadcn/ui Calendar + date-fns
- **API**: Axios for Metricool & RSS integrations
- **Icons**: Lucide React

## Folder Structure Philosophy
- `app/(dashboard)/` - Protected dashboard routes with shared layout
- `components/ui/` - shadcn/ui primitives (auto-generated)
- `components/layout/` - App-wide layout components (Sidebar, Header)
- `components/shared/` - Reusable business components
- `lib/` - Utilities, API clients, constants
- `types/` - TypeScript interfaces for type safety
- `hooks/` - Custom React hooks for data fetching

## Key Decisions

### 1. Dark Theme Only
- Career professionals often work evenings/early mornings
- Reduces eye strain during long content planning sessions
- Aligns with modern SaaS dashboard aesthetics [[38]]

### 2. Card-Based Post Management
- Each social post is a self-contained card
- Easy drag-and-drop reorganization (future enhancement)
- Clear status badges for workflow visibility

### 3. Platform-Agnostic Content Model
- Single post can target multiple platforms
- Caption auto-adapts per platform constraints (Twitter char limit, Instagram hashtags)
- Media type validation per platform requirements

### 4. Metricool API Proxy
- Server-side API routes prevent client-side key exposure
- Rate limiting and caching at API layer
- Fallback mock data for development

### 5. RSS Feed Aggregation Strategy
- Server-side fetching to avoid CORS issues
- Topic-based filtering (tools/research/business)
- 24-hour cache for performance

## Component Conventions

### PostCard
- Props: `post`, `onCopy`, `onPublish`, `onEdit`
- Copy button uses Clipboard API with toast feedback
- Publish button triggers platform-specific OAuth flow (future)

### Analytics Charts
- All charts use consistent color palette from theme
- Responsive design: stack on mobile, grid on desktop
- Date range picker persists to URL params

### Calendar Chips
- Color-coded by platform using brand colors
- Hover shows post preview tooltip
- Click day to expand detailed view

## Environment Variables
```env
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000
METRICOOL_API_KEY=your_key_here
METRICOOL_API_URL=https://api.metricool.com

# Optional (for enhanced features)
RSS_CACHE_TTL=86400  # 24 hours in seconds
ENABLE_MOCK_DATA=true  # For development