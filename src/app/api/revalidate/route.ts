import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiResponse, apiError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/auth-check";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return apiError("Unauthorized", 401);

  try {
    const { path } = await request.json();

    if (!path) {
      return apiError("Path is required", 400);
    }

    revalidatePath(path);
    
    return apiResponse({ 
      data: { revalidated: true, path, now: Date.now() } 
    });
  } catch {
    return apiError("Failed to revalidate", 500);
  }
}
