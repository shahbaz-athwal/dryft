"use client";

import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrawerStack } from "@/hooks/use-drawer-stack";

export default function Home() {
  const { openDrawer, loadDrawer } = useDrawerStack();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button
        onClick={() => openDrawer("profile", {})}
        onMouseOver={() => loadDrawer("profile")}
      >
        <User className="mr-2 size-4" />
        Open Profile Drawer
      </Button>
    </div>
  );
}
