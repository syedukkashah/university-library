import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

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
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].fullname,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.email = String(user.email);
        token.name = String(user.name || "");
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Ensure values are always strings, never objects
        session.user.id =
          typeof token.id === "string" ? token.id : String(token.id || "");
        session.user.email =
          typeof token.email === "string"
            ? token.email
            : String(token.email || "");
        session.user.name =
          typeof token.name === "string"
            ? token.name
            : String(token.name || "");
      }
      return session;
    },
  },
});
