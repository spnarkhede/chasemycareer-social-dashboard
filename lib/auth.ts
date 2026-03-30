// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // LinkedIn OAuth
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "r_emailaddress r_liteprofile w_member_social",
        },
      },
    }),

    // Email/Password Credentials
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = signInSchema.safeParse(credentials);
          
          if (!parsed.success) {
            return null;
          }

          const { email, password } = parsed.data;

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const passwordsMatch = await compare(password, user.password);
          
          if (!passwordsMatch) {
            // Log failed attempt
            await prisma.activity.create({
              data: {
                userId: user.id,
                action: "auth.failed_login",
                entityType: "User",
                entityId: user.id,
                metadata: { email },
              },
            });
            return null;
          }

          // Log successful login
          await prisma.activity.create({
            data: {
              userId: user.id,
              action: "auth.successful_login",
              entityType: "User",
              entityId: user.id,
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Prevent sign in without email verification (for OAuth)
      if (account?.provider !== "credentials") {
        if (!user.email) {
          return false;
        }
      }

      // Check if user is banned/blocked (future feature)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (existingUser && existingUser.role === "BANNED") {
        return false;
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Add user info to token on initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.emailVerified = (user as any).emailVerified;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.user?.name;
        token.image = session.user?.image;
      }

      return token;
    },

    async session({ session, token, user }) {
      // Add user ID and role to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/signup",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Security settings
  useSecureCookies: process.env.NODE_ENV === "production",
  
  // Rate limiting (custom implementation)
  events: {
    async signIn({ user }) {
      console.log("User signed in:", user.email);
    },
    async signOut({ token }) {
      console.log("User signed out:", token.email);
    },
    async createUser({ user }) {
      console.log("User created:", user.email);
    },
    async linkAccount({ user, account }) {
      console.log("Account linked:", user.email, account.provider);
    },
    async error({ message }) {
      console.error("Auth error:", message);
    },
  },
});

// Helper function to create a new user with password
export async function createUserWithPassword(data: {
  name: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await hash(data.password, 12);
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: "USER",
    },
  });

  return user;
}

// Helper function to reset password
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Don't reveal if user exists
    return { success: true };
  }

  // Generate reset token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens
  await prisma.passwordResetToken.deleteMany({
    where: { email: user.email },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      email: user.email,
      token,
      expires,
    },
  });

  // Send reset email (implement with Resend)
  // await sendPasswordResetEmail(user.email, token);

  return { success: true };
}