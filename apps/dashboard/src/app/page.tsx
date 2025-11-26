"use client";

import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrawerStack } from "@/hooks/use-drawer-stack";

export default function Home() {
  const { open } = useDrawerStack();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={() => open("profile")}>
        <User className="mr-2 size-4" />
        Open Profile Drawer
      </Button>
    </div>
  );
}
