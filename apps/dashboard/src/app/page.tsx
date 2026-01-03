"use client";

import { Settings, Star, User } from "lucide-react";
import posthog from "posthog-js";

import { Button } from "@/components/ui/button";
import { useDrawerStack } from "@/hooks/use-drawer-stack";

export default function Home() {
  const { openDrawer, stack } = useDrawerStack();

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
          onClick={() => {
            posthog.capture("drawer_opened", { drawer_type: "profile" });
            openDrawer("profile");
          }}
          variant="outline"
        >
          <User className="mr-2 size-4" />
          Open Profile
        </Button>

        <Button
          onClick={() => {
            posthog.capture("drawer_opened", { drawer_type: "settings" });
            openDrawer("settings");
          }}
          variant="outline"
        >
          <Settings className="mr-2 size-4" />
          Open Settings
        </Button>

        <Button
          onClick={() => {
            posthog.capture("drawer_opened", { drawer_type: "account" });
            openDrawer("account");
          }}
          variant="outline"
        >
          <User className="mr-2 size-4" />
          Open Account
        </Button>

        <Button
          onClick={() => {
            posthog.capture("drawer_opened", {
              drawer_type: "rating",
              rating_type: "prof",
              rating_id: "123",
            });
            openDrawer("rating", { type: "prof", id: "123" });
          }}
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
