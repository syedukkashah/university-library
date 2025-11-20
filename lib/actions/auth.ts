"use server";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">, //picking email and pswd from auth creds
  skipRateLimit?: boolean // Allow skipping rate limit for internal calls
) => {
  const { email, password } = params;

  //implemented rate limiting if too many requests for sign in or sign up are made
  if (!skipRateLimit) {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";

    try {
      const rateLimitResult = await ratelimit.limit(ip);
      console.log("🔒 Rate limit check (signIn):", {
        ip,
        success: rateLimitResult.success,
        remaining: rateLimitResult.remaining,
        reset: rateLimitResult.reset,
        limit: rateLimitResult.limit,
      });

      if (!rateLimitResult.success) {
        console.log("❌ Rate limit exceeded - blocking sign in");
        return {
          success: false,
          error: "RATE_LIMITED",
          rateLimited: true,
        };
      }
      console.log(
        "✅ Rate limit check passed - proceeding with authentication"
      );
    } catch (error) {
      console.error(
        "❌ Rate limit error - blocking request for security:",
        error
      );
      // Fail closed: if rate limiting fails, block the request for security
      return {
        success: false,
        error: "RATE_LIMIT_SERVICE_ERROR",
        rateLimited: true,
      };
    }
  } else {
    console.log("⏭️  Rate limit skipped (internal call)");
  }

  // Proceed with authentication only if rate limit check passed
  try {
    console.log("🔐 Attempting authentication for:", email);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      console.log("❌ Authentication failed:", result.error);
      return { success: false, error: result.error };
    }
    console.log("✅ Authentication successful");
    return { success: true };
  } catch (error) {
    console.log("❌ Signin error:", error);
    return { success: false, error: "Signin error" };
  }
};
export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityId, password, universityCard } = params;

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";

  try {
    const rateLimitResult = await ratelimit.limit(ip);
    console.log("🔒 Rate limit check (signUp):", {
      ip,
      success: rateLimitResult.success,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
      limit: rateLimitResult.limit,
    });

    if (!rateLimitResult.success) {
      console.log("❌ Rate limit exceeded - blocking sign up");
      return {
        success: false,
        error: "RATE_LIMITED",
        rateLimited: true,
      };
    }
    console.log("✅ Rate limit check passed - proceeding with sign up");
  } catch (error) {
    console.error(
      "❌ Rate limit error (signUp) - blocking request for security:",
      error
    );
    // Fail closed: if rate limiting fails, block the request for security
    return {
      success: false,
      error: "RATE_LIMIT_SERVICE_ERROR",
      rateLimited: true,
    };
  }

  // checking if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    await signInWithCredentials({ email, password }, true); // Skip rate limit for internal call
    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};
