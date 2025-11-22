import { handlers } from "@/auth";

// Export handlers for NextAuth with error handling
export const { GET, POST } = handlers;

// Optional: Add a simple health check endpoint
export async function HEAD() {
  return new Response("OK");
}
