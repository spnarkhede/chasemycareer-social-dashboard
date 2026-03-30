# Create all folders - using LiteralPath for special characters
$folders = @(
    'src/app/api/auth/[...nextauth]','src/app/api/auth/verify-email','src/app/api/auth/forgot-password','src/app/api/auth/reset-password',
    'src/app/api/auth/2fa/setup','src/app/api/auth/2fa/verify','src/app/api/auth/2fa/disable','src/app/api/auth/session','src/app/api/auth/register',
    'src/app/api/posts/[id]/publish','src/app/api/posts/bulk/delete','src/app/api/posts/ab-test',
    'src/app/api/analytics/realtime','src/app/api/analytics/sentiment','src/app/api/analytics/trends','src/app/api/analytics/roi','src/app/api/analytics/top-posts',
    'src/app/api/automation/rules/[id]','src/app/api/automation/queue/process','src/app/api/automation/queue/status','src/app/api/automation/templates/[id]','src/app/api/automation/analytics',
    'src/app/api/oauth/[platform]/authorize','src/app/api/oauth/[platform]/callback','src/app/api/oauth/refresh',
    'src/app/api/webhooks/linkedin','src/app/api/webhooks/instagram','src/app/api/webhooks/twitter','src/app/api/webhooks/facebook',
    'src/app/api/metricool/analytics','src/app/api/metricool/posts/[id]','src/app/api/metricool/competitors',
    'src/app/api/rss/feed','src/app/api/rss/sources',
    'src/app/api/ai/generate','src/app/api/ai/images','src/app/api/ai/optimize','src/app/api/ai/history','src/app/api/ai/suggestions',
    'src/app/api/ai/videos','src/app/api/ai/comments','src/app/api/ai/posting-time','src/app/api/ai/competitors','src/app/api/ai/sentiment','src/app/api/ai/trends',
    'src/app/api/media/unsplash','src/app/api/media/pexels','src/app/api/media/pixabay',
    'src/app/api/users/profile','src/app/api/users/avatar','src/app/api/users/onboarding',
    'src/app/api/teams/[id]/members','src/app/api/teams/[id]/invites',
    'src/app/api/templates/[id]',
    'src/app/api/reports/export','src/app/api/reports/schedule',
    'src/app/api/security/audit','src/app/api/security/keys','src/app/api/security/encrypt',
    'src/app/api/notifications/[id]/mark-read',
    'src/app/api/links/[id]','src/app/api/links/track','src/app/api/links/qr',
    'src/app/api/optimizer/generate',
    'src/app/api/cron/refresh-analytics','src/app/api/cron/process-posts','src/app/api/cron/backup',
    'src/app/api/health',
    'src/app/auth/signin','src/app/auth/signup','src/app/auth/verify-email','src/app/auth/forgot-password','src/app/auth/reset-password','src/app/auth/2fa/setup','src/app/auth/2fa/verify',
    'src/app/(emails)/verify-email','src/app/(emails)/reset-password','src/app/(emails)/team-invite','src/app/(emails)/notification',
    'src/app/[username]',
    'src/app/dashboard/posts/components','src/app/dashboard/posts/hooks','src/app/dashboard/posts/lib',
    'src/app/dashboard/analytics/components','src/app/dashboard/analytics/hooks','src/app/dashboard/analytics/lib',
    'src/app/dashboard/calendar/components','src/app/dashboard/calendar/hooks','src/app/dashboard/calendar/lib',
    'src/app/dashboard/competitors/components','src/app/dashboard/competitors/hooks','src/app/dashboard/competitors/lib',
    'src/app/dashboard/news/components','src/app/dashboard/news/hooks','src/app/dashboard/news/lib',
    'src/app/dashboard/ai-content/components','src/app/dashboard/ai-content/hooks',
    'src/app/dashboard/automation/rules','src/app/dashboard/automation/templates','src/app/dashboard/automation/queue','src/app/dashboard/automation/analytics','src/app/dashboard/automation/compliance',
    'src/app/dashboard/teams/[id]',
    'src/app/dashboard/settings/security','src/app/dashboard/settings/notifications','src/app/dashboard/settings/billing','src/app/dashboard/settings/api-keys',
    'src/app/dashboard/onboarding','src/app/dashboard/reports','src/app/dashboard/links/[id]',
    'src/app/dashboard/profile-optimizer/components',
    'src/app/dashboard/ai/content-suggestions','src/app/dashboard/ai/image-generator','src/app/dashboard/ai/video-creator','src/app/dashboard/ai/comment-responses','src/app/dashboard/ai/posting-time','src/app/dashboard/ai/competitor-analysis','src/app/dashboard/ai/sentiment-analysis','src/app/dashboard/ai/trend-prediction',
    'components/ui','components/layout','components/security','components/loading','components/accessibility','components/seo','components/shared','components/links','components/optimizer',
    'lib/security','lib/oauth','lib/analytics','lib/automation','lib/api/social','lib/ai','lib/media','lib/social','lib/utils','lib/backup','lib/monitoring','lib/links','lib/optimizer',
    'hooks','types','prisma/migrations','public/icons','public/link-themes','styles','docs','scripts','__tests__/e2e','__tests__/integration','__tests__/unit','.github/ISSUE_TEMPLATE','.github/workflows','.husky','.vscode'
)

foreach($folder in $folders) {
    New-Item -ItemType Directory -LiteralPath $folder -Force -ErrorAction SilentlyContinue | Out-Null
}

# Create all files
$files = @(
    'src/app/layout.tsx','src/app/page.tsx','src/app/globals.css','src/app/error.tsx','src/app/loading.tsx','src/app/not-found.tsx',
    'middleware.ts','next.config.js','tailwind.config.ts','tsconfig.json','components.json','vercel.json','playwright.config.ts','vitest.config.ts',
    'sentry.client.config.ts','sentry.server.config.ts','sentry.edge.config.ts',
    'prisma/schema.prisma','prisma/seed.ts',
    'lib/auth.ts','lib/prisma.ts','lib/utils.ts','lib/validations.ts','lib/rate-limit.ts','lib/api-error.ts','lib/cron.ts',
    'types/index.ts','hooks/usePosts.ts',
    'styles/globals.css','styles/shadcn.css',
    'public/manifest.json',
    'docs/API.md','docs/SECURITY.md','docs/DEPLOYMENT.md','docs/BACKUP.md','docs/ONBOARDING.md','docs/CONTRIBUTING.md','docs/CHANGELOG.md','docs/OAUTH-SETUP.md','docs/ARCHITECTURE.md','docs/TROUBLESHOOTING.md',
    'scripts/setup.sh','scripts/backup.ts','scripts/restore.ts','scripts/rotate-keys.ts','scripts/health-check.ts','scripts/security-audit.ts','scripts/generate-docs.ts','scripts/seed-test-data.ts',
    '__tests__/setup.ts',
    '.github/PULL_REQUEST_TEMPLATE.md','.github/CODEOWNERS','.github/FUNDING.yml',
    '.vscode/settings.json','.vscode/extensions.json','.vscode/launch.json',
    'LICENSE','CLAUDE.md','CONTRIBUTING.md','CHANGELOG.md','docker-compose.yml','Dockerfile','.env.example','.gitignore','README.md'
)

foreach($file in $files) {
    if(!(Test-Path -LiteralPath $file)) {
        "" | Out-File -FilePath $file -Encoding UTF8
    }
}

# Output success
$folderCount = $folders.Count
$fileCount = $files.Count
Write-Host "✓ Created $folderCount folders and $fileCount files!" -ForegroundColor Green

# Verify folders with brackets
Write-Host "`nVerifying folders with special characters..." -ForegroundColor Cyan
Write-Host "Testing [...nextauth]: $(Test-Path -LiteralPath 'src/app/api/auth/[...nextauth]')" -ForegroundColor $(if(Test-Path -LiteralPath 'src/app/api/auth/[...nextauth]'){'Green'}else{'Red'})
Write-Host "Testing [id]/publish: $(Test-Path -LiteralPath 'src/app/api/posts/[id]/publish')" -ForegroundColor $(if(Test-Path -LiteralPath 'src/app/api/posts/[id]/publish'){'Green'}else{'Red'})
Write-Host "Testing (emails): $(Test-Path -LiteralPath 'src/app/(emails)')" -ForegroundColor $(if(Test-Path -LiteralPath 'src/app/(emails)'){'Green'}else{'Red'})
Write-Host "Testing [username]: $(Test-Path -LiteralPath 'src/app/[username]')" -ForegroundColor $(if(Test-Path -LiteralPath 'src/app/[username]'){'Green'}else{'Red'})