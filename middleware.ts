import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/site", "/api/uploadthing"],
  async beforeAuth(auth: any, req: any) {},
  async afterAuth(auth: any, req: any) {
    //rewrite for domains
    const { nextUrl } = req;

    const searchParams = nextUrl.searchParams.toString();

    let hostname = req.headers;

    const pathWithSearchParams = `${nextUrl.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    //Check if subdomain exists
    const customSubDomain = hostname
      .get("host")
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0];

    if (customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
      );
    }

    //If URL is /sign-in or /sign-up
    if (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up") {
      return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
    }

    //If URL is / in or /site & host is equal to domain
    if (
      nextUrl.pathname === "/" ||
      (nextUrl.pathname === "/site" &&
        nextUrl.host === process.env.NEXT_PUBLIC_DOMAIN)
    ) {
      return NextResponse.rewrite(new URL("/site", req.url));
    }

    if (
      nextUrl.pathname.startsWith("/agency") ||
      nextUrl.pathname.startsWith("/subaccount")
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
