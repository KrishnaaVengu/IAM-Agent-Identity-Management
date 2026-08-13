export const ROLE_PERMISSIONS = {
 Admin: ['register', 'suspend', 'reactivate', 'decommission', 'rotate', 'runReview', 'viewAll'],
 'Team Owner': ['register', 'rotate', 'viewAll'],
 Viewer: ['viewAll'],
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;
export type Permission = (typeof ROLE_PERMISSIONS)[Role][number];
