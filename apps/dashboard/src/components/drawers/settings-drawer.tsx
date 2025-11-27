"use client";

import { Bell, Moon, Shield, UserCog, X } from "lucide-react";

import type { DrawerComponentProps } from "@/components/global-drawer";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useDrawerStack } from "@/hooks/use-drawer-stack";

function SettingsDrawer({ onClose, onCloseAll }: DrawerComponentProps) {
  const { open } = useDrawerStack();
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
        <DrawerTitle>Settings</DrawerTitle>
        <DrawerDescription>Manage your account preferences</DrawerDescription>
      </DrawerHeader>

      <Separator />

      <div className="flex-1 space-y-6 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border p-2">
                <Bell className="size-4" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-muted-foreground text-xs">
                  Receive push notifications
                </p>
              </div>
            </div>
            <Switch defaultChecked id="notifications" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border p-2">
                <Moon className="size-4" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-muted-foreground text-xs">
                  Toggle dark theme
                </p>
              </div>
            </div>
            <Switch id="dark-mode" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border p-2">
                <Shield className="size-4" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Two-Factor Auth</Label>
                <p className="text-muted-foreground text-xs">
                  Enable 2FA for security
                </p>
              </div>
            </div>
            <Switch id="2fa" />
          </div>
        </div>

        <Separator />

        <Button
          className="w-full justify-start"
          onClick={() => open("account")}
          variant="outline"
        >
          <UserCog className="mr-2 size-4" />
          Manage Account
        </Button>
      </div>

      <DrawerFooter>
        <Button className="w-full">Save Changes</Button>
        <Button className="w-full" onClick={onClose} variant="outline">
          Close Settings
        </Button>
        <Button className="w-full" onClick={onCloseAll} variant="ghost">
          Close All Drawers
        </Button>
      </DrawerFooter>
    </>
  );
}

export default SettingsDrawer;
