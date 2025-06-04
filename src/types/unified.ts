export type Provider = 'quickbooks' | 'stripe';

export interface CreateLinkResponse {
  url: string;
}

export interface Customer {
  id: string;
  companyName: string;
  email: string;
}
