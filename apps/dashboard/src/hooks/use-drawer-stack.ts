"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import type { DrawerKey } from "@/lib/drawer-registry";
import { isValidDrawerKey, preloadDrawer } from "@/lib/drawer-registry";

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

  async function closeAllDrawers() {
    // Get all indices and sort in descending order (close from inside-out)
    const indices = Array.from(closeRegistry.keys()).sort((a, b) => b - a);
    for (const index of indices) {
      const fn = closeRegistry.get(index);
      fn?.();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setStack([]);
  }

  function closeTopDrawer() {
    const topIndex = validStack.length - 1;
    if (topIndex < 0) {
      return;
    }
    closeRegistry.get(topIndex)?.();
  }

  function loadDrawer(key: DrawerKey) {
    preloadDrawer(key);
  }

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
