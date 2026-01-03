"use client";

import { CreditCard, Key, Trash2, X } from "lucide-react";
import posthog from "posthog-js";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useDrawerStack } from "@/hooks/use-drawer-stack";

function AccountDrawer() {
  const { pop, clearStack } = useDrawerStack();
  const hasTrackedView = useRef(false);

  // Track drawer view once on first render
  if (!hasTrackedView.current) {
    posthog.capture("account_drawer_viewed");
    hasTrackedView.current = true;
  }

  return (
    <>
      <DrawerHeader className="relative">
        <DrawerClose asChild>
          <Button
            className="absolute top-2 right-2"
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerClose>
        <DrawerTitle>Account Settings</DrawerTitle>
        <DrawerDescription>
          Manage your account and billing information
        </DrawerDescription>
      </DrawerHeader>

      <Separator />

      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-3">
          <h3 className="font-medium text-muted-foreground text-sm">
            Account Management
          </h3>

          <button
            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
            onClick={() => posthog.capture("billing_clicked")}
            type="button"
          >
            <div className="rounded-lg border p-2">
              <CreditCard className="size-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-medium text-sm">Billing & Payments</p>
              <p className="text-muted-foreground text-xs">
                Manage your subscription and payment methods
              </p>
            </div>
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
            onClick={() => posthog.capture("password_security_clicked")}
            type="button"
          >
            <div className="rounded-lg border p-2">
              <Key className="size-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-medium text-sm">Password & Security</p>
              <p className="text-muted-foreground text-xs">
                Change password and manage login sessions
              </p>
            </div>
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-lg border border-destructive/20 p-3 text-left transition-colors hover:bg-destructive/10"
            onClick={() => posthog.capture("delete_account_clicked")}
            type="button"
          >
            <div className="rounded-lg border border-destructive/20 p-2">
              <Trash2 className="size-4 text-destructive" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-medium text-destructive text-sm">
                Delete Account
              </p>
              <p className="text-muted-foreground text-xs">
                Permanently delete your account and data
              </p>
            </div>
          </button>
        </div>
      </div>

      <DrawerFooter>
        <Button className="w-full" onClick={pop} variant="outline">
          Back
        </Button>
        <Button className="w-full" onClick={clearStack} variant="ghost">
          Close Drawer
        </Button>
      </DrawerFooter>
    </>
  );
}

export default AccountDrawer;
