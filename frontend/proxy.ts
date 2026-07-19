import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }


  const token = req.cookies.get("access_token")?.value;


  if (!token) {
    const loginUrl = new URL("/login", req.url);

    loginUrl.searchParams.set(
      "callbackurl",
      req.nextUrl.pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};
