"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type React from "react";

let convexClient: ConvexReactClient | null = null;

export function ConvexProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const url = "https://secret-eel-556.convex.cloud";
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
  }
  if (!convexClient) {
    convexClient = new ConvexReactClient(url);
  }
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
