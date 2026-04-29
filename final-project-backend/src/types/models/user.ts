import type { BaseDocument, UserRole } from "../common.js";

export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface IUserDocument extends IUser {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
