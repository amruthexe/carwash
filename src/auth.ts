import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./lib/db";
import User from "./models/User";
import { authConfig } from "./auth.config";

import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectToDatabase();
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        // --- MOCK CUSTOMER BACKDOOR FOR TESTING WITHOUT GOOGLE OAUTH ---
        if (email === "customer@test.com" && password === "customer123") {
          let mockCustomer = await User.findOne({ email: "customer@test.com" });
          if (!mockCustomer) {
             mockCustomer = await User.create({
               name: "Test Customer",
               email: "customer@test.com",
               role: "customer",
               status: "active"
             });
          }
          return {
            id: mockCustomer._id.toString(),
            name: mockCustomer.name,
            email: mockCustomer.email,
            role: mockCustomer.role,
          };
        }

        // --- MOCK ADMIN BACKDOOR FOR TESTING ---
        if (email === "admin@test.com" && password === "admin123") {
          let mockAdmin = await User.findOne({ email: "admin@test.com" });
          if (!mockAdmin) {
             mockAdmin = await User.create({
               name: "System Admin",
               email: "admin@test.com",
               role: "admin",
               status: "active"
             });
          }
          return {
            id: mockAdmin._id.toString(),
            name: mockAdmin.name,
            email: mockAdmin.email,
            role: mockAdmin.role,
          };
        }

        // --- MOCK WORKER BACKDOOR FOR TESTING ---
        if (email === "worker@test.com" && password === "worker123") {
          let mockWorker = await User.findOne({ email: "worker@test.com" });
          if (!mockWorker) {
             mockWorker = await User.create({
               name: "Test Worker",
               email: "worker@test.com",
               role: "worker",
               status: "active"
             });
          }
          return {
            id: mockWorker._id.toString(),
            name: mockWorker.name,
            email: mockWorker.email,
            role: mockWorker.role,
          };
        }
        // -------------------------------------------------------------

        const user = await User.findOne({ email: email });

        if (user && user.password) {
          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // Simple mock auth for non-customers via seed password for simplicity
        if (user && (password === "admin123" || password === "admin@123")) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          existingUser = await User.create({
            name: user.name || "Customer",
            email: user.email,
            googleId: account.providerAccountId,
            role: "customer",
            status: "active"
          });
        }
        
        // Populate user object id 
        user.id = existingUser._id.toString();
        // @ts-ignore
        user.role = existingUser.role;
      }
      return true;
    },
  },
});

