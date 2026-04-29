export type UserRole = 'VIEWER' | 'EDITOR' | 'SUPER_USER';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export const UserRole = {
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
  SUPER_USER: 'SUPER_USER',
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
} as const;
