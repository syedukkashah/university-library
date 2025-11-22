import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "./database/schema";
import { eq } from "drizzle-orm";
import { db } from "./database/drizzle";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);
          if (user.length === 0) return null;

          const isPasswordValid = await compare(
            credentials.password.toString(),
            user[0].password
          );

          if (!isPasswordValid) return null;

          return {
            id: String(user[0].id),
            email: user[0].email,
            name: user[0].fullName,
          } as User;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.email = String(token.email);
        session.user.name = String(token.name);
      }
      return session;
    },
  },
});
