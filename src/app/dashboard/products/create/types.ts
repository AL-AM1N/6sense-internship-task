export interface Role {
  _id: string;
  name?: string;
}

export interface TeamStructure {
  _id: string;
  role: Role;
  employeeRoleId: string;
  internalRate: number;
  billRate: number;
}

export interface RateSheet {
  _id: string;
  name?: string;
  teamStructures: TeamStructure[];
}

export interface Company {
  _id: string;
  name: string;
}

export interface TeamMember {
  _id: string;
  name: string;
}