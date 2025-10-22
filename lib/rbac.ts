import { Role } from '@prisma/client';

export type Permission = 
  | 'logs:read'
  | 'logs:write'
  | 'traces:read'
  | 'traces:write'
  | 'metrics:read'
  | 'metrics:write'
  | 'alerts:read'
  | 'alerts:write'
  | 'alerts:manage'
  | 'users:read'
  | 'users:write'
  | 'error-budget:read'
  | 'error-budget:write';

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: [
    'logs:read',
    'logs:write',
    'traces:read',
    'traces:write',
    'metrics:read',
    'metrics:write',
    'alerts:read',
    'alerts:write',
    'alerts:manage',
    'users:read',
    'users:write',
    'error-budget:read',
    'error-budget:write',
  ],
  DEVELOPER: [
    'logs:read',
    'logs:write',
    'traces:read',
    'traces:write',
    'metrics:read',
    'metrics:write',
    'alerts:read',
    'alerts:write',
    'error-budget:read',
  ],
  VIEWER: [
    'logs:read',
    'traces:read',
    'metrics:read',
    'alerts:read',
    'error-budget:read',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

