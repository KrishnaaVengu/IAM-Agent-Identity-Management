export interface ScopeDefinition {
  endpointId: string;
  label: string;
  requiredScope: string;
}

export const ENDPOINT_CATALOG: ScopeDefinition[] = [
  { endpointId: 'get_documents', label: 'GET /documents', requiredScope: 'read:documents' },
  { endpointId: 'post_documents', label: 'POST /documents', requiredScope: 'write:documents' },
  { endpointId: 'get_tickets', label: 'GET /tickets', requiredScope: 'read:tickets' },
  { endpointId: 'post_tickets', label: 'POST /tickets', requiredScope: 'write:tickets' },
  { endpointId: 'get_financial_records', label: 'GET /financial-records', requiredScope: 'read:financial_records' },
  { endpointId: 'post_financial_records', label: 'POST /financial-records', requiredScope: 'write:financial_records' },
  { endpointId: 'get_users', label: 'GET /users', requiredScope: 'read:users' },
  { endpointId: 'post_users', label: 'POST /users', requiredScope: 'write:users' },
  { endpointId: 'delete_users', label: 'DELETE /users/:id', requiredScope: 'delete:users' },
  { endpointId: 'deploy_infra', label: 'POST /infra/deploy', requiredScope: 'deploy:infra' }
];
