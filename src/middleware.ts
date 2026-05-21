import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// We use a regular function to handle redirects first
// Then we wrap the admin protection
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Handle Redirects (Public Routes)
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    try {
      // In a real production app, you'd cache this in Redis
      // For this environment, we'll fetch from the API to avoid Prisma Edge issues if they exist
      const baseUrl = req.nextUrl.origin;
      const res = await fetch(`${baseUrl}/api/admin/redirects`, { 
        next: { revalidate: 300 } // Cache for 5 mins
      });
      
      if (res.ok) {
        const redirects = await res.json();
        const redirect = redirects.find((r: { isActive: boolean, from: string, to: string, type: number }) => r.isActive && r.from === pathname);
        
        if (redirect) {
          return NextResponse.redirect(new URL(redirect.to, req.url), redirect.type);
        }
      }
    } catch (error) {
      console.error("[Middleware] Redirect check failed:", error);
    }
  }

  // 2. Handle Admin Auth
  if (pathname.startsWith("/admin")) {
    const publicAdminPaths = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
    if (publicAdminPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // Use withAuth more directly for admin routes, passing the secret explicitly for Edge runtime compatibility
    const response = await withAuth(
      function middleware() {
        return NextResponse.next();
      },
      {
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: "/admin/login",
        },
      }
    )(req as NextRequest & { nextauth: { token: unknown } }, {} as never);

    return response || NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static files and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|img|js|css|lib).*)"],
};
