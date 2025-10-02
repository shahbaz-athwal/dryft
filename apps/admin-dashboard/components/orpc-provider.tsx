"use client";

import { createFetchClient } from "@orpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { orpc } from "@/lib/orpc";

export function ORPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [orpcClient] = useState(() =>
    createFetchClient({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/orpc`,
    })
  );

  return (
    <orpc.Provider client={orpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </orpc.Provider>
  );
}
