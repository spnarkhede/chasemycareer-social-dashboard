#!/bin/bash

# ===========================================
# Chase My Career - Social Media Manager
# Complete Setup Script
# ===========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        print_info "Install from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed (recommended for version control)"
    else
        print_success "Git installed"
    fi
    
    # Check Node version (require 18+)
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required"
        print_info "Current version: $NODE_VERSION"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Create project directory
create_project() {
    print_header "Creating Project Directory"
    
    PROJECT_NAME="chasemycareer-social-dashboard"
    
    if [ -d "$PROJECT_NAME" ]; then
        print_warning "Directory $PROJECT_NAME already exists"
        read -p "Do you want to continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        mkdir -p "$PROJECT_NAME"
        print_success "Created directory: $PROJECT_NAME"
    fi
    
    cd "$PROJECT_NAME"
    print_info "Working directory: $(pwd)"
}

# Initialize Next.js project
initialize_nextjs() {
    print_header "Initializing Next.js Project"
    
    npx create-next-app@latest . \
        --typescript \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --use-npm
    
    print_success "Next.js project initialized"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_info "Installing production dependencies..."
    
    npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client \
        zod bcryptjs @upstash/redis @upstash/ratelimit socket.io socket.io-client \
        @sentry/nextjs dompurify jsdom recharts date-fns rss-parser \
        @anthropic-ai/sdk unsplash-js pdf-lib @otplib/core @otplib/plugin-totp \
        resend @react-email/components axios clsx tailwind-merge lucide-react \
        swr crypto-js ioredis bullmq nodemailer sharp next-themes \
        @hookform/resolvers react-hook-form @tanstack/react-table \
        @tanstack/react-query posthog-js @vercel/analytics @vercel/speed-insights \
        qrcode ua-parser-js geoip-lite
    
    print_success "Production dependencies installed"
    
    print_info "Installing development dependencies..."
    
    npm install -D @playwright/test vitest @vitest/ui @next/bundle-analyzer tsx \
        @types/bcryptjs @types/dompurify @types/jsdom @types/crypto-js \
        @types/nodemailer @types/ua-parser-js @types/geoip-lite \
        eslint-config-prettier prettier husky lint-staged
    
    print_success "Development dependencies installed"
}

# Initialize shadcn/ui
initialize_shadcn() {
    print_header "Initializing shadcn/ui"
    
    npx shadcn@latest init -d
    
    print_info "Adding shadcn components..."
    
    npx shadcn@latest add button card dialog input label select table tabs \
        calendar popover checkbox badge avatar dropdown-menu separator \
        scroll-area textarea switch sheet skeleton progress alert toast \
        sonner form accordion
    
    print_success "shadcn/ui initialized"
}

# Setup Prisma
setup_prisma() {
    print_header "Setting Up Prisma"
    
    npx prisma init
    
    print_success "Prisma initialized"
    
    print_info "You'll need to configure your database URL in .env"
}

# Create environment file
create_env_file() {
    print_header "Creating Environment File"
    
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists"
        read -p "Do you want to overwrite it? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing .env.local"
            return
        fi
    fi
    
    cat > .env.example << 'EOF'
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@host:5432/chasemycareer?schema=public"

# ===========================================
# NEXTAUTH
# ===========================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# ===========================================
# ENCRYPTION
# ===========================================
ENCRYPTION_KEY=""

# ===========================================
# OAUTH PROVIDERS
# ===========================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/oauth/linkedin/callback"
INSTAGRAM_CLIENT_ID=""
INSTAGRAM_CLIENT_SECRET=""
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/oauth/instagram/callback"
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
TWITTER_BEARER_TOKEN=""
TWITTER_REDIRECT_URI="http://localhost:3000/api/oauth/twitter/callback"
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
FACEBOOK_REDIRECT_URI="http://localhost:3000/api/oauth/facebook/callback"
TIKTOK_CLIENT_KEY=""
TIKTOK_CLIENT_SECRET=""
YOUTUBE_CLIENT_ID=""
YOUTUBE_CLIENT_SECRET=""
PINTEREST_APP_ID=""
PINTEREST_APP_SECRET=""

# ===========================================
# METRICOOL
# ===========================================
METRICOOL_API_KEY=""
METRICOOL_API_URL="https://api.metricool.com/v2"

# ===========================================
# QWEN AI
# ===========================================
QWEN_API_KEY=""
QWEN_MODEL="qwen-max"
QWEN_BASE_URL="https://dashscope.aliyuncs.com/api/v1"

# ===========================================
# MEDIA APIs
# ===========================================
UNSPLASH_ACCESS_KEY=""
PEXELS_API_KEY=""
PIXABAY_API_KEY=""

# ===========================================
# REDIS
# ===========================================
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
REDIS_URL="redis://localhost:6379"

# ===========================================
# EMAIL
# ===========================================
RESEND_API_KEY=""
EMAIL_FROM="Chase My Career <noreply@chasemycareer.com>"

# ===========================================
# SECURITY
# ===========================================
CRON_SECRET=""
LINKEDIN_WEBHOOK_SECRET=""
INSTAGRAM_WEBHOOK_SECRET=""
TWITTER_WEBHOOK_SECRET=""
FACEBOOK_WEBHOOK_SECRET=""

# ===========================================
# MONITORING
# ===========================================
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# ===========================================
# APPLICATION
# ===========================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
EOF

    cp .env.example .env.local
    
    print_success "Environment files created"
    print_warning "IMPORTANT: Edit .env.local with your actual credentials"
}

# Generate secrets
generate_secrets() {
    print_header "Generating Security Secrets"
    
    # Generate NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    print_success "Generated NEXTAUTH_SECRET"
    
    # Generate ENCRYPTION_KEY
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    print_success "Generated ENCRYPTION_KEY"
    
    # Generate CRON_SECRET
    CRON_SECRET=$(openssl rand -hex 16)
    print_success "Generated CRON_SECRET"
    
    # Update .env.local with generated secrets
    if [ -f ".env.local" ]; then
        sed -i.bak "s|NEXTAUTH_SECRET=\"\"|NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"|g" .env.local
        sed -i.bak "s|ENCRYPTION_KEY=\"\"|ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"|g" .env.local
        sed -i.bak "s|CRON_SECRET=\"\"|CRON_SECRET=\"$CRON_SECRET\"|g" .env.local
        rm -f .env.local.bak
        print_success "Updated .env.local with generated secrets"
    fi
}

# Create folder structure
create_folder_structure() {
    print_header "Creating Folder Structure"
    
    # Create directories
    mkdir -p app/api/auth/[...nextauth]
    mkdir -p app/api/posts
    mkdir -p app/api/analytics
    mkdir -p app/api/automation
    mkdir -p app/api/oauth/[platform]
    mkdir -p app/api/webhooks
    mkdir -p app/api/security
    mkdir -p app/api/health
    mkdir -p app/auth/signin
    mkdir -p app/auth/signup
    mkdir -p app/auth/verify-email
    mkdir -p app/auth/forgot-password
    mkdir -p app/auth/reset-password
    mkdir -p app/auth/2fa
    mkdir -p app/dashboard/posts
    mkdir -p app/dashboard/analytics
    mkdir -p app/dashboard/calendar
    mkdir -p app/dashboard/competitors
    mkdir -p app/dashboard/news
    mkdir -p app/dashboard/ai-content
    mkdir -p app/dashboard/automation
    mkdir -p app/dashboard/teams
    mkdir -p app/dashboard/templates
    mkdir -p app/dashboard/settings
    mkdir -p app/dashboard/onboarding
    mkdir -p app/dashboard/reports
    mkdir -p app/dashboard/links
    mkdir -p app/dashboard/profile-optimizer
    mkdir -p components/ui
    mkdir -p components/layout
    mkdir -p components/security
    mkdir -p components/loading
    mkdir -p components/accessibility
    mkdir -p components/seo
    mkdir -p components/shared
    mkdir -p components/links
    mkdir -p components/optimizer
    mkdir -p lib/security
    mkdir -p lib/oauth
    mkdir -p lib/analytics
    mkdir -p lib/automation
    mkdir -p lib/api/social
    mkdir -p lib/ai
    mkdir -p lib/media
    mkdir -p lib/social
    mkdir -p lib/utils
    mkdir -p lib/backup
    mkdir -p lib/monitoring
    mkdir -p lib/links
    mkdir -p lib/optimizer
    mkdir -p hooks
    mkdir -p types
    mkdir -p prisma/migrations
    mkdir -p public/icons
    mkdir -p public/link-themes
    mkdir -p styles
    mkdir -p docs
    mkdir -p scripts
    mkdir -p __tests__/e2e
    mkdir -p __tests__/integration
    mkdir -p __tests__/unit
    mkdir -p .github/workflows
    
    print_success "Folder structure created"
}

# Create essential files
create_essential_files() {
    print_header "Creating Essential Files"
    
    # Create .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
*.log

# Next.js
.next/
out/
build
dist

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Prisma
prisma/*.db
prisma/*.db-journal

# IDE
.idea
.vscode
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/
temp/
EOF
    
    print_success "Created .gitignore"
    
    # Create README.md
    cat > README.md << 'EOF'
# Chase My Career - Social Media Manager

Complete social media management platform with AI-powered content generation, automation, analytics, and multi-platform support.

## Features

- ✅ Multi-platform post management (9 platforms)
- ✅ AI content generation (Qwen AI)
- ✅ Analytics dashboard (Metricool integration)
- ✅ Content calendar
- ✅ Competitor tracking
- ✅ News consolidation
- ✅ Automation rules (comment-to-DM, follow-to-DM)
- ✅ Team collaboration
- ✅ Link-in-Bio pages
- ✅ Profile optimizer

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev