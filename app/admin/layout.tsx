import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import "@/styles/admin.css";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  // Ensure ID is a string - handle both string and object cases
  let userId: string;
  const sessionId = session.user.id;

  if (typeof sessionId === "string") {
    userId = sessionId;
  } else if (sessionId && typeof sessionId === "object") {
    // If it's an object, try various ways to extract the ID
    const idObj = sessionId as any;

    // Try common property names first
    userId = idObj.value || idObj.id || idObj.toString?.();

    // If we got [object Object] or nothing useful, try to find UUID in object
    if (!userId || userId === "[object Object]") {
      // Look for any property that looks like a UUID
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      for (const key in idObj) {
        if (typeof idObj[key] === "string" && uuidPattern.test(idObj[key])) {
          userId = idObj[key];
          break;
        }
      }

      // Last resort: try JSON stringify and extract UUID from it
      if (!userId || userId === "[object Object]") {
        const jsonStr = JSON.stringify(idObj);
        const uuidMatch = jsonStr.match(uuidPattern);
        userId = uuidMatch ? uuidMatch[0] : String(sessionId);
      }
    }
  } else {
    userId = String(sessionId);
  }

  // Final validation - if we still don't have a valid UUID, log and redirect
  if (!userId || userId === "[object Object]" || userId.length < 10) {
    console.error("Invalid user ID format:", sessionId);
    redirect("/sign-in");
  }

  const isAdmin = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((res) => res[0]?.role === "ADMIN");

  if (!isAdmin) redirect("/");
  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar session={session} />
      <div className="admin-container">
        <Header session={session} />
        {children}
      </div>
    </main>
  );
};

export default Layout;
