import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI not found in environment. Please check your .env file.");
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB Atlas database.");
    
    const email = "admin@gourmet.com";
    const password = "adminpassword123";
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin user with email "${email}" already exists!`);
      process.exit(0);
    }
    
    // Create new admin user
    await User.create({
      name: "System Admin",
      email,
      password,
      isAdmin: true
    });
    
    console.log("\n================================================");
    console.log("SUCCESS: Admin User Created in MongoDB Atlas!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
