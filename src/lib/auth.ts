import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTHORIZE START]: Attempting to sign in user...");

        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTHORIZE FAIL]: Missing email or password.");
          throw new Error("Invalid credentials");
        }

        console.log(
          `[AUTHORIZE STEP 1]: Searching for user with email: ${credentials.email}`,
        );
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          console.error(
            `[AUTHORIZE FAIL]: User not found or password not set for email: ${credentials.email}`,
          );
          throw new Error("Invalid credentials");
        }

        console.log(`[AUTHORIZE STEP 2]: User found. Comparing passwords...`);
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isCorrectPassword) {
          console.error(
            `[AUTHORIZE FAIL]: Password incorrect for email: ${credentials.email}`,
          );
          throw new Error("Invalid credentials");
        }

        console.log(
          `[AUTHORIZE SUCCESS]: Passwords match for user: ${user.id}. Returning user object.`,
        );
        return user;
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tokenBalance = (user as any).tokenBalance ?? 0;
        token.currency = (user as any).currency ?? "GBP";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        (session.user as any).tokenBalance = token.tokenBalance;
        (session.user as any).currency = token.currency;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Force localhost for development
      const localBaseUrl = 'http://localhost:3000';
      
      // If it's a relative URL, use localhost
      if (url.startsWith("/")) return `${localBaseUrl}${url}`;
      
      // If it's an absolute URL, check if it's localhost
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === localBaseUrl) return url;
      } catch {
        // Invalid URL, return localhost
      }
      
      // Default to localhost
      return localBaseUrl;
    },
  },
};
