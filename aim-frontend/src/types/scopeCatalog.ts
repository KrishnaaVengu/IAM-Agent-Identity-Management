export interface ScopeDefinition {
 id: string;
 label: string;
 description: string;
 sensitive: boolean;
 category: string;
}

export interface EndpointDefinition {
 endpointId: string;
 label: string;
 requiredScope: string;
}
