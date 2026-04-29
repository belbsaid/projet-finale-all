import "dotenv/config";
import mongoose from "mongoose";
import UserModel from "./models/User.js";

const ADMIN = {
  name: "Super Admin",
  email: "autoship@gmail.com",
  password: "Admin@5678",
  phone: "+213 555 00 00 00",
  role: "admin" as const,
};

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI as string, {
    dbName: process.env.MONGODB_DB_NAME,
    auth: {
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    },
  });

  const existing = await UserModel.findOne({ email: ADMIN.email });

  if (existing) {
    console.log(`Admin already exists: ${ADMIN.email}`);
  } else {
    await UserModel.create(ADMIN);
    console.log("Admin created successfully.");
  }

  console.log("----------------------------");
  console.log("  Email   :", ADMIN.email);
  console.log("  Password:", ADMIN.password);
  console.log("----------------------------");

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
