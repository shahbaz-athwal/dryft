"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import type { DrawerKey } from "@/lib/drawer-registry";
import { isValidDrawerKey } from "@/lib/drawer-registry";

const drawerParser = parseAsArrayOf(parseAsString).withDefault([]);

const closeRegistry = new Map<number, () => void>();

function useDrawerStack() {
  const [stack, setStack] = useQueryState("drawer", drawerParser);

  const validStack = stack.filter(isValidDrawerKey);

  function openDrawer(key: DrawerKey) {
    setStack((prev) => [...prev, key]);
  }

  function pop() {
    setStack((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      return prev.slice(0, -1);
    });
  }

  function closeAllDrawers() {
    for (const fn of closeRegistry.values()) {
      fn();
    }
  }

  function closeTopDrawer() {
    const topIndex = validStack.length - 1;
    if (topIndex < 0) {
      return;
    }
    const closeFn = closeRegistry.get(topIndex);
    closeFn?.();
  }

  function loadDrawer(key: DrawerKey) {}

  return {
    stack: validStack,
    openDrawer,
    pop,
    closeTopDrawer,
    closeAllDrawers,
    loadDrawer,
  };
}

function registerDrawerClose(index: number, closeFn: () => void) {
  closeRegistry.set(index, closeFn);
  return () => {
    closeRegistry.delete(index);
  };
}

export { registerDrawerClose, useDrawerStack };
