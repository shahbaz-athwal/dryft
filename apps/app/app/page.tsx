"use client";

import { trpc } from "@/lib/trpc";

export default function Home() {
  const { data } = trpc.user.useQuery({ id: 1 });

  return <h1>{data?.name}</h1>;
}
