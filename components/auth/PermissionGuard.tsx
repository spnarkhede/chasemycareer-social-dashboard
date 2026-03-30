// components/auth/PermissionGuard.tsx
"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  permissions: string[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function PermissionGuard({ 
  children, 
  permissions, 
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allowed = requireAll 
    ? hasAllPermissions(permissions as any)
    : hasAnyPermission(permissions as any);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage Example:
/*
<PermissionGuard permissions={["posts:publish"]} fallback={
  <div className="text-muted-foreground text-sm">
    You don't have permission to publish posts
  </div>
}>
  <Button onClick={handlePublish}>Publish Post</Button>
</PermissionGuard>
*/