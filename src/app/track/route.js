import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const memberId = searchParams.get("memberId") || searchParams.get("userId");

  if (teamId || memberId) {
    try {
      await client.mutation(api.teams.incrementClick, { 
        teamId: teamId || undefined, 
        userId: memberId || undefined 
      });
    } catch (error) {
      console.error("Tracking failed on server:", error);
    }
  }

  // Redirect directly to the external feedback URL
  return Response.redirect("https://cf.sbmurban.org/", 302);
}
