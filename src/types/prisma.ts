// Fallback manual definitions to resolve stubborn editor errors
// These match the Prisma schema.

export interface Contractor {
  id: number;
  name: string;
  abbreviation: string | null;
  address: string | null;
  email: string | null;
  phone: string;
  licenseNumber: string | null;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  status: string;
  taxId: string | null;
  poBox: string | null;
  materials?: ContractorMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractorMaterial {
  id: number;
  name: string;
  contractorId: number;
}

export interface ContractorDocument {
  id: number;
  name: string;
  url: string;
  type: string | null;
  contractorId: number;
  createdAt: Date;
}

export interface Site {
  id: number;
  name: string;
  status: string;
  materials: SiteMaterial[];
  contractorId: number | null;
  contractor?: Contractor | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteMaterial {
  id: number;
  name: string;
  price: number;
  unit: string;
  locationFrom: string;
  locationTo: string;
  siteId: number;
}

