"use client";

import { Suspense } from "react";

import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useDrawerStack } from "@/hooks/use-drawer-stack";
import { DRAWER_REGISTRY, type DrawerKey } from "@/lib/drawer-registry";

type DrawerComponentProps = {
  onClose: () => void;
  onCloseAll: () => void;
};

type RecursiveDrawerProps = {
  stack: DrawerKey[];
  index: number;
  onCloseAtIndex: (index: number) => void;
  onCloseAll: () => void;
};

function DrawerLoadingFallback() {
  return (
    <DrawerHeader className="flex items-center justify-center py-12">
      <Spinner />
    </DrawerHeader>
  );
}

function RecursiveDrawer({
  stack,
  index,
  onCloseAtIndex,
  onCloseAll,
}: RecursiveDrawerProps) {
  const currentKey = stack.at(index);

  if (!currentKey) {
    return null;
  }

  const CurrentDrawerComponent = DRAWER_REGISTRY[currentKey];
  const hasNext = index + 1 < stack.length;
  const isNested = index > 0;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCloseAtIndex(index);
    }
  };

  return (
    <Drawer nested={isNested} onOpenChange={handleOpenChange} open>
      <DrawerContent>
        <Suspense fallback={<DrawerLoadingFallback />}>
          <CurrentDrawerComponent
            onClose={() => onCloseAtIndex(index)}
            onCloseAll={onCloseAll}
          />
        </Suspense>
        {hasNext && (
          <RecursiveDrawer
            index={index + 1}
            onCloseAll={onCloseAll}
            onCloseAtIndex={onCloseAtIndex}
            stack={stack}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function GlobalDrawer() {
  const { stack, closeToIndex, closeAll } = useDrawerStack();

  if (stack.length === 0) {
    return null;
  }

  return (
    <RecursiveDrawer
      index={0}
      onCloseAll={closeAll}
      onCloseAtIndex={closeToIndex}
      stack={stack}
    />
  );
}

export { GlobalDrawer };
export type { DrawerComponentProps };
