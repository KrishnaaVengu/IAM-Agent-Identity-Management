import { useRoleStore } from '../stores/roleStore';
import { ROLE_PERMISSIONS } from '../lib/permissions';

export const usePermission = (action: string): boolean => {
  const role = useRoleStore((s) => s.role);
  return (ROLE_PERMISSIONS[role] as readonly string[])?.includes(action) ?? false;
};
