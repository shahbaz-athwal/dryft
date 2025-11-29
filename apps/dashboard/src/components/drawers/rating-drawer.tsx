"use client";

import { GraduationCap, Star, User, X } from "lucide-react";

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
import type { DrawerPropsMap } from "@/lib/drawer-registry";

type RatingDrawerProps = DrawerPropsMap["rating"];

function RatingDrawer({ type, id }: RatingDrawerProps) {
  const { closeTopDrawer } = useDrawerStack();

  const isCourse = type === "course";
  const Icon = isCourse ? GraduationCap : User;
  const title = isCourse ? "Rate Course" : "Rate Professor";
  const description = isCourse
    ? `Share your experience with course ${id}`
    : `Share your experience with professor ${id}`;

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
        <div className="flex items-center gap-3">
          <div className="rounded-lg border p-2">
            <Icon className="size-5" />
          </div>
          <div>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <Separator />

      <div className="flex-1 space-y-6 p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-muted-foreground text-sm">
            Overall Rating
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                className="rounded p-1 transition-colors hover:bg-muted"
                // biome-ignore lint/suspicious/noArrayIndexKey: ignore
                key={i}
                type="button"
              >
                <Star className="size-6 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-muted-foreground text-sm">Details</h3>
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Type</span>
              <span className="font-medium text-sm capitalize">{type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">ID</span>
              <span className="font-medium font-mono text-sm">{id}</span>
            </div>
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button className="w-full">Submit Rating</Button>
        <Button className="w-full" onClick={closeTopDrawer} variant="ghost">
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

export default RatingDrawer;
