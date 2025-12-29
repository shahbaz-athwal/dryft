"use client";

import { Settings, Star, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrawerStack } from "@/hooks/use-drawer-stack";

export default function Home() {
  const { openDrawer, loadDrawer, stack } = useDrawerStack();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl">Drawer Test</h1>
        <p className="text-muted-foreground text-sm">
          Test the recursive drawer functionality
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => openDrawer("profile")}
          onMouseEnter={() => loadDrawer("profile")}
          variant="outline"
        >
          <User className="mr-2 size-4" />
          Open Profile
        </Button>

        <Button
          onClick={() => openDrawer("settings")}
          onMouseEnter={() => loadDrawer("settings")}
          variant="outline"
        >
          <Settings className="mr-2 size-4" />
          Open Settings
        </Button>

        <Button
          onClick={() => openDrawer("account")}
          onMouseEnter={() => loadDrawer("account")}
          variant="outline"
        >
          <User className="mr-2 size-4" />
          Open Account
        </Button>

        <Button
          onClick={() => openDrawer("rating", { type: "prof", id: "123" })}
          onMouseEnter={() => loadDrawer("rating")}
          variant="outline"
        >
          <Star className="mr-2 size-4" />
          Open Rating
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          Drawer stack:{" "}
          {stack.length === 0 ? "Empty" : stack.map((s) => s.key).join(" → ")}
        </p>
      </div>

      <div className="max-w-md space-y-2 text-center text-muted-foreground text-sm">
        <p>
          <strong>Test 1:</strong> Open Profile → Open Settings from inside →
          Click outside to close all at once
        </p>
        <p>
          <strong>Test 2:</strong> Open nested drawers → Use back arrow button
          to navigate back one at a time
        </p>
      </div>
    </div>
  );
}
