// hooks/usePermissions.ts
"use client";

import { useSession } from "next-auth/react";

type Permission = 
  | "posts:create"
  | "posts:edit"
  | "posts:delete"
  | "posts:publish"
  | "analytics:view"
  | "calendar:edit"
  | "team:manage"
  | "settings:edit";

const rolePermissions: Record<string, Permission[]> = {
  OWNER: [
    "posts:create", "posts:edit", "posts:delete", "posts:publish",
    "analytics:view", "calendar:edit", "team:manage", "settings:edit"
  ],
  ADMIN: [
    "posts:create", "posts:edit", "posts:delete", "posts:publish",
    "analytics:view", "calendar:edit", "team:manage"
  ],
  MEMBER: [
    "posts:create", "posts:edit", "posts:publish",
    "analytics:view", "calendar:edit"
  ],
  VIEWER: [
    "analytics:view"
  ],
};

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    role: userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner: userRole === "OWNER",
    isAdmin: userRole === "ADMIN" || userRole === "OWNER",
  };
}