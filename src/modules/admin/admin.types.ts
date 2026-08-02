// ----------------------------------Admin actions--------------------------
export interface CreateInviteProps {
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  invitedById: string;
  invitedByName: string;
}

export interface CreateInviteResult {
  type: "SUCCESS" | "EMAIL_ALREADY_REGISTERED" | "INVITE_ALREADY_EXISTS";
}

export interface BanActionProps {
  targetUserId: string;
  actingUser: { id: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" };
}

export interface BanActionResult {
  type:
    | "SUCCESS"
    | "NOT_FOUND"
    | "SELF_BAN_FORBIDDEN"
    | "INSUFFICIENT_AUTHORITY"
    | "ALREADY_IN_STATE"; 
}

export interface RoleChangeActionProps {
  targetUserId: string;
  actingUser: { id: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" };
}

export interface RoleChangeActionResult {
  type:
    | "SUCCESS"
    | "NOT_FOUND"
    | "INVALID_TARGET_ROLE" 
    | "INSUFFICIENT_AUTHORITY";
}

export interface GetAllUsersProps {
  actingUserRole: "ADMIN" | "SUPER_ADMIN";
  page: number;
  limit: number;
}

export interface AdminUserListItem {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isBanned: boolean;
  createdAt: Date;
}