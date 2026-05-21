export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export type Permission = 
  | "manage_users"
  | "manage_settings"
  | "manage_roles"
  | "manage_menu"
  | "delete_content"
  | "publish_content"
  | "edit_content"
  | "view_analytics";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "manage_users", "manage_settings", "manage_roles", 
    "manage_menu", "delete_content", "publish_content", 
    "edit_content", "view_analytics"
  ],
  ADMIN: [
    "manage_menu", "delete_content", "publish_content", 
    "edit_content", "view_analytics"
  ],
  EDITOR: [
    "edit_content"
  ]
};

export function hasPermission(userRole: string, userPermissions: Record<string, boolean> | null | undefined, permission: Permission): boolean {
  // If user has specific override for this permission, use it
  if (userPermissions && typeof userPermissions === 'object' && permission in userPermissions) {
    if (userPermissions[permission] === true) return true;
    if (userPermissions[permission] === false) return false;
  }

  // Otherwise fallback to role defaults
  const role = (userRole || "EDITOR").toUpperCase() as Role;
  const defaults = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.EDITOR;
  
  return defaults.includes(permission);
}
