import { defineMiddleware } from "astro:middleware";

import { getUserFromCookie, SESSION_COOKIE } from "./cms/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    let user = null;
    try {
      user = await getUserFromCookie(context.cookies.get(SESSION_COOKIE)?.value);
    } catch (error) {
      console.error("[cms] session lookup failed", error);
    }
    context.locals.user = user;

    if (!user && pathname !== "/admin/login") return context.redirect("/admin/login");
  }

  const response = await next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (isAdmin) response.headers.set("Cache-Control", "no-store");
  return response;
});
