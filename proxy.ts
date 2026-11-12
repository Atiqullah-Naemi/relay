import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import type { NextFetchEvent, NextRequest } from "next/server"

const isPublic = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/api/inngest(.*)",
])

const handler = clerkMiddleware(async (auth, request) => {
  if (!isPublic(request)) {
    await auth.protect()
  }
})

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return handler(request, event)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
}
