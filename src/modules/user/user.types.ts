// ----------------------------------SaveUser---------------------------------
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  emailVerificationToken: string;
  emailVerificationExpires: Date;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
};
