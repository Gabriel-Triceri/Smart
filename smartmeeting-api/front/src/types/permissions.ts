// Permission and Role Types
export interface Permission {
    id: number;
    nome: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PermissionDTO {
    id?: number;
    nome: string;
}

export interface Role {
    id: number;
    nome: string;
    permissions: string[]; // Array of permission names
    createdAt?: string;
    updatedAt?: string;
}
    
export interface RoleDTO {
    id?: number;
    nome: string;
    permissions?: string[];
}

export interface RoleWithPermissions extends Omit<Role, 'permissions'> {
    permissions: Permission[]; // Full permission objects
}

export interface UserRole {
    userId: number;
    userName: string;
    userEmail: string;
    roles: string[]; // Array of role names
}

// Form Data Types
export interface PermissionFormData {
    nome: string;
}

export interface RoleFormData {
    nome: string;
}

export interface RolePermissionAssignment {
    roleId: number;
    permissionIds: number[];
}

export interface UserRoleAssignment {
    userId: number;
    roleIds: number[];
}
