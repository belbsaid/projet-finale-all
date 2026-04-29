import { Model, model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUserDocument } from "../types/models/user.js";

const SALT_ROUNDS = 10;

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  },
);

userSchema.index({ role: 1 });

/**
 * Pre-save hook: hash password only when it has been modified (or is new).
 * Never stores plaintext passwords.
 */
userSchema.pre("save", async function () {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
});

/**
 * Instance method to securely compare a candidate password against the hash.
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<IUserDocument> = model<IUserDocument>(
  "User",
  userSchema,
);

export default UserModel;
