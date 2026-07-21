import mongoose from "mongoose";
import bcrypt from "bcrypt";
import type { HydratedDocument } from "mongoose";

// -----------------------------USER INTERFACE-----------------------------
export interface IUser {
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  authProviders: ("local" | "google")[];
  googleId?: string;
}

// -----------------------------USER METHODS-----------------------
interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

// -----------------------------USER DOCUMENT----------------------
export type UserDocument =
  HydratedDocument<
    IUser,
    IUserMethods
  >;

// -----------------------------USER MODEL-------------------------
type UserModel =
  mongoose.Model<
    IUser,
    {},
    IUserMethods
  >;

// -----------------------------SCHEMA-----------------------------  
const userSchema = new mongoose.Schema<
    IUser,
    UserModel,
    IUserMethods
  >(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      trim: true,
      minlength: 8,
      select: false
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    authProviders: {
      type: [String],
      enum: ["local", "google"],
      default: ["local"],
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// -----------------------------PRE SAVE HOOK-----------------------------
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// -----------------------------INSTANCE METHODS---------------------------
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) {
  return false;
}

return bcrypt.compare(
  password,
  this.password
);
};

const User = mongoose.model<IUser,UserModel>("User", userSchema);

export default User;
