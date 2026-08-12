import type { ScopeDefinition } from '../types/scopeCatalog';

export const SCOPE_CATALOG: ScopeDefinition[] = [
  {
    id: 'read:documents',
    label: 'Read Documents',
    description: 'Allows reading document repositories',
    sensitive: false,
    category: 'Documents'
  },
  {
    id: 'write:documents',
    label: 'Write Documents',
    description: 'Allows writing document repositories',
    sensitive: false,
    category: 'Documents'
  },
  {
    id: 'read:tickets',
    label: 'Read Tickets',
    description: 'Allows reading support tickets',
    sensitive: false,
    category: 'Tickets'
  },
  {
    id: 'write:tickets',
    label: 'Write Tickets',
    description: 'Allows creating and updating support tickets',
    sensitive: false,
    category: 'Tickets'
  },
  {
    id: 'read:financial_records',
    label: 'Read Financial Records',
    description: 'Allows viewing sensitive financial ledgers',
    sensitive: true,
    category: 'Financial'
  },
  {
    id: 'write:financial_records',
    label: 'Write Financial Records',
    description: 'Allows updating financial ledgers and transactions',
    sensitive: true,
    category: 'Financial'
  },
  {
    id: 'read:users',
    label: 'Read Users',
    description: 'Allows viewing user accounts',
    sensitive: false,
    category: 'Users'
  },
  {
    id: 'write:users',
    label: 'Write Users',
    description: 'Allows creating and updating user accounts',
    sensitive: true,
    category: 'Users'
  },
  {
    id: 'delete:users',
    label: 'Delete Users',
    description: 'Allows deleting user accounts',
    sensitive: true,
    category: 'Users'
  },
  {
    id: 'deploy:infra',
    label: 'Deploy Infrastructure',
    description: 'Allows triggering infrastructure deployments',
    sensitive: true,
    category: 'Infrastructure'
  }
];
