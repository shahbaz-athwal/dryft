"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useDrawerStack } from "@/hooks/use-drawer-stack";
import { getDrawerComponent, hasProps } from "@/lib/drawer-registry";

function GlobalDrawer() {
  const { stack, pop, clearStack } = useDrawerStack();

  const isOpen = stack.length > 0;
  const currentItem = stack.at(-1);

  if (!currentItem) {
    return null;
  }

  const Component = getDrawerComponent(currentItem.key);
  const props = hasProps(currentItem) ? currentItem.props : {};
  const canGoBack = stack.length > 1;

  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => {
        if (!open) {
          clearStack();
        }
      }}
      open={isOpen}
    >
      <DrawerContent className="w-[520px] rounded-l-3xl outline-none">
        {canGoBack && (
          <Button
            className="absolute top-4 left-4 z-10"
            onClick={pop}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <Component {...props} />
      </DrawerContent>
    </Drawer>
  );
}

export { GlobalDrawer };
