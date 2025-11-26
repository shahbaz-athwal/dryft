"use client";

import { Settings, User, X } from "lucide-react";

import type { DrawerComponentProps } from "@/components/global-drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function ProfileDrawer({ onClose }: DrawerComponentProps) {
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
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage alt="User" src="https://github.com/shadcn.png" />
            <AvatarFallback>
              <User className="size-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <DrawerTitle className="text-xl">John Doe</DrawerTitle>
            <DrawerDescription>john.doe@example.com</DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <Separator />

      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-muted-foreground text-sm">
            Account Details
          </h3>
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Username</span>
              <span className="font-medium text-sm">@johndoe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Member since
              </span>
              <span className="font-medium text-sm">Jan 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Plan</span>
              <span className="font-medium text-sm">Pro</span>
            </div>
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button
          className="w-full"
          onClick={() => open("settings")}
          variant="outline"
        >
          <Settings className="mr-2 size-4" />
          Open Settings
        </Button>
        <Button className="w-full" onClick={onClose} variant="ghost">
          Close Profile
        </Button>
      </DrawerFooter>
    </>
  );
}

export default ProfileDrawer;
