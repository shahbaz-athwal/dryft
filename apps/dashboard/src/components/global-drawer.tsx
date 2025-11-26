"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerNested,
} from "@/components/ui/drawer";
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
  const [prevKey, setPrevKey] = useState(currentKey);
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const hasClosedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setIsOpen(true);
    setIsClosing(false);
    hasClosedRef.current = false;
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentKey) {
    return null;
  }

  const CurrentDrawerComponent = DRAWER_REGISTRY[currentKey];
  const hasNext = index + 1 < stack.length;
  const isNested = index > 0;

  const performClose = () => {
    if (hasClosedRef.current) {
      return;
    }
    hasClosedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onCloseAtIndex(index);
  };

  const handleOpenChange = (open: boolean) => {
    if (open || isClosing) {
      return;
    }
    setIsClosing(true);
    setIsOpen(false);

    timeoutRef.current = setTimeout(performClose, 200);
  };

  const handleAnimationEnd = (open: boolean) => {
    if (open || !isClosing) {
      return;
    }
    performClose();
  };

  const handleClose = () => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
    setIsOpen(false);
  };

  const DrawerComponent = isNested ? DrawerNested : Drawer;

  return (
    <DrawerComponent
      direction="right"
      onAnimationEnd={handleAnimationEnd}
      onOpenChange={handleOpenChange}
      open={isOpen}
    >
      <DrawerContent className="w-[400px] rounded-l-3xl outline-none">
        <Suspense fallback={<DrawerLoadingFallback />}>
          <CurrentDrawerComponent
            onClose={handleClose}
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
    </DrawerComponent>
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
